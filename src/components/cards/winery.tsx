"use client";
import { useEffect, useState } from "react";
import { Winery } from "@/app/interfaces";
import { BookingData } from "@/store/itinerary";

interface WineryCardProps {
  winery: Winery;
  onUpdate: (id: string, data: BookingData) => void;
  onRemove: (id: string) => void;
}

export default function WineryBookingCard({ winery, onUpdate, onRemove }: WineryCardProps) {
  // Get the first tasting info for backward compatibility, or use the first one from the array
  const primaryTastingInfo = winery.tasting_info?.[0] || winery.tasting_info;
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedTastingIndex, setSelectedTastingIndex] = useState<number>(0);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selections, setSelections] = useState({
    tasting: true, // Auto-select tasting by default
    numberOfGuests: 1,
    numberOfChildren: 0,
    numberOfNonDrinkers: 0,
    foodPairingQty: 1,
    foodPairings: [] as { name: string; price: number }[],
    tours: [] as { description: string; price: number }[],
    otherFeature: [] as { description: string; price: number }[],
  });

  // Get current tasting info based on selection
  const currentTastingInfo = winery.tasting_info?.[selectedTastingIndex] || primaryTastingInfo;

  const [calendarData, setCalendarData] = useState<Record<string, any[]>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch real-time slots
  useEffect(() => {
    const fetchSlots = async () => {
      // If we already have specific slot data passed in that is "fresh", we could use it, 
      // but for now, always fetch to be safe.
      if (!winery._id) return;

      setLoadingSlots(true);
      try {
        // We use the available-slots API we created/updated
        const res = await fetch(`/api/winery/${winery._id}/available-slots`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.calendar) {
            setCalendarData(data.calendar);
          }
        }
      } catch (err) {
        console.error("Failed to fetch slots", err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [winery._id]);

  // Extract available dates from the fetched calendar
  const availableDates = Object.keys(calendarData).sort();

  // Set min/max dates for date picker
  const minDate = availableDates.length > 0 ? availableDates[0] : "";
  const maxDate = availableDates.length > 0 ? availableDates[availableDates.length - 1] : "";

  // Initialize selected date on mount - use useMemo to prevent infinite loop
  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates.length, selectedDate]);

  // Initial load of default booking details
  useEffect(() => {
    // Ensure the parent knows about the default selection (Tasting) immediately
    onUpdate(winery._id || winery.name, {
      selectedDate,
      selectedTime,
      selectedTastingIndex,
      tasting: selections.tasting,
      numberOfGuests: selections.numberOfGuests,
      numberOfChildren: selections.numberOfChildren,
      numberOfNonDrinkers: selections.numberOfNonDrinkers,
      foodPairings: selections.foodPairings,
      foodPairingQty: selections.foodPairingQty,
      tours: selections.tours || [],
      otherFeature: selections.otherFeature || [],
    });
    // We only want to run this once on mount or when the tasting index changes to set defaults
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTastingIndex]);

  // Update available times when date changes
  // Update available times when date changes
  useEffect(() => {
    if (selectedDate && calendarData[selectedDate]) {
      // Get slots for this date from the calendar map
      const slotsForDate = calendarData[selectedDate];

      // Extract time strings (already formatted in API response usually, or we format them)
      // The API returns "timeSlot" which is like "10:00 AM" or similar.
      // But we need the ISO string or just the time string? 
      // The Booking API expects ISO string.
      // Let's see what `timeSlot` looks like. In API it is "Morning (10:00 AM - ...)" or just "10:00 AM".
      // We need to construct a valid ISO string for the backend.
      // Or we can pass the time string and let backend handle it? 
      // Existing code used ISO strings.
      // Let's try to parse the time from the slot or use the slot time directly.

      // Ideally, the calendar data should have full ISOs or we construct them.
      // Our API returns `{ timeSlot: string, availableCapacity: number... }`. 
      // timeSlot might be "10:00 AM".
      // We need to combine `selectedDate` (YYYY-MM-DD) + `timeSlot` to get ISO.

      // Helper to parse time string
      const getISOFromSlot = (dateStr: string, timeSlotStr: string) => {
        // Extract time: "10:00 AM" or "10:00"
        const timeMatch = timeSlotStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (!timeMatch) return null;

        let [_, h, m, period] = timeMatch;
        let hours = parseInt(h);
        const minutes = parseInt(m);

        if (period) {
          if (period.toUpperCase() === 'PM' && hours < 12) hours += 12;
          if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
        }

        // create date object in local time
        const d = new Date(dateStr);
        d.setHours(hours, minutes, 0, 0);
        // We want the string representation that matches what backend expects.
        // Backend `book` route expects `dateTime`.
        return d.toISOString();
      };

      const times = slotsForDate
        .filter((slot: any) => slot.availableCapacity > 0)
        .map((slot: any) => {
          // We store the original slot string for display, but passing ISO is better for consistency?
          // Wait, existing code expects `selectedTime` to be ISO string? 
          // `availableTimes` was `timesForDate` which were ISO strings.
          // Let's construct ISOs.
          const iso = getISOFromSlot(selectedDate, slot.timeSlot);
          return iso ? { iso, display: slot.timeSlot } : null;
        })
        .filter(Boolean) as { iso: string, display: string }[];

      setAvailableTimes(times.map(t => t.iso)); // Storing ISOs

      // Store display mapping if needed, or re-parse on render ?
      // For now, let's just use the ISOs and format them in render.

      // Auto-select first available
      if (times.length > 0 && (!selectedTime || !times.find(t => t.iso === selectedTime))) {
        setSelectedTime(times[0].iso);
      }
    } else {
      setAvailableTimes([]);
      setSelectedTime("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedTastingIndex, calendarData]);

  // Notify parent component of updates
  useEffect(() => {
    if (selectedDate && selectedTime) {
      onUpdate(winery._id || winery.name, {
        selectedDate,
        selectedTime,
        selectedTastingIndex,
        tasting: selections.tasting,
        numberOfGuests: selections.numberOfGuests,
        numberOfChildren: selections.numberOfChildren,
        numberOfNonDrinkers: selections.numberOfNonDrinkers,
        foodPairings: selections.foodPairings,
        foodPairingQty: selections.foodPairingQty,
        tours: selections.tours || [],
        otherFeature: selections.otherFeature || [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedTime, selectedTastingIndex, selections.tasting, selections.numberOfGuests, selections.foodPairings, selections.tours, selections.otherFeature]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;

    setSelectedDate(dateValue);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const timeValue = e.target.value;

    setSelectedTime(timeValue);
  };

  const handleFoodPairingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;


    if (!selectedValue) {
      setSelections((prev) => ({ ...prev, foodPairings: [] }));
      return;
    }

    const selectedOptions = Array.from(e.target.selectedOptions, (option) => ({
      name: option.value,
      price: Number(option.dataset.price) || 0,
    }));

    setSelections((prev) => ({ ...prev, foodPairings: selectedOptions }));
  };

  const handleTourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;


    if (!selectedValue) {
      setSelections((prev) => ({ ...prev, tours: [] }));
      return;
    }

    const selectedOptions = Array.from(e.target.selectedOptions, (option) => ({
      description: option.value,
      price: Number(option.dataset.price) || 0,
    }));

    setSelections((prev) => ({ ...prev, tours: selectedOptions }));
  };

  const handleChangeOther = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;


    if (!selectedValue) {
      setSelections((prev) => ({ ...prev, otherFeature: [] }));
      return;
    }

    const selectedOptions = Array.from(e.target.selectedOptions, (option) => ({
      description: option.value,
      price: Number(option.dataset.price) || 0,
    }));

    setSelections((prev) => ({ ...prev, otherFeature: selectedOptions }));
  };

  // Reset selections when tasting changes
  useEffect(() => {
    setSelections((prev) => ({ ...prev, foodPairings: [], tours: [], otherFeature: [] }));
  }, [selectedTastingIndex]);

  // Check if we have valid data
  const hasAvailableSlots = availableDates.length > 0;
  const hasAvailableTimes = availableTimes.length > 0;

  return (
    <div className="card shadow-lg bg-white rounded-xl p-4 md:p-6 flex flex-col gap-4 w-full border border-gray-200">
      <div className="flex-grow bg-white w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-800 truncate">{winery.name}</h2>
          <button
            onClick={() => onRemove(winery._id || winery.name)}
            className="text-red-500 text-sm font-medium hover:text-red-600 hover:underline transition"
          >
            Remove
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-2">{winery.location?.address ?? "Address not available"}</p>

        {/* External Booking Notice */}
        {winery.payment_method?.type === "external_booking" && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
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

        {/* Multiple Tasting Selection */}
        {winery.tasting_info && winery.tasting_info.length > 1 && (
          <div className="mb-4">
            <label htmlFor={`tasting-exp-${winery._id}`} className="block text-sm font-medium text-gray-700 mb-1">Select Tasting Experience</label>
            <select
              id={`tasting-exp-${winery._id}`}
              className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              value={selectedTastingIndex}
              onChange={(e) => {
                const newIndex = Number(e.target.value);

                setSelectedTastingIndex(newIndex);
                // Reset date and time when tasting changes
                setSelectedDate("");
                setSelectedTime("");
              }}
            >
              {winery.tasting_info.map((tasting, index) => (
                <option key={index} value={index}>
                  {tasting.tasting_title} - ${tasting.tasting_price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tasting Price Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-green-800 font-medium">
              ✅ Tasting: {currentTastingInfo?.tasting_title}
            </span>
            <span className="text-sm text-green-800 font-bold">
              ${(() => {
                const guests = selections.numberOfGuests;
                const children = selections.numberOfChildren || 0;
                const nonDrinkers = selections.numberOfNonDrinkers || 0;
                const foodQty = selections.foodPairingQty || 1;

                let tastingPrice = (currentTastingInfo?.tasting_price || 0) * guests;

                // Add children and non-drinkers
                tastingPrice += (currentTastingInfo?.child_price || 0) * children;
                tastingPrice += (currentTastingInfo?.non_drinker_price || 0) * nonDrinkers;

                // Add food pairings (based on foodQty)
                selections.foodPairings.forEach(p => tastingPrice += (p.price * foodQty));
                selections.tours.forEach(t => tastingPrice += (t.price * guests));
                selections.otherFeature.forEach(f => tastingPrice += (f.price * guests));

                return tastingPrice.toFixed(2);
              })()}
            </span>
          </div>
          <p className="text-[10px] text-green-600 mt-1 italic">
            (${currentTastingInfo?.tasting_price?.toFixed(2)} per person fee applied)
          </p>
        </div>

        {/* Available Times Display */}
        {currentTastingInfo?.available_times && currentTastingInfo.available_times.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <span className="text-xs text-blue-800 font-medium">
              ⏰ Available Times: {currentTastingInfo.available_times.slice(0, 3).join(", ")}
              {currentTastingInfo.available_times.length > 3 && "..."}
            </span>
          </div>
        )}

        {/* Booking Form */}
        <div className="space-y-4">
          {/* Date and Time Selection Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Picker */}
            <div>
              <label htmlFor={`date-${winery._id}`} className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                id={`date-${winery._id}`}
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                min={minDate}
                max={maxDate}
                className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 cursor-pointer"
                required
              />
              {!hasAvailableSlots && (
                <p className="text-xs text-blue-500 mt-1">Please select the date you plan to visit.</p>
              )}
            </div>

            {/* Time Selector */}
            <div>
              <label htmlFor={`time-${winery._id}`} className="block text-sm font-medium text-gray-700 mb-1">
                Time <span className="text-red-500">*</span>
              </label>
              <select
                id={`time-${winery._id}`}
                className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 cursor-pointer"
                value={selectedTime}
                onChange={handleTimeChange}
                required
              >
                <option value="" disabled>
                  Select a time
                </option>
                {hasAvailableTimes ? availableTimes.map((time, idx) => {
                  const date = new Date(time);
                  const timeString = !isNaN(date.getTime())
                    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "Invalid time";
                  return (
                    <option key={idx} value={time}>
                      {timeString}
                    </option>
                  );
                }) : (
                  <>
                    <option value={`${selectedDate}T10:00:00Z`}>10:00 AM</option>
                    <option value={`${selectedDate}T11:00:00Z`}>11:00 AM</option>
                    <option value={`${selectedDate}T12:00:00Z`}>12:00 PM</option>
                    <option value={`${selectedDate}T13:00:00Z`}>1:00 PM</option>
                    <option value={`${selectedDate}T14:00:00Z`}>2:00 PM</option>
                    <option value={`${selectedDate}T15:00:00Z`}>3:00 PM</option>
                    <option value={`${selectedDate}T16:00:00Z`}>4:00 PM</option>
                  </>
                )}
              </select>
              {selectedDate && !hasAvailableTimes && (
                <p className="text-xs text-red-500 mt-1">No available times for selected date</p>
              )}
            </div>
          </div>

          {/* Number of Guests */}
          <div>
            <label htmlFor={`guests-${winery._id}`} className="block text-sm font-medium text-gray-700 mb-1">
              Number of Guests
            </label>
            <select
              id={`guests-${winery._id}`}
              className="w-full h-11 text-base rounded-lg border border-gray-300 px-3 py-2 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 cursor-pointer appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
              value={selections.numberOfGuests}
              onChange={(e) => {
                const guests = Number(e.target.value);
                setSelections((prev) => ({ ...prev, numberOfGuests: guests }));
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? "Guest" : "Guests"}
                </option>
              ))}
            </select>
          </div>

          {/* Children and Non-Drinkers Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {winery.amenities?.allows_children && (
              <div>
                <label htmlFor={`children-${winery._id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Children (+${currentTastingInfo?.child_price || 0})
                </label>
                <select
                  id={`children-${winery._id}`}
                  className="w-full h-11 text-base rounded-lg border border-gray-300 px-3 py-2 bg-white focus:ring-2 focus:ring-purple-500 appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.4rem center', backgroundSize: '1.2em 1.2em' }}
                  value={selections.numberOfChildren}
                  onChange={(e) => setSelections(prev => ({ ...prev, numberOfChildren: parseInt(e.target.value) || 0 }))}
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            )}
            {winery.amenities?.allows_non_drinkers && (
              <div>
                <label htmlFor={`non-drinkers-${winery._id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Non-Drinkers (+${currentTastingInfo?.non_drinker_price || 0})
                </label>
                <select
                  id={`non-drinkers-${winery._id}`}
                  className="w-full h-11 text-base rounded-lg border border-gray-300 px-3 py-2 bg-white focus:ring-2 focus:ring-purple-500 appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.4rem center', backgroundSize: '1.2em 1.2em' }}
                  value={selections.numberOfNonDrinkers}
                  onChange={(e) => setSelections(prev => ({ ...prev, numberOfNonDrinkers: parseInt(e.target.value) || 0 }))}
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Food Pairings and Tours Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Food Pairing */}
            {currentTastingInfo?.food_pairing_options && currentTastingInfo.food_pairing_options.length > 0 && (
              <div>
                <label htmlFor={`food-${winery._id}`} className="block text-sm font-medium text-gray-700 mb-1">Food Pairing (Optional)</label>
                <select
                  id={`food-${winery._id}`}
                  className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 cursor-pointer"
                  onChange={handleFoodPairingChange}
                  defaultValue=""
                >
                  <option value="">No food pairing</option>
                  {currentTastingInfo.food_pairing_options.map((option) => (
                    <option key={option.name} value={option.name} data-price={option.price}>
                      {option.name} (+${option.price.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tours */}
            {currentTastingInfo?.tours?.tour_options && currentTastingInfo.tours.tour_options.length > 0 && (
              <div>
                <label htmlFor={`tour-${winery._id}`} className="block text-sm font-medium text-gray-700 mb-1">Tour (Optional)</label>
                <select
                  id={`tour-${winery._id}`}
                  className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 cursor-pointer"
                  onChange={handleTourChange}
                  defaultValue=""
                >
                  <option value="">No tour</option>
                  {currentTastingInfo.tours.tour_options.map((option) => (
                    <option key={option.description} value={option.description} data-price={option.cost}>
                      {option.description} (+${option.cost.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Other Features Row */}
          {
            currentTastingInfo?.other_features && currentTastingInfo.other_features.length > 0 && (
              <div>
                <label htmlFor={`other-${winery._id}`} className="block text-sm font-medium text-gray-700 mb-1">Other Features (Optional)</label>
                <select
                  id={`other-${winery._id}`}
                  className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 cursor-pointer"
                  onChange={handleChangeOther}
                  defaultValue=""
                >
                  <option value="">No additional features</option>
                  {currentTastingInfo.other_features.map((option) => (
                    <option key={option.description} value={option.description} data-price={option.cost}>
                      {option.description} (+${option.cost.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
            )
          }
        </div >


      </div >
    </div >
  );
}
