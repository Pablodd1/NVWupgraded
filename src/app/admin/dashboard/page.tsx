"use client";
import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";

const fetcher = (url: string) => fetch(url, { method: "GET" }).then((res) => res.json());

export default function Dashboard() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, error, mutate } = useSWR(`/api/admin/bookings?page=${page}&limit=${limit}`, fetcher);

  if (error) return <div>Error loading bookings.</div>;
  if (!data) return <div className="p-4">Loading bookings...</div>;

  const { bookings, totalPages, currentPage } = data;

  const handleConfirm = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/confirm`, {
        method: "PATCH",
      });
      if (res.ok) {
        mutate();
      } else {
        console.error("Failed to confirm booking");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/cancel`, {
        method: "PATCH",
      });
      if (res.ok) {
        mutate();
      } else {
        console.error("Failed to cancel booking");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (booking: any) => {
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedBooking(null);
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100 pt-20">
      <h3 className="text-2xl font-bold mb-4">Admin Dashboard</h3>
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/dashboard/create-winery" className="btn btn-primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Winery Account
        </Link>
        <Link href="/admin/dashboard/users" className="btn btn-secondary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Manage Users
        </Link>
        <Link href="/admin/dashboard/winery/list" className="btn btn-accent">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Wineries List
        </Link>
        <Link href="/admin/dashboard/winery" className="btn btn-info">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Winery
        </Link>
      </div>

      <h1>Bookings</h1>
      <hr />
      <div className="overflow-x-auto pb-10">
        <table className="min-w-full border-collapse border border-gray-200 rounded-lg shadow-md bg-white">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="w-1/6 border border-gray-200 px-4 py-2 text-left text-sm font-semibold uppercase tracking-wider">
                Booking Id
              </th>
              <th className="w-1/6 border border-gray-200 px-4 py-2 text-left text-sm font-semibold uppercase tracking-wider">
                User Name
              </th>
              <th className="w-1/6 border border-gray-200 px-4 py-2 text-left text-sm font-semibold uppercase tracking-wider">
                Email
              </th>
              <th className="w-1/4 border border-gray-200 px-4 py-2 text-left text-sm font-semibold uppercase tracking-wider">
                Booking Date
              </th>
              <th className="w-1/6 border border-gray-200 px-4 py-2 text-left text-sm font-semibold uppercase tracking-wider">
                Status
              </th>
              <th className="w-1/6 border border-gray-200 px-4 py-2 text-center text-sm font-semibold uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings && bookings.length > 0 ? (
              bookings.map((booking: any) => (
                <tr
                  key={booking._id}
                  className={`transition-colors duration-200 ${
                    booking._id % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100`}
                >
                  <td className="w-1/6 border border-gray-200 px-4 py-2 text-gray-800 text-sm font-mono truncate">
                    {booking._id}
                  </td>
                  <td className="w-1/6 border border-gray-200 px-4 py-2 text-gray-800 text-sm truncate">
                    {booking.userId?.name || "N/A"}
                  </td>
                  <td className="w-1/6 border border-gray-200 px-4 py-2 text-gray-800 text-sm truncate">
                    {booking.userId?.email || "N/A"}
                  </td>
                  <td className="w-1/4 border border-gray-200 px-4 py-2 text-gray-800 text-sm truncate">
                    {new Date(booking.createdAt).toLocaleString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </td>
                  <td className="w-1/6 border border-gray-200 px-4 py-2 text-gray-800 text-sm capitalize truncate">
                    {booking.status}
                  </td>
                  <td className="w-1/6 border border-gray-200 px-4 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      {booking.status === "pending" && (
                        <>
                          <button
                            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md shadow-sm transition-all duration-200 ease-in-out"
                            onClick={() => handleConfirm(booking._id)}
                            title="Confirm"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md shadow-sm transition-all duration-200 ease-in-out"
                            onClick={() => handleCancel(booking._id)}
                            title="Cancel"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      )}
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md shadow-sm transition-all duration-200 ease-in-out"
                        onClick={() => openModal(booking)}
                        title="View Details"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="border border-gray-200 px-4 py-2 text-center text-gray-800">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
        <div className="mt-4  pb-4  sm:mb-0  flex justify-center items-center gap-4">
          <button className="btn btn-sm" disabled={page === 1} onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-sm"
            disabled={page === totalPages}
            onClick={() => setPage((prev) => (prev < totalPages ? prev + 1 : prev))}
          >
            Next
          </button>
        </div>
      )}
      </div>

      {/* Pagination Controls */}


      {/* Booking Details Modal */}
      {modalOpen && selectedBooking && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md shadow-md max-w-3xl w-full relative">
            <button className="absolute top-2 right-2 text-gray-600" onClick={closeModal}>
              X
            </button>
            <h2 className="text-xl font-bold mb-4">Booking Details</h2>
            <div className="space-y-2">
              <p>
                <strong>Booking ID:</strong> {selectedBooking._id}
              </p>
              <p>
                <strong>User Name:</strong> {selectedBooking.userId?.name || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {selectedBooking.userId?.email || "N/A"}
              </p>
              <p>
                <strong>Status:</strong> {selectedBooking.status}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(selectedBooking.createdAt).toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>

              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Wineries:</h3>
                {selectedBooking.wineries && selectedBooking.wineries.length > 0 ? (
                  selectedBooking.wineries.map((winery: any, index: number) => (
                    <div key={index} className="border p-2 mb-2 rounded">
                      <p>
                        <strong>Winery Name:</strong> {winery.wineryId?.name || "N/A"}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(winery.datetime).toLocaleString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>No winery details available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
