import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import mongoose from 'mongoose';
import Winery from '@/models/winery.model';
import SlotInventory from '@/models/slotInventory.model';
import Booking from '@/models/booking.model';
import AdditionalGuestWorkflowService from '@/lib/additionalGuestWorkflow';
import ExcessGuestDetectionService from '@/lib/excessGuestDetection';
import DynamicPricingService from '@/lib/dynamicPricing';

// POST - Handle booking request with excess guests
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const {
      wineryId,
      requestedDate,
      timeSlot,
      requestedGuests,
      userId,
      specialRequests,
      tastingId
    } = body;

    // Validate input
    if (!wineryId || !requestedDate || !timeSlot || !requestedGuests || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if booking exceeds guest limits
    const capacityCheck = await ExcessGuestDetectionService.checkGuestLimit(
      new mongoose.Types.ObjectId(wineryId),
      new Date(requestedDate),
      timeSlot,
      requestedGuests
    );

    // If within limits, proceed with normal booking
    if (capacityCheck.withinLimit) {
      // Create standard booking
      const standardBooking = await Booking.create({
        userId: new mongoose.Types.ObjectId(userId),
        wineries: [{
          wineryId: new mongoose.Types.ObjectId(wineryId),
          datetime: new Date(`${requestedDate}T${timeSlot}:00`),
          tasting: tastingId,
          numberOfGuests: requestedGuests,
          status: 'pending'
        }],
        specialRequests,
        payment_method: 'pay_winery',
        status: 'pending'
      });

      return NextResponse.json({
        success: true,
        type: 'standard',
        booking: standardBooking,
        message: 'Standard booking created successfully'
      });
    }

    // Process excess guest booking
    const originalBookingData = {
      wineries: [{
        wineryId: new mongoose.Types.ObjectId(wineryId),
        datetime: new Date(`${requestedDate}T${timeSlot}:00`),
        tasting: tastingId,
        numberOfGuests: requestedGuests,
        status: 'pending'
      }],
      specialRequests,
      payment_method: 'pay_winery',
      status: 'pending'
    };

    const tempBooking = await Booking.create(originalBookingData);

    const excessRequest = {
      originalBooking: tempBooking,
      excessGuests: capacityCheck.excessGuests,
      requestedDate: new Date(requestedDate),
      requestedTimeSlot: timeSlot,
      customerId: userId,
      specialRequests
    };

    const result = await AdditionalGuestWorkflowService.processExcessGuestBooking(excessRequest);

    return NextResponse.json({
      success: true,
      type: 'excess_guest_split',
      result,
      capacityCheck,
      message: 'Booking successfully split due to excess guests'
    });

  } catch (error) {
    console.error('Error processing excess guest booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Check capacity and pricing for excess guests
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const wineryId = searchParams.get('wineryId');
    const date = searchParams.get('date');
    const timeSlot = searchParams.get('timeSlot');
    const guestCount = searchParams.get('guestCount');
    const simulate = searchParams.get('simulate') === 'true';

    if (!wineryId || !date || !timeSlot || !guestCount) {
      return NextResponse.json(
        { error: 'Missing required query parameters' },
        { status: 400 }
      );
    }

    const requestedGuests = parseInt(guestCount);
    if (isNaN(requestedGuests)) {
      return NextResponse.json(
        { error: 'Invalid guest count' },
        { status: 400 }
      );
    }

    // Check capacity
    const capacityCheck = await ExcessGuestDetectionService.checkGuestLimit(
      new mongoose.Types.ObjectId(wineryId),
      new Date(date),
      timeSlot,
      requestedGuests
    );

    // Get winery pricing info
    const winery = await Winery.findById(wineryId);
    if (!winery) {
      return NextResponse.json(
        { error: 'Winery not found' },
        { status: 404 }
      );
    }

    const tastingInfo = winery.tasting_info[0]; // Simplified - use first tasting
    const baseFee = tastingInfo?.base_booking_fee || 0;
    const additionalGuestFee = tastingInfo?.additional_guest_fee || 0;

    // Calculate pricing
    const pricing = await DynamicPricingService.calculateDynamicPrice(
      baseFee,
      additionalGuestFee,
      requestedGuests,
      capacityCheck.excessGuests,
      1 - (capacityCheck.availableCapacity / capacityCheck.maxAllowed), // Estimate capacity utilization
      new Date(date),
      timeSlot,
      false
    );

    // Simulation for multiple scenarios
    let simulations = null;
    if (simulate) {
      simulations = await DynamicPricingService.simulatePricing(
        baseFee,
        additionalGuestFee,
        [
          {
            guestCount: Math.max(1, requestedGuests - 2),
            excessGuests: Math.max(0, capacityCheck.excessGuests - 2),
            capacityUtilization: 0.5,
            bookingDate: new Date(date),
            bookingTime: timeSlot
          },
          {
            guestCount: requestedGuests,
            excessGuests: capacityCheck.excessGuests,
            capacityUtilization: 0.8,
            bookingDate: new Date(date),
            bookingTime: timeSlot
          },
          {
            guestCount: requestedGuests + 2,
            excessGuests: capacityCheck.excessGuests + 2,
            capacityUtilization: 0.9,
            bookingDate: new Date(date),
            bookingTime: timeSlot
          }
        ]
      );
    }

    return NextResponse.json({
      success: true,
      capacityCheck,
      pricing,
      wineryInfo: {
        name: winery.name,
        maxGuestsPerSlot: capacityCheck.maxAllowed,
        baseFee,
        additionalGuestFee
      },
      simulations
    });

  } catch (error) {
    console.error('Error checking excess guest capacity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}