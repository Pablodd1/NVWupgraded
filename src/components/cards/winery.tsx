"use client";
import { useEffect, useState } from "react";
import { Winery } from "@/app/interfaces";
import { BookingData } from "@/store/itinerary";

interface WineryCardProps {
  winery: Winery;
  onUpdate: (id: string, data: BookingData) => void;
  onRemove: (id: string) => void;
}

interface AddonQty {
  name: string;
  price: number;
  qty: number;
}

interface TourQty {
  description: string;
  price: number;
  qty: number;
}

export default function WineryBookingCard({ winery, onUpdate, onRemove }: WineryCardProps) {
  const primaryTastingInfo = winery.tasting_info?.[0] || winery.tasting_info;
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedTastingIndex, setSelectedTastingIndex] = useState<number>(0);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [calendarData, setCalendarData] = useState<Record<string, any[]>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Guest counts
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [numberOfChildren, setNumberOfChildren] = useState(0);
  const [numberOfNonDrinkers, setNumberOfNonDrinkers] = useState(0);

  // Add-ons: keyed by item name/desc, qty capped at guest count
  const [foodQtys, setFoodQtys] = useState<Record<string, number>>({});
  const [tourQtys, setTourQtys] = useState<Record<string, number>>({});
  const [otherQtys, setOtherQtys] = useState<Record<string, number>>({});

  const currentTastingInfo = winery.tasting_info?.[selectedTastingIndex] || primaryTastingInfo;

  // Fetch real-time slots
  useEffect(() => {
    if (!winery._id) return;
    setLoadingSlots(true);
    fetch(`/api/winery/${winery._id}/available-slots`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.success && data?.calendar) setCalendarData(data.calendar);
      })
      .catch(console.error)
      .finally(() => setLoadingSlots(false));
  }, [winery._id]);

  const availableDates = Object.keys(calendarData).sort();
  const minDate = availableDates[0] || "";
  const maxDate = availableDates[availableDates.length - 1] || "";

  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) setSelectedDate(availableDates[0]);
  }, [availableDates.length, selectedDate]);

  // Build available times when date changes
  useEffect(() => {
    if (selectedDate && calendarData[selectedDate]) {
      const getISO = (dateStr: string, timeSlotStr: string) => {
        const m = timeSlotStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (!m) return null;
        let [, h, min, period] = m;
        let hours = parseInt(h);
        if (period?.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (period?.toUpperCase() === 'AM' && hours === 12) hours = 0;
        const d = new Date(dateStr);
        d.setHours(hours, parseInt(min), 0, 0);
        return d.toISOString();
      };

      const times = calendarData[selectedDate]
        .filter((s: any) => s.availableCapacity > 0)
        .map((s: any) => getISO(selectedDate, s.timeSlot))
        .filter(Boolean) as string[];

      setAvailableTimes(times);
      if (times.length > 0 && (!selectedTime || !times.includes(selectedTime))) {
        setSelectedTime(times[0]);
      }
    } else {
      setAvailableTimes([]);
      setSelectedTime("");
    }
  }, [selectedDate, calendarData]);

  // Reset add-ons when tasting changes
  useEffect(() => {
    setFoodQtys({});
    setTourQtys({});
    setOtherQtys({});
  }, [selectedTastingIndex]);

  // Build structured selections and notify parent
  useEffect(() => {
    const foodPairings = Object.entries(foodQtys)
      .filter(([, qty]) => qty > 0)
      .flatMap(([name, qty]) => {
        const opt = currentTastingInfo?.food_pairing_options?.find((f: any) => f.name === name);
        // one entry per unit so price math in itinerary stays simple
        return Array(qty).fill({ name, price: opt?.price || 0 });
      });

    const tours = Object.entries(tourQtys)
      .filter(([, qty]) => qty > 0)
      .flatMap(([desc, qty]) => {
        const opt = currentTastingInfo?.tours?.tour_options?.find((t: any) => t.description === desc);
        return Array(qty).fill({ description: desc, price: opt?.cost || 0 });
      });

    const otherFeature = Object.entries(otherQtys)
      .filter(([, qty]) => qty > 0)
      .flatMap(([desc, qty]) => {
        const opt = currentTastingInfo?.other_features?.find((o: any) => o.description === desc);
        return Array(qty).fill({ description: desc, price: opt?.cost || 0 });
      });

    onUpdate(winery._id || winery.name, {
      selectedDate,
      selectedTime,
      selectedTastingIndex,
      tasting: true,
      numberOfGuests,
      numberOfChildren,
      numberOfNonDrinkers,
      foodPairings,
      foodPairingQty: 1,
      tours,
      otherFeature,
    });
  }, [selectedDate, selectedTime, selectedTastingIndex, numberOfGuests, numberOfChildren, numberOfNonDrinkers, foodQtys, tourQtys, otherQtys]);

  // Price summary
  const subtotal = (() => {
    let total = (currentTastingInfo?.tasting_price || 0) * numberOfGuests;
    total += (currentTastingInfo?.child_price || 0) * numberOfChildren;
    total += (currentTastingInfo?.non_drinker_price || 0) * numberOfNonDrinkers;
    Object.entries(foodQtys).forEach(([name, qty]) => {
      const opt = currentTastingInfo?.food_pairing_options?.find((f: any) => f.name === name);
      total += (opt?.price || 0) * qty;
    });
    Object.entries(tourQtys).forEach(([desc, qty]) => {
      const opt = currentTastingInfo?.tours?.tour_options?.find((t: any) => t.description === desc);
      total += (opt?.cost || 0) * qty;
    });
    Object.entries(otherQtys).forEach(([desc, qty]) => {
      const opt = currentTastingInfo?.other_features?.find((o: any) => o.description === desc);
      total += (opt?.cost || 0) * qty;
    });
    return total;
  })();

  const hasAvailableSlots = availableDates.length > 0;
  const hasAvailableTimes = availableTimes.length > 0;

  const QtyControl = ({
    label,
    subLabel,
    value,
    max,
    onChange,
  }: {
    label: string;
    subLabel?: string;
    value: number;
    max: number;
    onChange: (n: number) => void;
  }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {subLabel && <p className="text-xs text-gray-500">{subLabel}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 transition"
          aria-label={`Decrease ${label}`}
        >−</button>
        <span className="w-5 text-center text-sm font-semibold">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded-full bg-wine-primary/10 hover:bg-wine-primary/20 flex items-center justify-center font-bold text-wine-primary transition"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
        >+</button>
      </div>
    </div>
  );

  return (
    <div className="card shadow-lg bg-white rounded-xl flex flex-col w-full border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 pt-4 pb-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{winery.name}</h2>
          <p className="text-xs text-gray-400">{winery.location?.address ?? "Address not available"}</p>
        </div>
        <button
          onClick={() => onRemove(winery._id || winery.name)}
          className="text-red-500 text-xs font-medium hover:text-red-700 transition"
          aria-label="Remove winery"
        >✕ Remove</button>
      </div>

      {/* External Booking Notice */}
      {winery.payment_method?.type === "external_booking" && (
        <div className="mx-4 mb-2 bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-xs text-orange-800 font-semibold mb-2">
            ℹ️ This winery requires booking on their official website.
          </p>
          <a
            href={winery.payment_method.external_booking_link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-xs btn-warning w-full"
          >
            Go to Booking Site →
          </a>
        </div>
      )}

      {/* Scrollable form body */}
      <div className="flex-1 overflow-y-auto px-4 pb-28 space-y-4 pt-2">

        {/* Tasting Selection */}
        {winery.tasting_info && winery.tasting_info.length > 1 && (
          <div>
            <label htmlFor={`tasting-exp-${winery._id}`} className="block text-xs font-bold uppercase text-gray-500 mb-1">Tasting Experience</label>
            <select
              id={`tasting-exp-${winery._id}`}
              className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-wine-primary"
              value={selectedTastingIndex}
              onChange={(e) => {
                setSelectedTastingIndex(Number(e.target.value));
                setSelectedDate("");
                setSelectedTime("");
              }}
            >
              {winery.tasting_info.map((t, i) => (
                <option key={i} value={i}>{t.tasting_title} – ${t.tasting_price.toFixed(2)}/person</option>
              ))}
            </select>
          </div>
        )}

        {/* Price Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center">
          <span className="text-sm text-green-800 font-medium">✅ {currentTastingInfo?.tasting_title}</span>
          <span className="text-sm font-bold text-green-900">${subtotal.toFixed(2)}</span>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`date-${winery._id}`} className="block text-xs font-bold uppercase text-gray-500 mb-1">Date <span className="text-red-500">*</span></label>
            <input
              id={`date-${winery._id}`}
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              min={minDate}
              max={maxDate}
              className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-wine-primary"
              required
            />
            {!hasAvailableSlots && !loadingSlots && (
              <p className="text-xs text-amber-500 mt-1">No slots yet — select any date.</p>
            )}
          </div>
          <div>
            <label htmlFor={`time-${winery._id}`} className="block text-xs font-bold uppercase text-gray-500 mb-1">Time <span className="text-red-500">*</span></label>
            <select
              id={`time-${winery._id}`}
              className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-wine-primary"
              value={selectedTime}
              onChange={e => setSelectedTime(e.target.value)}
              required
            >
              <option value="" disabled>Select time</option>
              {hasAvailableTimes ? availableTimes.map((t, i) => {
                const d = new Date(t);
                return (
                  <option key={i} value={t}>
                    {!isNaN(d.getTime()) ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : t}
                  </option>
                );
              }) : (
                <>
                  <option value={`${selectedDate}T10:00:00`}>10:00 AM</option>
                  <option value={`${selectedDate}T11:00:00`}>11:00 AM</option>
                  <option value={`${selectedDate}T12:00:00`}>12:00 PM</option>
                  <option value={`${selectedDate}T13:00:00`}>1:00 PM</option>
                  <option value={`${selectedDate}T14:00:00`}>2:00 PM</option>
                  <option value={`${selectedDate}T15:00:00`}>3:00 PM</option>
                  <option value={`${selectedDate}T16:00:00`}>4:00 PM</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* ── GUESTS ── */}
        <div className="bg-gray-50 rounded-xl p-3 space-y-1">
          <p className="text-xs font-bold uppercase text-gray-500 mb-2">Guests</p>
          <QtyControl
            label="Adults (21+)"
            subLabel={`$${(currentTastingInfo?.tasting_price || 0).toFixed(2)} each`}
            value={numberOfGuests}
            max={currentTastingInfo?.booking_info?.max_guests_per_slot || 20}
            onChange={n => setNumberOfGuests(n < 1 ? 1 : n)}
          />
          {winery.amenities?.allows_children && (
            <QtyControl
              label="Children"
              subLabel={`+$${(currentTastingInfo?.child_price || 0).toFixed(2)} each`}
              value={numberOfChildren}
              max={numberOfGuests}
              onChange={setNumberOfChildren}
            />
          )}
          {winery.amenities?.allows_non_drinkers && (
            <QtyControl
              label="Non-Drinkers"
              subLabel={`+$${(currentTastingInfo?.non_drinker_price || 0).toFixed(2)} each`}
              value={numberOfNonDrinkers}
              max={numberOfGuests}
              onChange={setNumberOfNonDrinkers}
            />
          )}
        </div>

        {/* ── FOOD PAIRINGS ── */}
        {currentTastingInfo?.food_pairing_options && currentTastingInfo.food_pairing_options.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
            <p className="text-xs font-bold uppercase text-amber-700 mb-2">🍽 Food Pairings</p>
            {currentTastingInfo.food_pairing_options.map((opt: any) => (
              <QtyControl
                key={opt.name}
                label={opt.name}
                subLabel={`+$${opt.price.toFixed(2)} each · max ${numberOfGuests}`}
                value={foodQtys[opt.name] || 0}
                max={numberOfGuests}
                onChange={n => setFoodQtys(prev => ({ ...prev, [opt.name]: n }))}
              />
            ))}
          </div>
        )}

        {/* ── TOURS ── */}
        {currentTastingInfo?.tours?.tour_options && currentTastingInfo.tours.tour_options.length > 0 && (
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
            <p className="text-xs font-bold uppercase text-purple-700 mb-2">🗺 Tours</p>
            {currentTastingInfo.tours.tour_options.map((opt: any) => (
              <QtyControl
                key={opt.description}
                label={opt.description}
                subLabel={opt.cost === 0 ? "Complimentary" : `+$${opt.cost.toFixed(2)} each · max ${numberOfGuests}`}
                value={tourQtys[opt.description] || 0}
                max={numberOfGuests}
                onChange={n => setTourQtys(prev => ({ ...prev, [opt.description]: n }))}
              />
            ))}
          </div>
        )}

        {/* ── OTHER FEATURES ── */}
        {currentTastingInfo?.other_features && currentTastingInfo.other_features.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-xs font-bold uppercase text-blue-700 mb-2">✨ Other Add-ons</p>
            {currentTastingInfo.other_features.map((opt: any) => (
              <QtyControl
                key={opt.description}
                label={opt.description}
                subLabel={opt.cost === 0 ? "Complimentary" : `+$${opt.cost.toFixed(2)} each · max ${numberOfGuests}`}
                value={otherQtys[opt.description] || 0}
                max={numberOfGuests}
                onChange={n => setOtherQtys(prev => ({ ...prev, [opt.description]: n }))}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── FIXED BOTTOM TOTAL BAR ── */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div>
          <p className="text-xs text-gray-500">Subtotal</p>
          <p className="text-xl font-bold text-wine-primary">${subtotal.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400">{numberOfGuests} guest{numberOfGuests > 1 ? 's' : ''}</p>
          <p className="text-[10px] text-gray-400">{selectedDate || 'No date'} · {selectedTime ? new Date(selectedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No time'}</p>
        </div>
      </div>
    </div>
  );
}
