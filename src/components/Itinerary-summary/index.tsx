"use client";
import { useEffect, useState } from "react";
import { Winery } from "@/app/interfaces";
import { BookingData, ItineraryWinery } from "@/store/itinerary";

interface ItinerarySummaryProps {
  wineries: ItineraryWinery[];
  onConfirm: () => void;
}

export default function ItinerarySummary({ wineries, onConfirm }: ItinerarySummaryProps) {
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const calculateTotalPrice = () => {
      return wineries.reduce((total, winery) => {
        console.log("winery payment_method:", winery.payment_method);
        console.log("winery payment_method type:", winery.payment_method?.type);
        let wineryCost = 0;
        const bookingDetails = winery.bookingDetails;
        const selectedTastingIndex = bookingDetails?.selectedTastingIndex || 0;
        const currentTastingInfo = winery.tasting_info?.[selectedTastingIndex];

        // Only calculate cost for wineries that require payment through the app
        if (winery.payment_method?.type === "pay_stripe") {
          // Add tasting price for the selected tasting
          if (currentTastingInfo?.tasting_price) {
            wineryCost += currentTastingInfo.tasting_price;
          }

          // Add food pairing prices if selected
          if (bookingDetails?.foodPairings) {
            wineryCost += bookingDetails.foodPairings.reduce((sum, pairing) => sum + pairing.price, 0);
          }

          // Add tour prices if selected
          if (bookingDetails?.tours) {
            wineryCost += bookingDetails.tours.reduce((sum, tour) => sum + tour.price, 0);
          }
          
          // Add other features prices if selected
          if (bookingDetails?.otherFeature) {
            wineryCost += bookingDetails.otherFeature.reduce((sum, feature) => sum + feature.price, 0);
          }
        } else if (!winery.payment_method || typeof winery.payment_method === 'string') {
          // Fallback for wineries without proper payment method structure
          // Assume they use pay_stripe if no payment method is set
          console.log("Winery without proper payment method, assuming pay_stripe:", winery.name);
          
          // Add tasting price for the selected tasting
          if (currentTastingInfo?.tasting_price) {
            wineryCost += currentTastingInfo.tasting_price;
          }

          // Add food pairing prices if selected
          if (bookingDetails?.foodPairings) {
            wineryCost += bookingDetails.foodPairings.reduce((sum, pairing) => sum + pairing.price, 0);
          }

          // Add tour prices if selected
          if (bookingDetails?.tours) {
            wineryCost += bookingDetails.tours.reduce((sum, tour) => sum + tour.price, 0);
          }
          
          // Add other features prices if selected
          if (bookingDetails?.otherFeature) {
            wineryCost += bookingDetails.otherFeature.reduce((sum, feature) => sum + feature.price, 0);
          }
        }
        // For external booking and pay at winery, cost is 0 (handled externally)

        return total + wineryCost;
      }, 0);
    };

    setTotalPrice(calculateTotalPrice());
  }, [wineries]);

  const totalTime = wineries.length * 1.5;

  const getPaymentMethodSummary = () => {
    const stripeWineries = wineries.filter(w => w.payment_method?.type === "pay_stripe");
    const externalWineries = wineries.filter(w => w.payment_method?.type === "external_booking");
    const payAtWineryWineries = wineries.filter(w => w.payment_method?.type === "pay_winery");
    const fallbackWineries = wineries.filter(w => !w.payment_method || typeof w.payment_method === 'string');

    if (stripeWineries.length > 0 || fallbackWineries.length > 0) {
      if (externalWineries.length === 0 && payAtWineryWineries.length === 0) {
        return `Total to Pay in App: $${totalPrice.toFixed(2)}`;
      } else {
        return `Mixed Payment Methods - App Total: $${totalPrice.toFixed(2)}`;
      }
    } else if (externalWineries.length > 0 && stripeWineries.length === 0 && payAtWineryWineries.length === 0) {
      return "Payment: External Booking Links";
    } else if (payAtWineryWineries.length > 0 && stripeWineries.length === 0 && externalWineries.length === 0) {
      return "Payment: Pay at Winery";
    } else {
      return `Mixed Payment Methods - App Total: $${totalPrice.toFixed(2)}`;
    }
  };

  return (
    <div className="card shadow-sm bg-white p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Itinerary Summary</h2>
      <p>Total Wineries: {wineries.length}</p>
      <p className="font-semibold">{getPaymentMethodSummary()}</p>

      <div className="mt-4">
        <h3 className="text-sm font-semibold text-gray-700">Breakdown</h3>
        {wineries.length === 0 ? (
          <p className="text-sm text-gray-600">No wineries selected.</p>
        ) : (
          <ul className="text-sm text-gray-600">
            {wineries.map((winery) => {
              const bookingDetails = winery.bookingDetails;
              const selectedTastingIndex = bookingDetails?.selectedTastingIndex || 0;
              const currentTastingInfo = winery.tasting_info?.[selectedTastingIndex];
              
              return (
                <li key={winery._id || winery.name} className="mt-2">
                  <span className="font-medium">{winery.name}</span>
                  {currentTastingInfo && (
                    <div className="ml-4 text-xs text-gray-500">
                      {currentTastingInfo.tasting_title}
                    </div>
                  )}
                  {bookingDetails &&
                  (bookingDetails.tasting ||
                    bookingDetails.foodPairings?.length > 0 ||
                    bookingDetails.tours?.length > 0 ||
                    bookingDetails.otherFeature?.length > 0) ? (
                    <ul className="ml-4 list-disc">
                      {currentTastingInfo?.tasting_price && (
                        <li>Tasting: ${currentTastingInfo.tasting_price.toFixed(2)}</li>
                      )}
                      {bookingDetails?.foodPairings?.map((pairing) => (
                        <li key={pairing.name}>
                          {pairing.name}: ${pairing.price.toFixed(2)}
                        </li>
                      ))}
                      {bookingDetails?.tours?.map((tour) => (
                        <li key={tour.description}>
                          {tour.description}: ${tour.price.toFixed(2)}
                        </li>
                      ))}
                      {bookingDetails?.otherFeature?.map((feature) => (
                        <li key={feature.description}>
                          {feature.description}: ${feature.price.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="ml-4 text-gray-500">No options selected</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={onConfirm}
          className="btn btn-success w-full"
          disabled={wineries.some((w) => !w.bookingDetails?.selectedTime) || wineries.length === 0}
        >
          Confirm Itinerary
        </button>
        {wineries.some((w) => !w.bookingDetails?.selectedTime) && (
          <div className="text-sm text-red-600 mt-2">
            Please select a time for all wineries before confirming.
          </div>
        )}
      </div>
    </div>
  );
}