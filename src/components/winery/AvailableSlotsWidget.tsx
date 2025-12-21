"use client";
import { useState, useEffect } from "react";
import { FaClock, FaCalendarAlt, FaUsers, FaChevronDown, FaChevronUp } from "react-icons/fa";
import axios from "axios";

interface AvailableSlotsWidgetProps {
  wineryId: string;
}

interface SlotInfo {
  timeSlot: string;
  availableCapacity: number;
  totalCapacity: number;
  slotId: string;
}

interface DaySlots {
  date: string;
  dayOfWeek: string;
  dayOfWeekLong: string;
  month: string;
  day: number;
  isToday: boolean;
  slots: SlotInfo[];
  slotsAvailable: number;
  totalCapacity: number;
}

interface SlotsData {
  currentDate: string;
  summary: {
    totalSlotsAvailable: number;
    totalCapacity: number;
    thisWeekSlots: number;
  };
  today: {
    date: string;
    slots: SlotInfo[];
    slotsAvailable: number;
  };
  next7Days: DaySlots[];
  earliestAvailable: {
    date: string;
    timeSlot: string;
    availableCapacity: number;
  } | null;
}

export default function AvailableSlotsWidget({ wineryId }: AvailableSlotsWidgetProps) {
  const [slotsData, setSlotsData] = useState<SlotsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableSlots();

    // Refresh data every 5 minutes to stay current
    const interval = setInterval(fetchAvailableSlots, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [wineryId]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/winery/${wineryId}/available-slots`);

      if (response.data.success) {
        setSlotsData(response.data);
        setError(null);
      }
    } catch (err: any) {

      setError("Unable to load availability");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !slotsData) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="text-red-500 text-sm">
          {error || "No availability information"}
        </div>
      </div>
    );
  }

  const { summary, today, next7Days, earliestAvailable } = slotsData;
  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-wine-primary/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-wine-primary to-wine-secondary p-6">
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="text-2xl font-serif font-bold mb-1">Available Now</h3>
            <p className="text-wine-primary/80 text-sm">
              Updated: {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{summary.thisWeekSlots}</div>
            <div className="text-sm text-wine-primary/80">Slots This Week</div>
          </div>
        </div>
      </div>

      {/* Earliest Available Slot - Highlighted */}
      {earliestAvailable && (
        <div className="bg-green-50 border-b-2 border-green-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 text-white p-3 rounded-full">
              <FaClock className="h-5 w-5" />
            </div>
            <div className="flex-grow">
              <div className="text-sm font-medium text-green-800">Next Available</div>
              <div className="text-lg font-bold text-green-900">
                {new Date(earliestAvailable.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              <div className="text-sm text-green-700">
                {earliestAvailable.timeSlot} • {earliestAvailable.availableCapacity} spots left
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Slots */}
      {today.slotsAvailable > 0 && (
        <div className="p-6 border-b-2 border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-serif font-bold text-wine-primary flex items-center gap-2">
              <FaCalendarAlt className="text-wine-secondary" />
              Today's Availability
            </h4>
            <span className="bg-wine-primary text-white text-xs font-bold px-3 py-1 rounded-full">
              {today.slotsAvailable} Slots
            </span>
          </div>

          <div className="space-y-2">
            {today.slots.map((slot, index) => {
              // Extract hour from time slot string
              const timeMatch = slot.timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/);
              const slotHour = timeMatch ? parseInt(timeMatch[1]) + (timeMatch[3] === 'PM' && timeMatch[1] !== '12' ? 12 : 0) : 24;
              const isPast = slotHour < currentHour;

              if (isPast) return null; // Don't show past slots

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-wine-primary/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FaClock className="text-wine-primary" />
                    <span className="font-medium">{slot.timeSlot}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUsers className="text-gray-400 text-sm" />
                    <span className="text-sm font-medium text-green-600">
                      {slot.availableCapacity} / {slot.totalCapacity} available
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Next 7 Days Summary */}
      <div className="p-6">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between mb-4 hover:text-wine-primary transition-colors"
        >
          <h4 className="text-lg font-serif font-bold text-wine-primary">
            Next 7 Days
          </h4>
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>

        {!expanded ? (
          // Collapsed View - Quick Summary
          <div className="grid grid-cols-7 gap-2">
            {next7Days.map((day, index) => (
              <div
                key={index}
                className={`text-center p-2 rounded-lg transition-all ${day.isToday
                    ? 'bg-wine-primary text-white'
                    : day.slotsAvailable > 0
                      ? 'bg-green-50 hover:bg-green-100 cursor-pointer'
                      : 'bg-gray-100'
                  }`}
                title={`${day.dayOfWeekLong}, ${day.month} ${day.day}`}
              >
                <div className="text-xs font-medium mb-1">{day.dayOfWeek}</div>
                <div className="text-lg font-bold">{day.day}</div>
                {day.slotsAvailable > 0 ? (
                  <div className="text-xs mt-1">
                    <div className="font-medium">{day.slotsAvailable}</div>
                    <div className="text-[10px] opacity-75">slots</div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 mt-1">Full</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Expanded View - Detailed List
          <div className="space-y-3">
            {next7Days.map((day, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${day.isToday
                    ? 'border-wine-primary bg-wine-primary/5'
                    : day.slotsAvailable > 0
                      ? 'border-green-200 bg-green-50/50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-bold text-lg">
                      {day.dayOfWeekLong}, {day.month} {day.day}
                      {day.isToday && <span className="ml-2 text-sm text-wine-primary">(Today)</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    {day.slotsAvailable > 0 ? (
                      <>
                        <div className="text-2xl font-bold text-green-600">{day.slotsAvailable}</div>
                        <div className="text-xs text-gray-600">slots • {day.totalCapacity} spots</div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500 font-medium">Fully Booked</div>
                    )}
                  </div>
                </div>

                {day.slots.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {day.slots.map((slot, slotIndex) => (
                      <div
                        key={slotIndex}
                        className="flex items-center justify-between text-sm p-2 bg-white rounded"
                      >
                        <span className="font-medium">{slot.timeSlot}</span>
                        <span className="text-green-600">
                          {slot.availableCapacity} available
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="bg-gray-50 p-4 border-t-2 border-gray-100">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-wine-primary">{summary.totalSlotsAvailable}</div>
            <div className="text-xs text-gray-600">Total Slots (30 Days)</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-wine-primary">{summary.totalCapacity}</div>
            <div className="text-xs text-gray-600">Total Capacity</div>
          </div>
        </div>
      </div>
    </div>
  );
}
