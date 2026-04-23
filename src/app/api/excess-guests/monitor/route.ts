import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import mongoose from 'mongoose';
import ExcessGuestDetectionService from '@/lib/excessGuestDetection';
import DynamicPricingService from '@/lib/dynamicPricing';
import Booking from '@/models/booking.model';

// GET - Monitor exceeding bookings and capacity alerts
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const wineryId = searchParams.get('wineryId');
    const reportType = searchParams.get('reportType') || 'summary'; // 'summary', 'detailed', 'critical'
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Monitor capacity limits
    const monitorResults = await ExcessGuestDetectionService.monitorCapacityLimits();

    // Filter by winery if specified
    let filteredResults = monitorResults;
    if (wineryId) {
      filteredResults = {
        criticalExceedances: monitorResults.criticalExceedances.filter(
          booking => booking.wineryId.toString() === wineryId
        ),
        warningBookings: monitorResults.warningBookings.filter(
          booking => booking.wineryId.toString() === wineryId
        ),
        summary: {
          totalBookings: monitorResults.summary.totalBookings,
          exceedingBookings: filteredResults.criticalExceedances.length,
          approachingCapacityBookings: filteredResults.warningBookings.length
        }
      };
    }

    // Generate different report types
    let responseData;
    switch (reportType) {
      case 'detailed':
        responseData = {
          ...filteredResults,
          alerts: generateAlerts(filteredResults),
          recommendations: generateRecommendations(filteredResults)
        };
        break;

      case 'critical':
        responseData = {
          criticalBookings: filteredResults.criticalExceedances,
          urgentAlerts: generateUrgentAlerts(filteredResults),
          actionItems: generateActionItems(filteredResults)
        };
        break;

      case 'summary':
      default:
        responseData = filteredResults;
        break;
    }

    // Add pricing analytics if requested
    const includePricing = searchParams.get('includePricing') === 'true';
    if (includePricing && wineryId) {
      const pricingHistory = await DynamicPricingService.getPricingHistory(
        wineryId,
        startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate ? new Date(endDate) : new Date()
      );

      return NextResponse.json({
        success: true,
        data: {
          ...responseData,
          pricingAnalytics: {
            history: pricingHistory,
            insights: generatePricingInsights(pricingHistory)
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error monitoring exceeding bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Send manual notifications for exceeding bookings
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const {
      bookingIds,
      notificationType, // 'owner', 'customer', 'admin', 'all'
      customMessage,
      urgencyLevel // 'low', 'medium', 'high', 'critical'
    } = body;

    if (!bookingIds || bookingIds.length === 0) {
      return NextResponse.json(
        { error: 'No booking IDs provided' },
        { status: 400 }
      );
    }

    // Get bookings with full details
    const bookings = await Booking.find({
      '_id': { $in: bookingIds.map((id: string) => new mongoose.Types.ObjectId(id)) }
    }).populate('userId wineries.wineryId');

    const notifications = [];

    for (const booking of bookings) {
      for (const wineryBooking of booking.wineries) {
        const winery = wineryBooking.wineryId;

        // Owner notification
        if (['owner', 'all'].includes(notificationType)) {
          notifications.push({
            recipientId: winery.owner.toString(),
            type: 'capacity_alert',
            title: `Capacity ${urgencyLevel.toUpperCase()} Alert`,
            message: customMessage || `Booking ${booking._id} exceeds capacity limits.`,
            data: {
              bookingId: booking._id,
              wineryId: winery._id,
              urgencyLevel,
              guestCount: wineryBooking.numberOfGuests
            }
          });
        }

        // Customer notification
        if (['customer', 'all'].includes(notificationType) && booking.userId) {
          notifications.push({
            recipientId: booking.userId.toString(),
            type: 'booking_update',
            title: 'Booking Capacity Update',
            message: customMessage || 'Your booking requires attention due to capacity constraints.',
            data: {
              bookingId: booking._id,
              urgencyLevel
            }
          });
        }

        // Admin notification
        if (['admin', 'all'].includes(notificationType)) {
          notifications.push({
            recipientId: 'admin',
            type: 'system_alert',
            title: `System Capacity Alert - ${urgencyLevel}`,
            message: `Winery "${winery.name}" has capacity issues with booking ${booking._id}.`,
            data: {
              bookingId: booking._id,
              wineryId: winery._id,
              urgencyLevel
            }
          });
        }
      }
    }

    // Send notifications (would integrate with your notification service)
    const notificationResults = await Promise.allSettled(
      notifications.map(async (notif) => {
        // This would integrate with your sendNotification function
        // For now, we'll simulate the send
        return {
          success: true,
          notificationId: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          recipientId: notif.recipientId,
          type: notif.type
        };
      })
    );

    return NextResponse.json({
      success: true,
      notificationsSent: notificationResults.filter(r => r.status === 'fulfilled').length,
      notificationsFailed: notificationResults.filter(r => r.status === 'rejected').length,
      results: notificationResults.map(r => r.status === 'fulfilled' ? r.value : r.reason)
    });

  } catch (error) {
    console.error('Error sending manual notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateAlerts(monitorResults: any) {
  const alerts = [];

  // Critical alerts for exceeding bookings
  for (const booking of monitorResults.criticalExceedances) {
    alerts.push({
      type: 'critical',
      title: 'Booking Exceeds Maximum Capacity',
      message: `Booking ${booking.bookingId} has ${booking.requestedGuests} guests (max: ${booking.maxAllowed})`,
      wineryId: booking.wineryId,
      bookingId: booking.bookingId,
      severity: 'high',
      action: 'immediate'
    });
  }

  // Warning alerts for approaching capacity
  for (const booking of monitorResults.warningBookings) {
    alerts.push({
      type: 'warning',
      title: 'Booking Approaching Capacity Limit',
      message: `Booking ${booking.bookingId} at ${booking.capacityUtilization.toFixed(1)}% capacity`,
      wineryId: booking.wineryId,
      bookingId: booking.bookingId,
      severity: 'medium',
      action: 'monitor'
    });
  }

  return alerts;
}

function generateRecommendations(monitorResults: any) {
  const recommendations = [];

  if (monitorResults.criticalExceedances.length > 0) {
    recommendations.push({
      type: 'immediate',
      title: 'Address Exceeding Bookings',
      description: `Split ${monitorResults.criticalExceedances.length} bookings that exceed capacity limits`,
      priority: 'high'
    });
  }

  if (monitorResults.warningBookings.length > 0) {
    recommendations.push({
      type: 'preventive',
      title: 'Monitor Capacity Utilization',
      description: `${monitorResults.warningBookings.length} bookings are approaching capacity limits`,
      priority: 'medium'
    });
  }

  recommendations.push({
    type: 'strategic',
    title: 'Review Dynamic Pricing Rules',
    description: 'Consider adjusting pricing rules to manage demand during peak times',
    priority: 'low'
  });

  return recommendations;
}

function generateUrgentAlerts(monitorResults: any) {
  return monitorResults.criticalExceedances.map((booking: any) => ({
    bookingId: booking.bookingId,
    wineryId: booking.wineryId,
    wineryName: booking.wineryName,
    excessGuests: booking.excessGuests,
    urgency: booking.excessGuests > 3 ? 'critical' : 'high',
    recommendedAction: 'split_booking',
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }));
}

function generateActionItems(monitorResults: any) {
  const actionItems = [];

  for (const booking of monitorResults.criticalExceedances) {
    actionItems.push({
      bookingId: booking.bookingId,
      action: 'split_booking',
      description: `Split booking for ${booking.requestedGuests} guests into multiple slots`,
      assignee: 'winery_owner',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: 'pending'
    });
  }

  return actionItems;
}

function generatePricingInsights(pricingHistory: any[]) {
  // Simple analytics - would be more sophisticated in production
  const totalBookings = pricingHistory.length;
  const excessGuestBookings = pricingHistory.filter(h => h.excessGuests > 0).length;
  const avgMultiplier = pricingHistory.reduce((sum, h) => sum + (h.finalPrice / h.basePrice), 0) / totalBookings;

  return {
    totalBookings,
    excessGuestPercentage: (excessGuestBookings / totalBookings) * 100,
    averagePriceMultiplier: avgMultiplier,
    mostCommonRule: 'weekend-premium', // Simplified - would analyze actual rules
    revenueImpact: pricingHistory.reduce((sum, h) => sum + (h.finalPrice - h.basePrice), 0)
  };
}