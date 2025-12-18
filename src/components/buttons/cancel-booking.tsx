"use client";
import React, { useState } from "react";

interface CancelBookingButtonProps {
  bookingId: string;
}

export default function CancelBookingButton({ bookingId }: CancelBookingButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/itinerary/book/${bookingId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Cancellation failed.");
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleCancel} className="btn btn-error btn-sm text-white h-full normal-case" disabled={loading}>
        {loading ? "Cancelling..." : "Cancel"}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
