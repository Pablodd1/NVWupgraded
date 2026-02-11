"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaUsers,
  FaLock,
  FaUnlock,
  FaTrash,
  FaCopy,
  FaCheck
} from "react-icons/fa";

interface TimeSlot {
  _id?: string;
  wineryId: string;
  date: string;
  timeSlot: string;
  totalCapacity: number;
  bookedCapacity: number;
  availableCapacity: number;
  status: string;
}

interface DaySlots {
  [date: string]: TimeSlot[];
}

const DEFAULT_TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM"
];

export default function AvailabilityManagement() {
  const { user, loading, fetchUser } = useAuthStore();
  const router = useRouter();

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showCustomTimeModal, setShowCustomTimeModal] = useState(false);

  // Form states
  const [newSlot, setNewSlot] = useState({
    date: "",
    timeSlot: "",
    totalCapacity: 20
  });

  const [bulkForm, setBulkForm] = useState({
    startDate: "",
    endDate: "",
    selectedDays: [1, 2, 3, 4, 5, 6, 0] as number[], // Mon-Sun
    timeSlots: [...DEFAULT_TIME_SLOTS],
    totalCapacity: 20
  });

  const [customTime, setCustomTime] = useState({
    name: "",
    startTime: "10:00",
    endTime: "12:00"
  });

  const [customTimeSlots, setCustomTimeSlots] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      fetchUser();
    }
  }, [loading, user, fetchUser]);

  useEffect(() => {
    if (!loading && user && user.role !== "winery") {
      router.push("/");
    }
  }, [user, loading, router]);

  // Fetch slots for current month view
  const fetchSlots = async () => {
    setLoadingSlots(true);
    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0);

      const url = `/api/winery-dashboard/slots?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSlots(data.slots || []);
      } else {
        toast.error("Failed to load slots");
      }
    } catch (error) {
      console.error("Failed to fetch slots:", error);
      toast.error("Error loading slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (user?.role === "winery") {
      fetchSlots();
    }
  }, [user, currentMonth]);

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped: DaySlots = {};
    slots.forEach(slot => {
      const dateKey = new Date(slot.date).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(slot);
    });
    return grouped;
  }, [slots]);

  // Calendar generation
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days: (Date | null)[] = [];

    // Add padding for previous month
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentMonth]);

  const handleAddSlot = async () => {
    if (!newSlot.date || !newSlot.timeSlot) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch("/api/winery-dashboard/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: newSlot.date,
          timeSlot: newSlot.timeSlot,
          totalCapacity: newSlot.totalCapacity
        })
      });

      if (response.ok) {
        toast.success("Slot added successfully!");
        setShowAddModal(false);
        setNewSlot({ date: selectedDate || "", timeSlot: "", totalCapacity: 20 });
        fetchSlots();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add slot");
      }
    } catch (error) {
      console.error("Failed to add slot:", error);
      toast.error("Error adding slot");
    }
  };

  const handleBulkCreate = async () => {
    if (!bulkForm.startDate || !bulkForm.endDate || bulkForm.timeSlots.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    const start = new Date(bulkForm.startDate);
    const end = new Date(bulkForm.endDate);

    if (start > end) {
      toast.error("End date must be after start date");
      return;
    }

    const datesToCreate: string[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (bulkForm.selectedDays.includes(d.getDay())) {
        datesToCreate.push(d.toISOString().split('T')[0]);
      }
    }

    if (datesToCreate.length === 0) {
      toast.error("No dates match the selected days of the week");
      return;
    }

    try {
      const response = await fetch("/api/winery-dashboard/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dates: datesToCreate,
          timeSlots: bulkForm.timeSlots,
          totalCapacity: bulkForm.totalCapacity
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Slots created correctly!");
        setShowBulkModal(false);
        fetchSlots();
      } else {
        toast.error(data.error || "Failed to create slots");
      }
    } catch (error) {
      console.error("Failed to bulk create slots:", error);
      toast.error("Error connecting to server");
    }
  };

  const handleToggleBlock = async (slot: TimeSlot) => {
    try {
      const newStatus = slot.status === 'blocked' ? 'available' : 'blocked';
      const response = await fetch("/api/winery-dashboard/slots", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: slot._id,
          status: newStatus
        })
      });

      if (response.ok) {
        toast.success(`Slot ${newStatus === 'blocked' ? 'blocked' : 'unblocked'}`);
        fetchSlots();
      } else {
        toast.error("Failed to update slot");
      }
    } catch (error) {
      console.error("Failed to toggle slot:", error);
      toast.error("Error updating slot");
    }
  };

  const handleUpdateCapacity = async (slot: TimeSlot, newCapacity: number) => {
    try {
      const response = await fetch("/api/winery-dashboard/slots", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: slot._id,
          totalCapacity: newCapacity
        })
      });

      if (response.ok) {
        toast.success("Capacity updated");
        fetchSlots();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update");
      }
    } catch (error) {
      console.error("Failed to update capacity:", error);
      toast.error("Error updating capacity");
    }
  };

  const addCustomTimeSlot = () => {
    if (!customTime.name || !customTime.startTime || !customTime.endTime) {
      toast.error("Please fill in all fields");
      return;
    }

    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    };

    const newTimeSlot = `${customTime.name} (${formatTime(customTime.startTime)} - ${formatTime(customTime.endTime)})`;
    setCustomTimeSlots([...customTimeSlots, newTimeSlot]);
    setCustomTime({ name: "", startTime: "10:00", endTime: "12:00" });
    setShowCustomTimeModal(false);
    toast.success("Custom time slot added!");
  };

  const getDateStatus = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const daySlots = slotsByDate[dateStr] || [];

    if (daySlots.length === 0) return 'empty';
    if (daySlots.some(s => s.status === 'blocked')) return 'partial';
    if (daySlots.every(s => s.availableCapacity === 0)) return 'full';
    return 'available';
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-gray-600">Loading availability...</p>
        </div>
      </div>
    );
  }

  const allTimeSlots = [...DEFAULT_TIME_SLOTS, ...customTimeSlots];

  return (
    <div className="min-h-screen bg-gray-100 pt-20 pb-20 md:pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              <FaCalendarAlt className="inline mr-3 text-primary" />
              Availability Calendar
            </h1>
            <p className="mt-2 text-gray-600">Manage your dates, time slots, and capacity</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => router.push("/winery-dashboard")} className="btn btn-ghost btn-sm">
              ← Dashboard
            </button>
            <button onClick={() => setShowBulkModal(true)} className="btn btn-secondary btn-sm">
              <FaCopy className="mr-1" /> Bulk Create
            </button>
            <button onClick={() => setShowCustomTimeModal(true)} className="btn btn-outline btn-sm">
              <FaClock className="mr-1" /> Custom Time
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              {/* Calendar Header */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <FaChevronLeft />
                </button>
                <h2 className="text-xl font-bold text-gray-800">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h2>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <FaChevronRight />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  if (!day) {
                    return <div key={`empty-${idx}`} className="h-20 bg-gray-50 rounded" />;
                  }

                  const dateStr = day.toISOString().split('T')[0];
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
                  const isSelected = dateStr === selectedDate;
                  const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
                  const status = getDateStatus(day);
                  const daySlots = slotsByDate[dateStr] || [];

                  return (
                    <button
                      key={dateStr}
                      onClick={() => !isPast && setSelectedDate(dateStr)}
                      disabled={isPast}
                      className={`
                        h-20 p-1 rounded-lg border-2 transition-all text-left flex flex-col
                        ${isPast ? 'bg-gray-100 opacity-50 cursor-not-allowed' : 'hover:border-primary cursor-pointer'}
                        ${isSelected ? 'border-primary bg-primary/10' : 'border-transparent'}
                        ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}
                      `}
                    >
                      <span className={`text-sm font-semibold ${isToday ? 'text-primary' : ''}`}>
                        {day.getDate()}
                      </span>
                      {daySlots.length > 0 && (
                        <div className="flex-1 flex flex-col justify-end">
                          <div className={`
                            text-xs px-1 py-0.5 rounded text-center
                            ${status === 'available' ? 'bg-green-100 text-green-700' : ''}
                            ${status === 'full' ? 'bg-red-100 text-red-700' : ''}
                            ${status === 'partial' ? 'bg-yellow-100 text-yellow-700' : ''}
                          `}>
                            {daySlots.length} slot{daySlots.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 bg-green-100 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 bg-yellow-100 rounded"></div>
                  <span>Partial/Blocked</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 bg-red-100 rounded"></div>
                  <span>Full</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 border-2 border-primary rounded"></div>
                  <span>Today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Date Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              {selectedDate ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">
                      {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </h3>
                    <button
                      onClick={() => {
                        setNewSlot({ ...newSlot, date: selectedDate });
                        setShowAddModal(true);
                      }}
                      className="btn btn-primary btn-sm btn-circle"
                    >
                      <FaPlus />
                    </button>
                  </div>

                  {loadingSlots ? (
                    <div className="text-center py-8">
                      <div className="loading loading-spinner loading-md"></div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(slotsByDate[selectedDate] || []).length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <FaClock className="mx-auto text-3xl mb-2 opacity-50" />
                          <p>No slots for this date</p>
                          <button
                            onClick={() => {
                              setNewSlot({ ...newSlot, date: selectedDate });
                              setShowAddModal(true);
                            }}
                            className="btn btn-primary btn-sm mt-4"
                          >
                            <FaPlus className="mr-1" /> Add Slot
                          </button>
                        </div>
                      ) : (
                        (slotsByDate[selectedDate] || []).map((slot) => (
                          <div
                            key={slot._id}
                            className={`
                              p-4 rounded-lg border-2 
                              ${slot.status === 'blocked' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}
                            `}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-semibold text-sm">{slot.timeSlot}</span>
                              <button
                                onClick={() => handleToggleBlock(slot)}
                                className={`btn btn-xs btn-ghost ${slot.status === 'blocked' ? 'text-green-600' : 'text-red-600'}`}
                                title={slot.status === 'blocked' ? 'Unblock' : 'Block'}
                              >
                                {slot.status === 'blocked' ? <FaUnlock /> : <FaLock />}
                              </button>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <FaUsers className="text-gray-400" />
                              <span className="text-gray-600">Capacity:</span>
                              <input
                                type="number"
                                value={slot.totalCapacity}
                                onChange={(e) => handleUpdateCapacity(slot, parseInt(e.target.value))}
                                className="input input-bordered input-xs w-16"
                                min={slot.bookedCapacity}
                              />
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              <span className="text-green-600 font-semibold">{slot.availableCapacity}</span> available /
                              <span className="text-blue-600 font-semibold ml-1">{slot.bookedCapacity}</span> booked
                            </div>
                            {slot.status === 'blocked' && (
                              <div className="mt-2 text-xs text-red-600 font-semibold">
                                <FaLock className="inline mr-1" /> BLOCKED
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FaCalendarAlt className="mx-auto text-4xl mb-3 opacity-50" />
                  <p>Select a date to manage slots</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Single Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add Time Slot</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={newSlot.date}
                  onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                  className="input input-bordered w-full"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot</label>
                <select
                  value={newSlot.timeSlot}
                  onChange={(e) => setNewSlot({ ...newSlot, timeSlot: e.target.value })}
                  className="select select-bordered w-full"
                >
                  <option value="">Select time...</option>
                  {allTimeSlots.map((slot, idx) => (
                    <option key={idx} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Capacity</label>
                <input
                  type="number"
                  value={newSlot.totalCapacity}
                  onChange={(e) => setNewSlot({ ...newSlot, totalCapacity: parseInt(e.target.value) })}
                  className="input input-bordered w-full"
                  min="1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowAddModal(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleAddSlot} className="btn btn-primary">Add Slot</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Create Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              <FaCopy className="inline mr-2 text-primary" />
              Bulk Create Slots
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Quickly create multiple time slots across a date range
            </p>

            <div className="space-y-6">
              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={bulkForm.startDate}
                    onChange={(e) => setBulkForm({ ...bulkForm, startDate: e.target.value })}
                    className="input input-bordered w-full"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={bulkForm.endDate}
                    onChange={(e) => setBulkForm({ ...bulkForm, endDate: e.target.value })}
                    className="input input-bordered w-full"
                    min={bulkForm.startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Days of Week */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Days of Week</label>
                <div className="flex flex-wrap gap-2">
                  {dayNames.map((day, idx) => (
                    <button
                      key={day}
                      onClick={() => {
                        const newDays = bulkForm.selectedDays.includes(idx)
                          ? bulkForm.selectedDays.filter(d => d !== idx)
                          : [...bulkForm.selectedDays, idx];
                        setBulkForm({ ...bulkForm, selectedDays: newDays });
                      }}
                      className={`
                        btn btn-sm
                        ${bulkForm.selectedDays.includes(idx) ? 'btn-primary' : 'btn-outline'}
                      `}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Time Slots</label>
                <div className="flex flex-wrap gap-2">
                  {allTimeSlots.map((slot, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const newSlots = bulkForm.timeSlots.includes(slot)
                          ? bulkForm.timeSlots.filter(s => s !== slot)
                          : [...bulkForm.timeSlots, slot];
                        setBulkForm({ ...bulkForm, timeSlots: newSlots });
                      }}
                      className={`
                        btn btn-xs rounded-full h-auto py-2 px-4 normal-case
                        ${bulkForm.timeSlots.includes(slot) ? 'btn-primary' : 'btn-outline border-gray-300'}
                      `}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacity per Slot</label>
                <input
                  type="number"
                  value={bulkForm.totalCapacity}
                  onChange={(e) => setBulkForm({ ...bulkForm, totalCapacity: parseInt(e.target.value) })}
                  className="input input-bordered w-full"
                  min="1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <button onClick={() => setShowBulkModal(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleBulkCreate} className="btn btn-primary">
                <FaCheck className="mr-1" /> Create Slots
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Time Slot Modal */}
      {showCustomTimeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              <FaClock className="inline mr-2 text-primary" />
              Create Custom Time Slot
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Define a custom time period for your tastings
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slot Name</label>
                <input
                  type="text"
                  value={customTime.name}
                  onChange={(e) => setCustomTime({ ...customTime, name: e.target.value })}
                  className="input input-bordered w-full"
                  placeholder="e.g., Late Morning, Sunset"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={customTime.startTime}
                    onChange={(e) => setCustomTime({ ...customTime, startTime: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    value={customTime.endTime}
                    onChange={(e) => setCustomTime({ ...customTime, endTime: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
            </div>

            {customTimeSlots.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-500 mb-2">Your Custom Time Slots:</p>
                <div className="flex flex-wrap gap-1">
                  {customTimeSlots.map((slot, idx) => (
                    <span key={idx} className="badge badge-primary badge-sm">{slot}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowCustomTimeModal(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={addCustomTimeSlot} className="btn btn-primary">
                <FaPlus className="mr-1" /> Add Time Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
