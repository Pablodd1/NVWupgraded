"use client";
import React from "react";
import CancelBookingButton from "../buttons/cancel-booking";
import { Button } from "@/components/buttons/button";

interface BookingCardProps {
  booking: any;
  onBookUber?: (booking: any, service: "uber") => void;
}

export default function BookingCard({ booking, onBookUber }: BookingCardProps) {
  console.log("booking", booking);
  return (
    <div className="card bg-base-100 shadow hover:shadow-xl rounded-lg overflow-hidden">
      <div className="p-4 space-y-3">
        {/* Header with ID and creation info */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-sm font-semibold">Booking ID: {booking._id}</h2>
            <p className="text-xs text-gray-500">{new Date(booking.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex flex-col items-end">
            <span
              className={`badge text-xs ${
                booking.status === "confirmed" ? "badge-success" : booking.status === "pending" ? "badge-warning" : "badge-error"
              }`}
            >
              {booking.status.toUpperCase()}
            </span>
            <p className="text-xs text-gray-500 mt-1">
              {booking.payment_method === "pay_stripe" ? "User paid through Stripe" : "Pay at winery"}
            </p>
          </div>
        </div>

        {/* Special Requests */}
        {booking.specialRequests && (
          <p className="text-sm text-gray-700">
            <strong>Requests:</strong> {booking.specialRequests}
          </p>
        )}

        {/* Winery details displayed compactly */}
        <div>
          <h3 className="text-sm font-medium mb-1">Wineries:</h3>
          <ul className="space-y-1">
            {booking.wineries.map((wineryBooking: any, idx: number) => {
              const winery = wineryBooking.winery;
              return (
                <li key={idx} className="flex flex-col sm:flex-row justify-between items-start border rounded p-2 text-xs">
                  <span className="font-bold">{winery ? winery.name : "Unknown Winery"}</span>
                  <span className="text-gray-500">
                    {new Date(wineryBooking.datetime).toLocaleString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    })}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          {booking.status !== "cancelled" && <CancelBookingButton bookingId={booking._id} />}
          {booking.status === "confirmed" && booking.wineries && booking.wineries.length > 0 && onBookUber && (
            <Button onClick={() => onBookUber(booking, "uber")} className="bg-black text-white text-xs px-3 py-1">
              🚗 Book an Uber
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}