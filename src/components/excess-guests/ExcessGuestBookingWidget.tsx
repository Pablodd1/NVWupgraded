import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

interface ExcessGuestBookingProps {
  wineryId: string;
  tastingId: string;
  initialGuestCount: number;
  onBookingComplete: (bookingData: any) => void;
  onCancel: () => void;
}

interface ExcessGuestResponse {
  capacityCheck: {
    withinLimit: boolean;
    excessGuests: number;
    availableCapacity: number;
    maxAllowed: number;
    canAccommodate: boolean;
    suggestedAlternatives: Array<{
      date: string;
      timeSlot: string;
      availableCapacity: number;
      distanceInHours: number;
    }>;
  };
  pricing: {
    basePrice: number;
    dynamicAdjustments: Array<{
      ruleName: string;
      adjustment: number;
      amount: number;
    }>;
    totalPrice: number;
    breakdown: {
      baseFee: number;
      guestFees: number;
      excessPremium: number;
      dynamicMultiplier: number;
    };
    appliedRules: string[];
  };
  wineryInfo: {
    name: string;
    maxGuestsPerSlot: number;
    baseFee: number;
    additionalGuestFee: number;
  };
}

export const ExcessGuestBookingWidget: React.FC<ExcessGuestBookingProps> = ({
  wineryId,
  tastingId,
  initialGuestCount,
  onBookingComplete,
  onCancel
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(initialGuestCount);
  const [loading, setLoading] = useState<boolean>(false);
  const [excessResponse, setExcessResponse] = useState<ExcessGuestResponse | null>(null);
  const [processingBooking, setProcessingBooking] = useState<boolean>(false);

  // Check capacity and pricing when inputs change
  useEffect(() => {
    if (selectedDate && selectedTimeSlot && guestCount > 0) {
      checkCapacityAndPricing();
    }
  }, [selectedDate, selectedTimeSlot, guestCount]);

  const checkCapacityAndPricing = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/excess-guests?wineryId=${wineryId}&date=${selectedDate}&timeSlot=${selectedTimeSlot}&guestCount=${guestCount}&simulate=true`
      );
      
      if (response.ok) {
        const data = await response.json();
        setExcessResponse(data);
      } else {
        throw new Error('Failed to check capacity');
      }
    } catch (error) {
      console.error('Error checking capacity:', error);
      toast({
        title: 'Error',
        description: 'Failed to check availability and pricing',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!excessResponse) return;

    setProcessingBooking(true);
    try {
      const bookingData = {
        wineryId,
        requestedDate: selectedDate,
        timeSlot: selectedTimeSlot,
        requestedGuests: guestCount,
        userId: 'current-user-id', // This would come from auth context
        specialRequests: '',
        tastingId
      };

      const response = await fetch('/api/excess-guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          toast({
            title: 'Booking Successful',
            description: result.message
          });
          
          onBookingComplete(result);
        }
      } else {
        throw new Error('Booking failed');
      }
    } catch (error) {
      console.error('Error processing booking:', error);
      toast({
        title: 'Booking Error',
        description: 'Failed to process your booking',
        variant: 'destructive'
      });
    } finally {
      setProcessingBooking(false);
    }
  };

  const renderCapacityStatus = () => {
    if (!excessResponse) return null;

    const { capacityCheck } = excessResponse;
    
    if (capacityCheck.withinLimit) {
      return (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            ✓ Your booking for {guestCount} guests is within the capacity limits.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        <Alert className="border-orange-200 bg-orange-50">
          <AlertDescription className="text-orange-800">
            ⚠️ Your request for {guestCount} guests exceeds the maximum of {capacityCheck.maxAllowed} guests per time slot.
            The excess {capacityCheck.excessGuests} guests will be split into separate time slots.
          </AlertDescription>
        </Alert>

        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            💡 Alternative time slots are available. Consider splitting your group across multiple times for better pricing.
          </AlertDescription>
        </Alert>
      </div>
    );
  };

  const renderPricingBreakdown = () => {
    if (!excessResponse) return null;

    const { pricing } = excessResponse;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Pricing Details
            {pricing.appliedRules.length > 0 && (
              <Badge variant="secondary">
                {pricing.appliedRules.length} dynamic rules applied
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Base Fee:</span>
              <div className="font-semibold">${pricing.breakdown.baseFee.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-gray-600">Guest Fees:</span>
              <div className="font-semibold">${pricing.breakdown.guestFees.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-gray-600">Excess Guest Premium:</span>
              <div className="font-semibold text-orange-600">${pricing.breakdown.excessPremium.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-gray-600">Price Multiplier:</span>
              <div className="font-semibold">{pricing.breakdown.dynamicMultiplier.toFixed(2)}x</div>
            </div>
          </div>

          {pricing.dynamicAdjustments.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Dynamic Pricing Adjustments:</h4>
              <div className="space-y-1">
                {pricing.dynamicAdjustments.map((adj, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{adj.ruleName}:</span>
                    <span className="font-medium">+${adj.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Total Price:</span>
              <span className="text-2xl font-bold text-green-600">
                ${pricing.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAlternativeSlots = () => {
    if (!excessResponse?.capacityCheck.suggestedAlternatives.length) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Alternative Time Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {excessResponse.capacityCheck.suggestedAlternatives.slice(0, 3).map((alt, index) => (
              <div 
                key={index}
                className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelectedTimeSlot(alt.timeSlot);
                  toast({
                    title: 'Time Slot Selected',
                    description: `Changed to ${alt.timeSlot}`
                  });
                }}
              >
                <div>
                  <div className="font-medium">{alt.timeSlot}</div>
                  <div className="text-sm text-gray-600">
                    {alt.distanceInHours < 24 
                      ? `${alt.distanceInHours} hours away`
                      : `${Math.round(alt.distanceInHours / 24)} days away`
                    }
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{alt.availableCapacity} spots</div>
                  <div className="text-sm text-green-600">Available</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Complete Your Booking</h2>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <Tabs defaultValue="booking" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="booking">Booking Details</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
        </TabsList>

        <TabsContent value="booking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time Slot</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  >
                    <option value="">Select time</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Number of Guests</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  max={50}
                />
              </div>

              {excessResponse && (
                <div className="space-y-2">
                  {renderCapacityStatus()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          {renderPricingBreakdown()}
        </TabsContent>

        <TabsContent value="alternatives" className="space-y-4">
          {renderAlternativeSlots()}
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center pt-6 border-t">
        <div className="text-sm text-gray-600">
          {excessResponse && (
            <span>
              {excessResponse.capacityCheck.withinLimit 
                ? 'Standard booking confirmed'
                : `Split booking: ${excessResponse.capacityCheck.excessGuests} excess guests will be accommodated`
              }
            </span>
          )}
        </div>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={checkCapacityAndPricing}
            disabled={loading || !selectedDate || !selectedTimeSlot}
          >
            {loading ? 'Checking...' : 'Update Pricing'}
          </Button>
          <Button 
            onClick={handleBooking}
            disabled={!excessResponse || processingBooking || !selectedDate || !selectedTimeSlot}
          >
            {processingBooking ? 'Processing...' : 'Confirm Booking'}
          </Button>
        </div>
      </div>
    </div>
  );
};