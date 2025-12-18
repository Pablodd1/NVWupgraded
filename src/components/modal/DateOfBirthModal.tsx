"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import axios from "axios";

interface DateOfBirthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DateOfBirthModal({ isOpen, onClose, onSuccess }: DateOfBirthModalProps) {
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, fetchUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dateOfBirth) {
      toast.error("Please enter your date of birth");
      return;
    }

    // Check if user is 21 or older
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 21) {
      toast.error("You must be 21 or older to book wine tastings");
      return;
    }

    setLoading(true);
    try {
      await axios.put("/api/user/profile", { dateOfBirth });
      await fetchUser(); // Refresh user data
      toast.success("Date of birth updated successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error updating date of birth:", error);
      toast.error("Failed to update date of birth. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Age Verification Required</h2>
        <p className="text-gray-600 mb-4">
          To book wine tastings, we need to verify that you are 21 or older. Please enter your date of birth.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
