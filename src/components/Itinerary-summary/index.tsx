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
    const calculateTotalPrice = async () => {
      let total = 0;

      for (const winery of wineries) {
        let wineryCost = 0;
        const bookingDetails = winery.bookingDetails;
        const selectedTastingIndex = bookingDetails?.selectedTastingIndex || 0;
        const currentTastingInfo = winery.tasting_info?.[selectedTastingIndex];

        // Calculate tasting cost using per-person pricing if available, otherwise use legacy pricing
        const numberOfGuests = bookingDetails?.numberOfGuests || 1;
        if (currentTastingInfo?.base_booking_fee !== undefined && currentTastingInfo?.base_booking_fee > 0) {
          // Use per-person (tiered) pricing
          wineryCost += currentTastingInfo.base_booking_fee; // Base fee covers 'free_guests_included'
          const freeGuests = currentTastingInfo.free_guests_included || 1;
          const guestsToCharge = Math.max(0, numberOfGuests - freeGuests);
          wineryCost += guestsToCharge * (currentTastingInfo.additional_guest_fee || 0);
        } else if (currentTastingInfo?.tasting_price) {
          // Use legacy pricing
          wineryCost += currentTastingInfo.tasting_price;
        }

        // Check for excess guests and apply dynamic pricing
        const maxGuestsPerSlot = currentTastingInfo?.booking_info?.max_guests_per_slot || 8;
        const allowExcessGuests = currentTastingInfo?.booking_info?.allow_excess_guests || false;
        const excessGuests = Math.max(0, numberOfGuests - maxGuestsPerSlot);

        if (excessGuests > 0 && allowExcessGuests && bookingDetails?.selectedDate && bookingDetails?.selectedTime) {
          try {
            // Get dynamic pricing for excess guests
            const dateStr = new Date(bookingDetails.selectedDate).toISOString().split('T')[0];
            const timeStr = new Date(bookingDetails.selectedTime).toTimeString().substring(0, 5);

            const response = await fetch(
              `/api/excess-guests?wineryId=${winery._id}&date=${dateStr}&timeSlot=${timeStr}&guestCount=${numberOfGuests}`
            );

            if (response.ok) {
              const data = await response.json();
              wineryCost = data.pricing.totalPrice;
            } else {
              // Fallback to excess guest multiplier
              const excessMultiplier = currentTastingInfo?.booking_info?.excess_guest_multiplier || 1.5;
              wineryCost *= excessMultiplier;
            }
          } catch (error) {
            console.error('Error getting excess guest pricing:', error);
            // Fallback to excess guest multiplier
            const excessMultiplier = currentTastingInfo?.booking_info?.excess_guest_multiplier || 1.5;
            wineryCost *= excessMultiplier;
          }
        }

        const guests = bookingDetails?.numberOfGuests || 1;
        // Add food pairing prices if selected
        if (bookingDetails?.foodPairings) {
          wineryCost += bookingDetails.foodPairings.reduce((sum, pairing) => sum + (pairing.price || 0), 0) * guests;
        }

        // Add tour prices if selected
        if (bookingDetails?.tours) {
          wineryCost += bookingDetails.tours.reduce((sum, tour) => sum + (tour.price || 0), 0) * guests;
        }

        // Add other features prices if selected
        if (bookingDetails?.otherFeature) {
          wineryCost += bookingDetails.otherFeature.reduce((sum, feature) => sum + (feature.price || 0), 0) * guests;
        }

        total += wineryCost;
      }

      setTotalPrice(total);
    };

    if (wineries.length > 0) {
      calculateTotalPrice();
    }
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

              // Calculate winery subtotal
              let winerySubtotal = 0;
              const numberOfGuests = bookingDetails?.numberOfGuests || 1;
              if (currentTastingInfo?.base_booking_fee !== undefined && currentTastingInfo?.base_booking_fee > 0) {
                // Use per-person (tiered) pricing
                winerySubtotal += currentTastingInfo.base_booking_fee; // Base fee covers 'free_guests_included'
                const freeGuests = currentTastingInfo.free_guests_included || 1;
                const guestsToCharge = Math.max(0, numberOfGuests - freeGuests);
                winerySubtotal += guestsToCharge * (currentTastingInfo.additional_guest_fee || 0);
              } else if (currentTastingInfo?.tasting_price) {
                // Use legacy pricing
                winerySubtotal += currentTastingInfo.tasting_price;
              }
              if (bookingDetails?.foodPairings) {
                winerySubtotal += bookingDetails.foodPairings.reduce((sum, p) => sum + (p.price || 0), 0) * numberOfGuests;
              }
              if (bookingDetails?.tours) {
                winerySubtotal += bookingDetails.tours.reduce((sum, t) => sum + (t.price || 0), 0) * numberOfGuests;
              }
              if (bookingDetails?.otherFeature) {
                winerySubtotal += bookingDetails.otherFeature.reduce((sum, f) => sum + (f.price || 0), 0) * numberOfGuests;
              }

              return (
                <li key={winery._id || winery.name} className="mt-2 border-b pb-2 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <span className="font-medium">{winery.name}</span>
                    <span className="font-semibold text-primary">${winerySubtotal.toFixed(2)}</span>
                  </div>
                  {currentTastingInfo && (
                    <div className="ml-4 text-xs text-gray-500">
                      {currentTastingInfo.tasting_title}
                    </div>
                  )}
                  {bookingDetails?.selectedDate && bookingDetails?.selectedTime && (
                    <div className="ml-4 text-xs text-green-600">
                      📅 {new Date(bookingDetails.selectedTime).toLocaleDateString()} at {new Date(bookingDetails.selectedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {(() => {
                        const maxGuestsPerSlot = currentTastingInfo?.booking_info?.max_guests_per_slot || 8;
                        const excessGuests = Math.max(0, (bookingDetails?.numberOfGuests || 1) - maxGuestsPerSlot);
                        return excessGuests > 0 && currentTastingInfo?.booking_info?.allow_excess_guests ? (
                          <span className="ml-2 text-amber-600 font-medium">
                            +{excessGuests} excess guests
                          </span>
                        ) : null;
                      })()}
                    </div>
                  )}
                  {bookingDetails &&
                    (bookingDetails.tasting ||
                      bookingDetails.foodPairings?.length > 0 ||
                      bookingDetails.tours?.length > 0 ||
                      bookingDetails.otherFeature?.length > 0) ? (
                    <ul className="ml-4 list-disc text-xs">
                      {currentTastingInfo?.base_booking_fee !== undefined && currentTastingInfo?.base_booking_fee > 0 ? (
                        <li>
                          Tasting (tiered): Base ${currentTastingInfo.base_booking_fee.toFixed(2)} (up to {currentTastingInfo.free_guests_included || 1} guests)
                          {(() => {
                            const freeGuests = currentTastingInfo.free_guests_included || 1;
                            const guestsToCharge = Math.max(0, numberOfGuests - freeGuests);
                            if (guestsToCharge > 0 && currentTastingInfo.additional_guest_fee) {
                              return <> + ${(guestsToCharge * currentTastingInfo.additional_guest_fee).toFixed(2)} for {guestsToCharge} additional guest{guestsToCharge > 1 ? 's' : ''}</>;
                            }
                            return null;
                          })()}
                        </li>
                      ) : currentTastingInfo?.tasting_price && (
                        <li>Tasting: ${currentTastingInfo.tasting_price.toFixed(2)}</li>
                      )}
                      {bookingDetails?.foodPairings?.map((pairing, idx) => (
                        <li key={`${pairing.name}-${idx}`}>
                          {pairing.name}: ${pairing.price.toFixed(2)} x {numberOfGuests} = ${(pairing.price * numberOfGuests).toFixed(2)}
                        </li>
                      ))}
                      {bookingDetails?.tours?.map((tour, idx) => (
                        <li key={`${tour.description}-${idx}`}>
                          {tour.description}: ${tour.price.toFixed(2)} x {numberOfGuests} = ${(tour.price * numberOfGuests).toFixed(2)}
                        </li>
                      ))}
                      {bookingDetails?.otherFeature?.map((feature, idx) => (
                        <li key={`${feature.description}-${idx}`}>
                          {feature.description}: ${feature.price.toFixed(2)} x {numberOfGuests} = ${(feature.price * numberOfGuests).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="ml-4 text-gray-500 text-xs">No options selected</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Grand Total Section */}
      {wineries.length > 0 && (
        <div className="mt-4 pt-4 border-t-2 border-gray-300">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Grand Total</span>
            <span className="text-2xl font-bold text-green-600">${totalPrice.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {getPaymentMethodSummary()}
          </p>
        </div>
      )}

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