"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import BookingCard from "@/components/cards/booking-card";
import WeatherWidget from "@/components/WeatherWidget";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get("/api/itinerary/book");
        setBookings(res.data.bookings || []);
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError("You need to be logged in to view your bookings.");
        } else {
          setError("Failed to fetch bookings.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getUserLocation = async () => {
    setLoadingLocation(true);
    return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCurrentLocation(location);
          setLoadingLocation(false);
          resolve(location);
        },
        (error) => {
          setLoadingLocation(false);
          reject(error);
        }
      );
    });
  };

  const openRideLink = (booking: any, service: "uber", location: { latitude: number; longitude: number }) => {
    const earliestWinery = booking.wineries[0];
    if (!earliestWinery || !earliestWinery.winery?.location) {
      alert("Dropoff location not available for this booking.");
      return;
    }
    const dropoffLatitude = earliestWinery.winery.location.latitude;
    const dropoffLongitude = earliestWinery.winery.location.longitude;
    const pickupTime = Math.floor(Date.now() / 1000) + 30 * 60;
    const rideURL = `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${location.latitude}&pickup[longitude]=${location.longitude}&dropoff[latitude]=${dropoffLatitude}&dropoff[longitude]=${dropoffLongitude}&pickup_time=${pickupTime}&intent=ride`;
    window.open(rideURL, "_blank");
  };

  const handleRideClick = async (booking: any, service: "uber") => {
    if (!currentLocation) {
      try {
        const location = await getUserLocation();
        openRideLink(booking, service, location);
      } catch {
        alert("Location access denied. Unable to book ride.");
      }
    } else {
      openRideLink(booking, service, currentLocation);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative md:top-10 top-5">
      <div className="lg:container">
        <WeatherWidget />
        <h1 className="text-2xl font-bold mb-6 mt-4">My Bookings</h1>
        {loading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <span className="loading loading-dots loading-lg"></span>
          </div>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : bookings.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center">
            <p className="text-lg text-gray-500 mb-4">No bookings found yet.</p>
            <a href="/" className="btn btn-primary">Start Planning Your Trip</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onBookUber={handleRideClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
