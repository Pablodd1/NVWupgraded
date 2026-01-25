import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  ClockIcon, 
  CalendarIcon, 
  UsersIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  SplitSquareVerticalIcon,
  DollarSignIcon
} from 'lucide-react';

interface SplitBookingDisplayProps {
  bookingData: {
    primaryBooking: any;
    splitBookings: any[];
    pricingBreakdown: {
      primaryBooking: number;
      splitBookings: number[];
      excessGuestPremium: number;
    };
    totalPrice: number;
    requiresApproval: boolean;
    message: string;
  };
  onManageBooking?: (bookingId: string) => void;
  onViewDetails?: (bookingId: string) => void;
}

export const SplitBookingDisplay: React.FC<SplitBookingDisplayProps> = ({
  bookingData,
  onManageBooking,
  onViewDetails
}) => {
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  const formatDate = (datetime: string | Date) => {
    const date = new Date(datetime);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderBookingCard = (booking: any, isPrimary: boolean = false, index: number = 0) => {
    const isExpanded = expandedBooking === booking._id;
    const wineryBooking = booking.wineries?.[0]; // Get first winery booking

    return (
      <Card key={booking._id} className={`mb-4 ${isPrimary ? 'border-blue-200 bg-blue-50' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              {isPrimary ? (
                <>
                  <CheckCircleIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Primary Booking
                </>
              ) : (
                <>
                  <SplitSquareVerticalIcon className="h-5 w-5 mr-2 text-amber-600" />
                  Split Booking #{index}
                </>
              )}
              <Badge className={`ml-2 ${getStatusColor(booking.status)}`}>
                {booking.status}
              </Badge>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedBooking(isExpanded ? null : booking._id)}
            >
              {isExpanded ? 'Hide' : 'Show'} Details
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <UsersIcon className="h-4 w-4 mr-1" />
                <span>Guests: {wineryBooking?.numberOfGuests}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span>{formatDate(wineryBooking?.datetime)}</span>
              </div>
            </div>

            {bookingData.requiresApproval && !isPrimary && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertDescription className="text-amber-800 text-sm">
                  This split booking requires winery owner approval.
                </AlertDescription>
              </Alert>
            )}

            {isExpanded && (
              <div className="mt-4 space-y-3 border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Booking ID:</span>
                    <div className="font-mono text-xs">{booking._id}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Payment Status:</span>
                    <div className="font-medium">{booking.paymentStatus || 'Pending'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <div className="font-bold">
                      ${isPrimary 
                        ? bookingData.pricingBreakdown.primaryBooking.toFixed(2)
                        : bookingData.pricingBreakdown.splitBookings[index - 1]?.toFixed(2) || '0.00'
                      }
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <div className="font-medium">
                      {formatDate(booking.createdAt)}
                    </div>
                  </div>
                </div>

                {booking.specialRequests && (
                  <div>
                    <span className="text-gray-600 text-sm">Special Requests:</span>
                    <p className="text-sm mt-1 bg-gray-50 p-2 rounded">
                      {booking.specialRequests}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2 pt-2">
                  {onManageBooking && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onManageBooking(booking._id)}
                    >
                      Manage
                    </Button>
                  )}
                  {onViewDetails && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDetails(booking._id)}
                    >
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Summary */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <SplitSquareVerticalIcon className="h-6 w-6 mr-2 text-purple-600" />
            Split Booking Summary
            {bookingData.requiresApproval && (
              <Badge className="ml-2 bg-amber-100 text-amber-800">
                Requires Approval
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-blue-200 bg-blue-50">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertDescription className="text-blue-800">
              {bookingData.message}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {bookingData.splitBookings.length + 1}
              </div>
              <div className="text-sm text-gray-600">Total Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${bookingData.totalPrice.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                ${bookingData.pricingBreakdown.excessGuestPremium.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Excess Premium</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          Booking Details
        </h3>

        {/* Primary Booking */}
        {renderBookingCard(bookingData.primaryBooking, true, 0)}

        {/* Split Bookings */}
        {bookingData.splitBookings.map((splitBooking, index) => 
          renderBookingCard(splitBooking, false, index + 1)
        )}
      </div>

      {/* Pricing Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSignIcon className="h-5 w-5 mr-2" />
            Pricing Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Primary Booking:</span>
              <span className="font-medium">
                ${bookingData.pricingBreakdown.primaryBooking.toFixed(2)}
              </span>
            </div>
            
            {bookingData.pricingBreakdown.splitBookings.map((price, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-600">Split Booking #{index + 1}:</span>
                <span className="font-medium">${price.toFixed(2)}</span>
              </div>
            ))}
            
            <Separator />
            
            <div className="flex justify-between text-amber-600">
              <span>Excess Guest Premium:</span>
              <span className="font-medium">
                +${bookingData.pricingBreakdown.excessGuestPremium.toFixed(2)}
              </span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between font-bold text-lg">
              <span>Total Price:</span>
              <span className="text-green-600">
                ${bookingData.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          <Alert className="border-amber-200 bg-amber-50">
            <DollarSignIcon className="h-4 w-4" />
            <AlertDescription className="text-amber-800 text-sm">
              The excess guest premium covers additional service costs and capacity management for splitting your group across multiple time slots.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button 
          variant="outline"
          onClick={() => window.print()}
          className="print:hidden"
        >
          Print Booking Details
        </Button>
        <Button 
          onClick={() => {
            // Share functionality could be implemented here
            navigator.clipboard.writeText(window.location.href);
            // Show toast notification
          }}
        >
          Share Booking
        </Button>
      </div>
    </div>
  );
};