"use client";
import { useState } from "react";
import axios from "axios";
import { isUser21OrOlder } from "@/lib/ageVerification";
import { useAuthStore } from "@/store/authStore";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";

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
    if (!isUser21OrOlder(new Date(dateOfBirth))) {
      toast.error("You must be 21 or older to book wine tastings");
      return;
    }

    setLoading(true);
    try {
      // HANDLE DEMO MODE: If user ID starts with "demo_", skip API and update local store only
      if ((user as any)?._id?.toString().startsWith("demo_")) {
        console.log("Demo Mode detected: Skipping API update for Date of Birth");
        // Manual store update for demo user
        useAuthStore.setState((state) => ({
          user: state.user ? { ...state.user, dateOfBirth: new Date(dateOfBirth) } : null
        }));

        toast.success("Date of birth updated locally (Demo Mode)");
        onSuccess();
        onClose();
        return;
      }

      const response = await axios.put("/api/user/profile", { dateOfBirth });
      if (response.status === 200) {
        await fetchUser(); // Refresh user data
        toast.success("Date of birth updated successfully!");
        onSuccess();
        onClose();
      } else {
        throw new Error("Unexpected response status: " + response.status);
      }
    } catch (error: any) {
      console.error("Error updating date of birth:", error);
      const errorMsg = error.response?.data?.error || error.message || "Please try again.";
      toast.error(`Update failed: ${errorMsg}`);
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
