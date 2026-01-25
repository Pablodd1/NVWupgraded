import mongoose from 'mongoose';
import Booking from '../models/booking.model';
import SlotInventory from '../models/slotInventory.model';
import Winery from '../models/winery.model';
import { sendNotification } from './notifications';

export interface ExcessGuestRequest {
  originalBooking: any;
  excessGuests: number;
  requestedDate: Date;
  requestedTimeSlot: string;
  customerId?: string;
  specialRequests?: string;
}

export interface SplitBookingResult {
  primaryBooking: any;
  splitBookings: any[];
  totalPrice: number;
  pricingBreakdown: {
    primaryBooking: number;
    splitBookings: number[];
    excessGuestPremium: number;
  };
  requiresApproval: boolean;
  message: string;
}

export interface DynamicPricingConfig {
  baseFee: number;
  additionalGuestFee: number;
  excessGuestMultiplier: number;
  weekendMultiplier: number;
}

class AdditionalGuestWorkflowService {
  /**
   * Process booking request that exceeds maximum guest limit
   */
  async processExcessGuestBooking(request: ExcessGuestRequest): Promise<SplitBookingResult> {
    try {
      const { originalBooking, excessGuests, requestedDate, requestedTimeSlot } = request;
      
      // Get winery details and pricing config
      const winery = await Winery.findById(originalBooking.wineryId);
      if (!winery) {
        throw new Error('Winery not found');
      }

      // Get the specific tasting info for pricing
      const tastingInfo = winery.tasting_info.find((t: any) => 
        t.available_times.includes(requestedTimeSlot)
      );
      
      if (!tastingInfo) {
        throw new Error('Tasting slot not available');
      }

      // Check current capacity for the requested slot
      const slotAvailability = await SlotInventory.checkAvailability(
        originalBooking.wineryId,
        requestedDate,
        requestedTimeSlot,
        originalBooking.numberOfGuests + excessGuests
      );

      // Calculate dynamic pricing
      const pricing = await this.calculateDynamicPricing(
        originalBooking,
        excessGuests,
        tastingInfo,
        requestedDate
      );

      // Create split bookings based on availability
      const splitResult = await this.createSplitBookings(
        originalBooking,
        excessGuests,
        requestedDate,
        requestedTimeSlot,
        pricing,
        !slotAvailability.available
      );

      // Send notifications
      await this.sendExcessGuestNotifications(
        request,
        splitResult,
        winery
      );

      return splitResult;
    } catch (error) {
      console.error('Error processing excess guest booking:', error);
      throw error;
    }
  }

  /**
   * Calculate dynamic pricing for excess guests
   */
  private async calculateDynamicPricing(
    booking: any,
    excessGuests: number,
    tastingInfo: any,
    requestedDate: Date
  ): Promise<DynamicPricingConfig> {
    const isWeekend = requestedDate.getDay() === 0 || requestedDate.getDay() === 6;
    const weekendMultiplier = tastingInfo.booking_info?.dynamic_pricing?.weekend_multiplier || 1.2;
    
    // Calculate capacity pressure (how full the slot is)
    const slot = await SlotInventory.findOne({
      wineryId: booking.wineryId,
      date: requestedDate,
      timeSlot: tastingInfo.available_times[0]
    });

    const capacityUtilization = slot ? (slot.bookedCapacity / slot.totalCapacity) : 0;
    const excessMultiplier = 1 + (excessGuests * 0.1) + (capacityUtilization * 0.2);

    const baseFee = tastingInfo.base_booking_fee || 0;
    const additionalGuestFee = tastingInfo.additional_guest_fee || 0;

    return {
      baseFee,
      additionalGuestFee,
      excessGuestMultiplier: Math.max(1, excessMultiplier),
      weekendMultiplier: isWeekend ? weekendMultiplier : 1
    };
  }

  /**
   * Create split bookings to accommodate excess guests
   */
  private async createSplitBookings(
    originalBooking: any,
    excessGuests: number,
    requestedDate: Date,
    requestedTimeSlot: string,
    pricing: DynamicPricingConfig,
    requiresApproval: boolean
  ): Promise<SplitBookingResult> {
    const maxGuestsPerSlot = await this.getMaxGuestsPerSlot(originalBooking.wineryId);
    
    // Create primary booking with max allowed guests
    const primaryGuests = Math.min(originalBooking.numberOfGuests, maxGuestsPerSlot);
    const remainingGuests = originalBooking.numberOfGuests - primaryGuests + excessGuests;

    // Calculate pricing for primary booking
    const primaryPrice = this.calculateBookingPrice(primaryGuests, pricing);
    
    // Create split bookings for remaining guests
    const splitBookings = [];
    const splitPrices = [];
    let guestsToAllocate = remainingGuests;
    let currentSlotIndex = 0;

    while (guestsToAllocate > 0) {
      const guestsInThisSlot = Math.min(guestsToAllocate, maxGuestsPerSlot);
      const alternativeSlot = await this.findAlternativeSlot(
        originalBooking.wineryId,
        requestedDate,
        requestedTimeSlot,
        currentSlotIndex
      );

      const splitBookingData = {
        wineries: [{
          wineryId: originalBooking.wineryId,
          datetime: alternativeSlot.date,
          tasting: originalBooking.tasting,
          numberOfGuests: guestsInThisSlot,
          status: 'pending'
        }],
        specialRequests: originalBooking.specialRequests,
        payment_method: originalBooking.payment_method,
        status: requiresApproval ? 'pending' : 'confirmed',
        isSplitBooking: true,
        parentBookingId: originalBooking._id,
        splitOrderIndex: currentSlotIndex + 1
      };

      const splitPrice = this.calculateBookingPrice(guestsInThisSlot, pricing);
      splitPrices.push(splitPrice);

      const splitBooking = new Booking(splitBookingData);
      await splitBooking.save();
      splitBookings.push(splitBooking);

      guestsToAllocate -= guestsInThisSlot;
      currentSlotIndex++;
    }

    // Update original booking to reflect primary guests only
    originalBooking.wineries[0].numberOfGuests = primaryGuests;
    originalBooking.totalPrice = primaryPrice;
    await originalBooking.save();

    // Calculate excess guest premium
    const excessGuestPremium = pricing.excessGuestMultiplier > 1 ? 
      (primaryPrice + splitPrices.reduce((a, b) => a + b, 0)) * (pricing.excessGuestMultiplier - 1) : 0;

    return {
      primaryBooking: originalBooking,
      splitBookings,
      totalPrice: primaryPrice + splitPrices.reduce((a, b) => a + b, 0) + excessGuestPremium,
      pricingBreakdown: {
        primaryBooking: primaryPrice,
        splitBookings: splitPrices,
        excessGuestPremium
      },
      requiresApproval,
      message: this.generateBookingMessage(primaryGuests, excessGuests, splitBookings.length, requiresApproval)
    };
  }

  /**
   * Calculate price for a booking with given number of guests
   */
  private calculateBookingPrice(guests: number, pricing: DynamicPricingConfig): number {
    const basePrice = pricing.baseFee;
    const guestPrice = (guests > 1 ? pricing.additionalGuestFee * (guests - 1) : 0);
    const subtotal = basePrice + guestPrice;
    
    return subtotal * pricing.excessGuestMultiplier * pricing.weekendMultiplier;
  }

  /**
   * Find alternative time slots for split bookings
   */
  private async findAlternativeSlot(
    wineryId: string,
    date: Date,
    preferredTimeSlot: string,
    index: number
  ): Promise<{ date: Date; timeSlot: string }> {
    // Try same day with different times first
    const winery = await Winery.findById(wineryId);
    const availableTimes = winery.tasting_info[0]?.available_times || [];
    
    // Rotate through available times
    const alternativeTimeIndex = (availableTimes.indexOf(preferredTimeSlot) + index + 1) % availableTimes.length;
    const alternativeTime = availableTimes[alternativeTimeIndex];

    return {
      date,
      timeSlot: alternativeTime
    };
  }

  /**
   * Get maximum guests allowed per slot
   */
  private async getMaxGuestsPerSlot(wineryId: string): Promise<number> {
    const winery = await Winery.findById(wineryId);
    return winery.tasting_info[0]?.booking_info?.max_guests_per_slot || 8;
  }

  /**
   * Send notifications for excess guest requests
   */
  private async sendExcessGuestNotifications(
    request: ExcessGuestRequest,
    result: SplitBookingResult,
    winery: any
  ): Promise<void> {
    const notifications = [
      // Winery owner notification
      {
        recipientId: winery.owner.toString(),
        type: 'excess_guest_request',
        title: 'Excess Guest Booking Request',
        message: `A booking request for ${request.originalBooking.numberOfGuests + request.excessGuests} guests exceeds your maximum limit. Split into ${result.splitBookings.length + 1} bookings.`,
        data: {
          bookingId: request.originalBooking._id,
          excessGuests: request.excessGuests,
          totalPrice: result.totalPrice,
          requiresApproval: result.requiresApproval
        }
      },
      // Customer notification
      ...(request.customerId ? [{
        recipientId: request.customerId,
        type: 'booking_split',
        title: 'Booking Split Due to Capacity',
        message: result.message,
        data: {
          primaryBooking: result.primaryBooking._id,
          splitBookings: result.splitBookings.map(b => b._id),
          totalPrice: result.totalPrice
        }
      }] : []),
      // Admin notification
      {
        recipientId: 'admin',
        type: 'excess_guest_alert',
        title: 'Excess Guest Booking Alert',
        message: `Winery "${winery.name}" has a booking exceeding capacity limits.`,
        data: {
          wineryId: winery._id,
          originalGuests: request.originalBooking.numberOfGuests,
          excessGuests: request.excessGuests,
          totalGuests: request.originalBooking.numberOfGuests + request.excessGuests
        }
      }
    ];

    for (const notification of notifications) {
      // Notification would be sent here - using console.log for now
      console.log('Notification sent:', notification);
    }
  }

  /**
   * Generate user-friendly booking message
   */
  private generateBookingMessage(
    primaryGuests: number,
    excessGuests: number,
    splitCount: number,
    requiresApproval: boolean
  ): string {
    let message = `Your booking for ${primaryGuests + excessGuests} guests has been split into ${splitCount + 1} separate bookings due to capacity limits.`;
    
    if (requiresApproval) {
      message += ' The additional bookings require winery approval.';
    }
    
    message += ` You will be charged a premium rate for the excess guests.`;
    
    return message;
  }
}

export default new AdditionalGuestWorkflowService();