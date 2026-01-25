import mongoose from 'mongoose';
import SlotInventory from '../models/slotInventory.model';
import Winery from '../models/winery.model';

export interface CapacityCheckResult {
  withinLimit: boolean;
  excessGuests: number;
  availableCapacity: number;
  maxAllowed: number;
  canAccommodate: boolean;
  suggestedAlternatives: TimeSlotAlternative[];
}

export interface TimeSlotAlternative {
  date: Date;
  timeSlot: string;
  availableCapacity: number;
  distanceInHours: number;
}

class ExcessGuestDetectionService {
  /**
   * Check if booking request exceeds maximum allowed guests
   */
  async checkGuestLimit(
    wineryId: mongoose.Types.ObjectId,
    date: Date,
    timeSlot: string,
    requestedGuests: number
  ): Promise<CapacityCheckResult> {
    try {
      // Get winery configuration
      const winery = await Winery.findById(wineryId);
      if (!winery) {
        throw new Error('Winery not found');
      }

      const tastingInfo = winery.tasting_info[0]; // Assuming first tasting for now
      const maxGuestsPerSlot = tastingInfo?.booking_info?.max_guests_per_slot || 8;

      // Get current slot capacity
      const slot = await SlotInventory.findOne({
        wineryId,
        date,
        timeSlot
      });

      const availableCapacity = slot ? slot.availableCapacity : 0;
      const excessGuests = Math.max(0, requestedGuests - maxGuestsPerSlot);
      const canAccommodate = availableCapacity >= requestedGuests;

      // Find alternative slots if needed
      let suggestedAlternatives: TimeSlotAlternative[] = [];
      if (excessGuests > 0 || !canAccommodate) {
        suggestedAlternatives = await this.findAlternativeSlots(
          wineryId,
          date,
          timeSlot,
          requestedGuests,
          tastingInfo.available_times
        );
      }

      return {
        withinLimit: excessGuests === 0 && canAccommodate,
        excessGuests,
        availableCapacity,
        maxAllowed: maxGuestsPerSlot,
        canAccommodate,
        suggestedAlternatives
      };
    } catch (error) {
      console.error('Error checking guest limit:', error);
      throw error;
    }
  }

  /**
   * Detect if any active bookings are exceeding limits
   */
  async detectExceedingBookings(wineryId?: mongoose.Types.ObjectId): Promise<any[]> {
    try {
      const matchStage = wineryId ? { 'wineries.wineryId': wineryId } : {};
      
      const pipeline = [
        { $match: matchStage },
        { $unwind: '$wineries' },
        {
          $lookup: {
            from: 'wineries',
            localField: 'wineries.wineryId',
            foreignField: '_id',
            as: 'wineryInfo'
          }
        },
        { $unwind: '$wineryInfo' },
        {
          $lookup: {
            from: 'slotinventories',
            let: {
              wineryId: '$wineries.wineryId',
              date: '$wineries.datetime',
              timeSlot: { $dateToString: { format: '%H:%M', date: '$wineries.datetime' } }
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$wineryId', '$$wineryId'] },
                      { $eq: ['$date', { $dateToString: { format: '%Y-%m-%d', date: '$$date' } }] },
                      { $eq: ['$timeSlot', '$$timeSlot'] }
                    ]
                  }
                }
              }
            ],
            as: 'slotInfo'
          }
        },
        { $unwind: { path: '$slotInfo', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            bookingId: '$_id',
            wineryId: '$wineries.wineryId',
            wineryName: '$wineryInfo.name',
            datetime: '$wineries.datetime',
            requestedGuests: '$wineries.numberOfGuests',
            maxAllowed: { $arrayElemAt: ['$wineryInfo.tasting_info.booking_info.max_guests_per_slot', 0] },
            availableCapacity: { $ifNull: ['$slotInfo.availableCapacity', 0] },
            status: '$wineries.status'
          }
        },
        {
          $addFields: {
            excessGuests: {
              $max: [0, { $subtract: ['$requestedGuests', { $ifNull: ['$maxAllowed', 8] }] }]
            },
            isExceeding: {
              $or: [
                { $gt: ['$requestedGuests', { $ifNull: ['$maxAllowed', 8] }] },
                { $gt: ['$requestedGuests', '$availableCapacity'] }
              ]
            }
          }
        },
        { $match: { isExceeding: true } }
      ];

      const results = await mongoose.connection.db.collection('bookings').aggregate(pipeline).toArray();
      return results;
    } catch (error) {
      console.error('Error detecting exceeding bookings:', error);
      throw error;
    }
  }

  /**
   * Find alternative time slots for excess guests
   */
  private async findAlternativeSlots(
    wineryId: mongoose.Types.ObjectId,
    originalDate: Date,
    originalTimeSlot: string,
    requiredGuests: number,
    availableTimes: string[]
  ): Promise<TimeSlotAlternative[]> {
    const alternatives: TimeSlotAlternative[] = [];
    const maxAlternatives = 5;

    // Try different time slots on the same day
    for (let i = 0; i < availableTimes.length && alternatives.length < maxAlternatives; i++) {
      if (availableTimes[i] === originalTimeSlot) continue;

      const slot = await SlotInventory.findOne({
        wineryId,
        date: originalDate,
        timeSlot: availableTimes[i]
      });

      if (slot && slot.availableCapacity >= requiredGuests) {
        const timeDiff = this.getTimeDifference(originalTimeSlot, availableTimes[i]);
        alternatives.push({
          date: originalDate,
          timeSlot: availableTimes[i],
          availableCapacity: slot.availableCapacity,
          distanceInHours: timeDiff
        });
      }
    }

    // If not enough alternatives on same day, try adjacent days
    if (alternatives.length < maxAlternatives) {
      for (let dayOffset = 1; dayOffset <= 3; dayOffset++) {
        const futureDate = new Date(originalDate);
        futureDate.setDate(futureDate.getDate() + dayOffset);

        for (const timeSlot of availableTimes) {
          if (alternatives.length >= maxAlternatives) break;

          const slot = await SlotInventory.findOne({
            wineryId,
            date: futureDate,
            timeSlot
          });

          if (slot && slot.availableCapacity >= requiredGuests) {
            const timeDiff = 24 * dayOffset; // Days converted to hours
            alternatives.push({
              date: futureDate,
              timeSlot,
              availableCapacity: slot.availableCapacity,
              distanceInHours: timeDiff
            });
          }
        }
      }
    }

    return alternatives.sort((a, b) => a.distanceInHours - b.distanceInHours);
  }

  /**
   * Calculate time difference in hours between two time slots
   */
  private getTimeDifference(time1: string, time2: string): number {
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);
    
    const totalMinutes1 = hours1 * 60 + minutes1;
    const totalMinutes2 = hours2 * 60 + minutes2;
    
    return Math.abs(totalMinutes2 - totalMinutes1) / 60;
  }

  /**
   * Monitor and flag bookings that are approaching or exceeding limits
   */
  async monitorCapacityLimits(): Promise<{
    criticalExceedances: any[];
    warningBookings: any[];
    summary: {
      totalBookings: number;
      exceedingBookings: number;
      approachingCapacityBookings: number;
    };
  }> {
    try {
      const exceeding = await this.detectExceedingBookings();
      
      // Find bookings approaching capacity (using 80% threshold)
      const pipeline = [
        { $unwind: '$wineries' },
        {
          $lookup: {
            from: 'wineries',
            localField: 'wineries.wineryId',
            foreignField: '_id',
            as: 'wineryInfo'
          }
        },
        { $unwind: '$wineryInfo' },
        {
          $lookup: {
            from: 'slotinventories',
            let: {
              wineryId: '$wineries.wineryId',
              date: '$wineries.datetime',
              timeSlot: { $dateToString: { format: '%H:%M', date: '$wineries.datetime' } }
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$wineryId', '$$wineryId'] },
                      { $eq: ['$date', { $dateToString: { format: '%Y-%m-%d', date: '$$date' } }] },
                      { $eq: ['$timeSlot', '$$timeSlot'] }
                    ]
                  }
                }
              }
            ],
            as: 'slotInfo'
          }
        },
        { $unwind: { path: '$slotInfo', preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            capacityUtilization: {
              $cond: {
                if: { $gt: ['$slotInfo.totalCapacity', 0] },
                then: { $divide: ['$slotInfo.bookedCapacity', '$slotInfo.totalCapacity'] },
                else: 0
              }
            }
          }
        },
        {
          $match: {
            'wineries.status': { $ne: 'cancelled' },
            capacityUtilization: { $gte: 0.8 }
          }
        },
        {
          $project: {
            bookingId: '$_id',
            wineryName: '$wineryInfo.name',
            datetime: '$wineries.datetime',
            requestedGuests: '$wineries.numberOfGuests',
            capacityUtilization: { $multiply: ['$capacityUtilization', 100] },
            availableCapacity: '$slotInfo.availableCapacity',
            status: '$wineries.status'
          }
        }
      ];

      const approaching = await mongoose.connection.db.collection('bookings').aggregate(pipeline).toArray();
      
      const totalBookings = await mongoose.connection.db.collection('bookings').countDocuments();
      
      return {
        criticalExceedances: exceeding,
        warningBookings: approaching.filter(b => b.capacityUtilization >= 80 && b.capacityUtilization < 100),
        summary: {
          totalBookings,
          exceedingBookings: exceeding.length,
          approachingCapacityBookings: approaching.length
        }
      };
    } catch (error) {
      console.error('Error monitoring capacity limits:', error);
      throw error;
    }
  }
}

export default new ExcessGuestDetectionService();