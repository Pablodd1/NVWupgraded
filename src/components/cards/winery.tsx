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
    foodPairings: [] as { name: string; price: number }[],
    tours: [] as { description: string; price: number }[],
    otherFeature: [] as { description: string; price: number }[],
  });

  // Get current tasting info based on selection
  const currentTastingInfo = winery.tasting_info?.[selectedTastingIndex] || primaryTastingInfo;

  // Get available slots from the currently selected tasting
  const availableSlots = currentTastingInfo?.booking_info?.available_slots || [];

  // Filter out invalid dates before processing
  const validSlots = availableSlots.filter((slot) => {
    const date = new Date(slot);
    return !isNaN(date.getTime());
  });

  // Extract unique dates from valid slots
  const uniqueDatesSet = new Set(validSlots.map((slot) => {
    const date = new Date(slot);
    // Use local date string to avoid timezone shifts
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split("T")[0];
  }));
  const availableDates = Array.from(uniqueDatesSet).sort();

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
      foodPairings: selections.foodPairings,
      tours: selections.tours || [],
      otherFeature: selections.otherFeature || [],
    });
    // We only want to run this once on mount or when the tasting index changes to set defaults
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTastingIndex]);

  // Update available times when date changes
  useEffect(() => {
    if (selectedDate) {
      const timesForDate = validSlots
        .filter((slot) => {
          const date = new Date(slot);
          if (isNaN(date.getTime())) return false;

          const offset = date.getTimezoneOffset();
          const localDate = new Date(date.getTime() - (offset * 60 * 1000));
          return localDate.toISOString().split("T")[0] === selectedDate;
        })
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      setAvailableTimes(timesForDate);

      // Auto-select first available time if current selection is invalid
      if (timesForDate.length > 0 && (!selectedTime || !timesForDate.includes(selectedTime))) {
        setSelectedTime(timesForDate[0]);
      }
    } else {
      setAvailableTimes([]);
      setSelectedTime("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedTastingIndex]);

  // Notify parent component of updates
  useEffect(() => {
    if (selectedDate && selectedTime) {
      onUpdate(winery._id || winery.name, {
        selectedDate,
        selectedTime,
        selectedTastingIndex,
        tasting: selections.tasting,
        numberOfGuests: selections.numberOfGuests,
        foodPairings: selections.foodPairings,
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Tasting Experience</label>
            <select
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
                let tastingPrice = 0;
                if (currentTastingInfo?.base_booking_fee) {
                  tastingPrice = currentTastingInfo.base_booking_fee + (selections.numberOfGuests > 1 ? (selections.numberOfGuests - 1) * (currentTastingInfo.additional_guest_fee || 0) : 0);
                } else {
                  tastingPrice = (currentTastingInfo?.tasting_price || 0);
                }
                return tastingPrice.toFixed(2);
              })()}
            </span>
          </div>
          {currentTastingInfo?.base_booking_fee ? (
            <p className="text-[10px] text-green-600 mt-1">
              (${currentTastingInfo.base_booking_fee} base + ${currentTastingInfo.additional_guest_fee} per extra guest)
            </p>
          ) : (
            <p className="text-[10px] text-green-600 mt-1">
              (Flat rate for up to {currentTastingInfo?.booking_info?.max_guests_per_slot || 6} guests)
            </p>
          )}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time <span className="text-red-500">*</span>
              </label>
              <select
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Guests
            </label>
            <select
              className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 cursor-pointer"
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

          {/* Food Pairings and Tours Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Food Pairing */}
            {currentTastingInfo?.food_pairing_options && currentTastingInfo.food_pairing_options.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Food Pairing (Optional)</label>
                <select
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Tour (Optional)</label>
                <select
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
          {currentTastingInfo?.other_features && currentTastingInfo.other_features.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Other Features (Optional)</label>
              <select
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
          )}
        </div>


      </div>
    </div>
  );
}
