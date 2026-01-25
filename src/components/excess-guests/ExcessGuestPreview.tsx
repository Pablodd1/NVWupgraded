import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { 
  InfoIcon, 
  AlertTriangleIcon, 
  TrendingUpIcon,
  UsersIcon,
  DollarSignIcon 
} from 'lucide-react';

interface ExcessGuestPreviewProps {
  wineryId: string;
  tastingId: string;
  baseFee: number;
  additionalGuestFee: number;
  maxGuestsPerSlot: number;
  allowExcessGuests: boolean;
  excessGuestMultiplier: number;
}

interface PricingPreview {
  guestCount: number;
  excessGuests: number;
  totalPrice: number;
  perPersonPrice: number;
  requiresSplit: boolean;
  dynamicAdjustments: Array<{
    ruleName: string;
    amount: number;
  }>;
}

export const ExcessGuestPreview: React.FC<ExcessGuestPreviewProps> = ({
  wineryId,
  tastingId,
  baseFee,
  additionalGuestFee,
  maxGuestsPerSlot,
  allowExcessGuests,
  excessGuestMultiplier
}) => {
  const [guestCount, setGuestCount] = useState<number>(2);
  const [previewData, setPreviewData] = useState<PricingPreview | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (guestCount > 0) {
      generatePreview();
    }
  }, [guestCount, allowExcessGuests]);

  const generatePreview = async () => {
    setLoading(true);
    try {
      // Get tomorrow's date for preview
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      const timeSlot = '11:00';

      const response = await fetch(
        `/api/excess-guests?wineryId=${wineryId}&date=${dateStr}&timeSlot=${timeSlot}&guestCount=${guestCount}&simulate=true`
      );

      if (response.ok) {
        const data = await response.json();
        const pricing = data.pricing;
        const capacityCheck = data.capacityCheck;

        setPreviewData({
          guestCount,
          excessGuests: capacityCheck.excessGuests,
          totalPrice: pricing.totalPrice,
          perPersonPrice: pricing.totalPrice / guestCount,
          requiresSplit: !capacityCheck.withinLimit,
          dynamicAdjustments: pricing.dynamicAdjustments
        });
      } else {
        // Fallback to basic calculation
        const excessGuests = Math.max(0, guestCount - maxGuestsPerSlot);
        const basePrice = baseFee + (guestCount > 1 ? additionalGuestFee * (guestCount - 1) : 0);
        const excessPremium = excessGuests > 0 && allowExcessGuests ? 
          basePrice * (excessGuestMultiplier - 1) : 0;
        const totalPrice = basePrice + excessPremium;

        setPreviewData({
          guestCount,
          excessGuests,
          totalPrice,
          perPersonPrice: totalPrice / guestCount,
          requiresSplit: excessGuests > 0 && allowExcessGuests,
          dynamicAdjustments: excessGuests > 0 && allowExcessGuests ? [
            { ruleName: 'Excess Guest Premium', amount: excessPremium }
          ] : []
        });
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      // Fallback calculation
      const excessGuests = Math.max(0, guestCount - maxGuestsPerSlot);
      const basePrice = baseFee + (guestCount > 1 ? additionalGuestFee * (guestCount - 1) : 0);
      const excessPremium = excessGuests > 0 && allowExcessGuests ? 
        basePrice * (excessGuestMultiplier - 1) : 0;
      const totalPrice = basePrice + excessPremium;

      setPreviewData({
        guestCount,
        excessGuests,
        totalPrice,
        perPersonPrice: totalPrice / guestCount,
        requiresSplit: excessGuests > 0 && allowExcessGuests,
        dynamicAdjustments: excessGuests > 0 && allowExcessGuests ? [
          { ruleName: 'Excess Guest Premium', amount: excessPremium }
        ] : []
      });
    } finally {
      setLoading(false);
    }
  };

  const renderExcessGuestWarning = () => {
    if (!previewData?.requiresSplit) return null;

    return (
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangleIcon className="h-4 w-4" />
        <AlertDescription className="text-amber-800">
          <div className="flex items-center justify-between">
            <span>
              <strong>{previewData.excessGuests}</strong> excess guests will be split into separate time slots
            </span>
            <Badge variant="outline" className="ml-2">
              Split Booking
            </Badge>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  const renderPricingBreakdown = () => {
    if (!previewData) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <UsersIcon className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-sm text-gray-600">Total Guests</span>
            </div>
            <div className="text-2xl font-bold">{previewData.guestCount}</div>
            {previewData.excessGuests > 0 && (
              <div className="text-sm text-amber-600 mt-1">
                +{previewData.excessGuests} excess
              </div>
            )}
          </div>

          <div className="text-center p-4 border rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <DollarSignIcon className="h-5 w-5 mr-2 text-green-600" />
              <span className="text-sm text-gray-600">Per Person</span>
            </div>
            <div className="text-2xl font-bold">${previewData.perPersonPrice.toFixed(2)}</div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-semibold">Total Price</span>
            <div className="flex items-center">
              {previewData.dynamicAdjustments.length > 0 && (
                <TrendingUpIcon className="h-4 w-4 mr-2 text-amber-500" />
              )}
              <span className="text-2xl font-bold text-green-600">
                ${previewData.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {previewData.dynamicAdjustments.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700">Applied Adjustments:</h4>
              {previewData.dynamicAdjustments.map((adj, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center">
                    <InfoIcon className="h-3 w-3 mr-1" />
                    {adj.ruleName}
                  </span>
                  <span className="font-medium text-amber-600">+${adj.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!allowExcessGuests) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UsersIcon className="h-5 w-5 mr-2" />
            Guest Capacity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              This winery allows a maximum of <strong>{maxGuestsPerSlot}</strong> guests per time slot.
              Excess guest booking is not available.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UsersIcon className="h-5 w-5 mr-2" />
          Excess Guest Pricing Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-4">
            Select Number of Guests: <span className="text-blue-600 font-bold">{guestCount}</span>
          </label>
          <Slider
            value={[guestCount]}
            onValueChange={(value) => setGuestCount(value[0])}
            max={Math.min(50, maxGuestsPerSlot * 3)} // Allow up to 3x max guests
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>1</span>
            <span>Max: {maxGuestsPerSlot} (Standard)</span>
            <span>{Math.min(50, maxGuestsPerSlot * 3)} (With Split)</span>
          </div>
        </div>

        {guestCount > maxGuestsPerSlot && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertDescription className="text-amber-800">
              You've selected {guestCount - maxGuestsPerSlot} guests beyond the maximum.
              These will be accommodated in separate time slots with a {excessGuestMultiplier}x multiplier.
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Calculating pricing...</p>
          </div>
        ) : (
          <>
            {renderExcessGuestWarning()}
            {renderPricingBreakdown()}
          </>
        )}

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Capacity Information:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Standard Capacity:</span>
              <div className="font-medium">{maxGuestsPerSlot} guests</div>
            </div>
            <div>
              <span className="text-gray-600">Excess Multiplier:</span>
              <div className="font-medium">{excessGuestMultiplier}x</div>
            </div>
            <div>
              <span className="text-gray-600">Split Booking:</span>
              <div className="font-medium">
                {previewData?.requiresSplit ? 'Yes' : 'No'}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Base Fee:</span>
              <div className="font-medium">${baseFee}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};