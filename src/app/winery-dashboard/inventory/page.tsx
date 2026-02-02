"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import { FaPlus, FaEdit, FaTrash, FaLock, FaUnlock } from "react-icons/fa";

interface TimeSlot {
  _id?: string;
  wineryId: string;
  date: string;
  timeSlot: string;
  totalCapacity: number;
  bookedCapacity: number;
  availableCapacity: number;
  isBlocked: boolean;
}

const DEFAULT_TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM"
];

export default function InventoryManagement() {
  const { user, loading, fetchUser } = useAuthStore();
  const router = useRouter();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [dateFilter, setDateFilter] = useState<string>("");

  // New slot form
  const [newSlot, setNewSlot] = useState({
    date: "",
    timeSlot: "",
    totalCapacity: 20
  });

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

  const fetchSlots = async () => {
    setLoadingSlots(true);
    try {
      let url = "/api/winery-dashboard/slots";
      if (dateFilter) {
        const endDate = new Date(dateFilter);
        endDate.setDate(endDate.getDate() + 30);
        url += `?startDate=${dateFilter}&endDate=${endDate.toISOString().split('T')[0]}`;
      }

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
  }, [user, dateFilter]);

  const handleAddSlot = async () => {
    if (!newSlot.date || !newSlot.timeSlot) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch("/api/winery-dashboard/slots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          date: newSlot.date,
          timeSlot: newSlot.timeSlot,
          totalCapacity: newSlot.totalCapacity
        })
      });

      if (response.ok) {
        toast.success("Slot added successfully!");
        setShowAddModal(false);
        setNewSlot({ date: "", timeSlot: "", totalCapacity: 20 });
        fetchSlots();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to add slot");
      }
    } catch (error) {
      console.error("Failed to add slot:", error);
      toast.error("Error adding slot");
    }
  };

  const handleUpdateSlot = async (slotId: string, updates: Partial<TimeSlot>) => {
    try {
      const response = await fetch("/api/winery-dashboard/slots", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          slotId,
          ...updates
        })
      });

      if (response.ok) {
        toast.success("Slot updated successfully!");
        setEditingSlot(null);
        fetchSlots();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update slot");
      }
    } catch (error) {
      console.error("Failed to update slot:", error);
      toast.error("Error updating slot");
    }
  };

  const handleToggleBlock = async (slot: TimeSlot) => {
    await handleUpdateSlot(slot._id!, { isBlocked: !slot.isBlocked });
  };

  if (loading || loadingSlots || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20 pb-20 md:pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory & Slots</h1>
            <p className="mt-2 text-gray-600">Manage your availability and capacity</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/winery-dashboard")}
              className="btn btn-ghost btn-sm"
            >
              ← Back
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary btn-sm"
            >
              <FaPlus className="mr-2" />
              Add Slot
            </button>
          </div>
        </div>

        {/* Date Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <label className="text-sm font-medium text-gray-700">
              Filter by date:
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input input-bordered input-sm"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter("")}
                className="btn btn-ghost btn-sm"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {/* Slots Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Slot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booked
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {slots.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No slots found. Add your first time slot to get started.
                    </td>
                  </tr>
                ) : (
                  slots.map((slot) => (
                    <tr key={slot._id} className={slot.isBlocked ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(slot.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {slot.timeSlot}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingSlot?._id === slot._id ? (
                          <input
                            type="number"
                            value={editingSlot?.totalCapacity || 0}
                            onChange={(e) => editingSlot && setEditingSlot({
                              ...editingSlot,
                              totalCapacity: parseInt(e.target.value)
                            })}
                            className="input input-bordered input-sm w-20"
                          />
                        ) : (
                          slot.totalCapacity
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {slot.bookedCapacity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`font-semibold ${slot.availableCapacity === 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                          {slot.availableCapacity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {slot.isBlocked ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Blocked
                          </span>
                        ) : slot.availableCapacity === 0 ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Full
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Available
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {editingSlot?._id === slot._id ? (
                            <>
                              <button
                                onClick={() => handleUpdateSlot(slot._id!, {
                                  totalCapacity: editingSlot?.totalCapacity || slot.totalCapacity
                                })}
                                className="text-green-600 hover:text-green-900"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingSlot(null)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingSlot(slot)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleToggleBlock(slot)}
                                className={`${slot.isBlocked ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'
                                  }`}
                                title={slot.isBlocked ? "Unblock" : "Block"}
                              >
                                {slot.isBlocked ? <FaUnlock /> : <FaLock />}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Add New Time Slot</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newSlot.date}
                  onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                  className="input input-bordered w-full"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Slot
                </label>
                <select
                  value={newSlot.timeSlot}
                  onChange={(e) => setNewSlot({ ...newSlot, timeSlot: e.target.value })}
                  className="select select-bordered w-full"
                >
                  <option value="">Select time...</option>
                  {DEFAULT_TIME_SLOTS.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Capacity
                </label>
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
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSlot}
                className="btn btn-primary"
              >
                Add Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
