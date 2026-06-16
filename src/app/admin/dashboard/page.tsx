"use client";
import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  BarChart3,
  Users,
  Wine,
  DollarSign,
  ArrowRight,
  Download,
  Plus,
  Settings,
  X
} from "lucide-react";

const fetcher = (url: string) => fetch(url, { method: "GET" }).then((res) => res.json());

export default function Dashboard() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, error, mutate } = useSWR(`/api/admin/bookings?page=${page}&limit=${limit}`, fetcher);
  const { data: stats } = useSWR('/api/admin/stats', fetcher);

  if (error) return <div className="min-h-screen pt-24 text-center">Error loading dashboard.</div>;
  if (!data) return <div className="min-h-screen p-4 pt-24 text-center">Loading Admin Dashboard...</div>;

  const { bookings, totalPages, currentPage } = data;

  const handleConfirm = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/confirm`, { method: "PATCH" });
      if (res.ok) {
        mutate();
        toast.success("Booking confirmed");
      }
    } catch (err) { console.error(err); }
  };

  const handleCancel = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/cancel`, { method: "PATCH" });
      if (res.ok) {
        mutate();
        toast.error("Booking cancelled");
      }
    } catch (err) { console.error(err); }
  };

  const openModal = (booking: any) => {
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedBooking(null);
    setModalOpen(false);
  };

  const exportCSV = () => {
    if (!bookings || bookings.length === 0) return toast.info("No bookings to export");
    const headers = ["Booking ID", "Customer", "Email", "Revenue", "Status", "Date"];
    const csvContent = [
      headers.join(","),
      ...bookings.map((b: any) => [
        b._id,
        `"${b.userId?.firstName} ${b.userId?.lastName}"`,
        b.userId?.email,
        b.totalPrice || 0,
        b.status,
        new Date(b.createdAt).toLocaleDateString()
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nvw-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 pt-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Executive Overview</h1>
            <p className="text-gray-500 mt-1">Manage bookings, track revenue, and analyze demographics.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
              <Download size={18} /> Export Data
            </button>
            <Link href="/admin/dashboard/create-winery" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
              <Plus size={18} /> New Winery
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Revenue" value={`$${stats?.revenue?.toLocaleString() || '0'}`} icon={<DollarSign className="text-green-600" />} trend="+12.5% from last month" color="bg-green-50" />
          <StatCard title="Active Users" value={stats?.totals?.users || '0'} icon={<Users className="text-blue-600" />} trend="All-time customers" color="bg-blue-50" />
          <StatCard title="Total Bookings" value={stats?.totals?.bookings || '0'} icon={<Wine className="text-berry-600" />} trend="Pending & Confirmed" color="bg-red-50" />
          <StatCard title="High Value Demo" value={stats?.demographics?.["31-45"] || '0'} icon={<BarChart3 className="text-purple-600" />} trend="Age range: 31-45" color="bg-purple-50" />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <QuickLink href="/admin/dashboard/users" label="Manage Users" icon={<Users size={20} />} sub="View customer profiles" />
          <QuickLink href="/admin/dashboard/winery/list" label="Wineries" icon={<Wine size={20} />} sub="Audit vineyard listings" />
          <QuickLink href="/admin/dashboard/winery" label="Inventory" icon={<Settings size={20} />} sub="Edit tasting packages" />
          <QuickLink href="/admin/dashboard/create-winery" label="Partners" icon={<Plus size={20} />} sub="Onboard new wineries" color="bg-primary text-white" />
        </div>

        {/* Main Accounts & Credentials Quick Reference */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">🔑 Main System Accounts & Passwords</h3>
              <p className="text-sm text-gray-500 mt-1">Quick reference of primary credentials for testing. To reset or change passwords, click "Manage Passwords".</p>
            </div>
            <Link href="/admin/dashboard/users" className="btn btn-primary rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-md shadow-primary/20">
              Manage Passwords
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-red-50/40 border border-red-100 rounded-2xl">
              <span className="px-2.5 py-0.5 bg-red-100 text-red-800 text-[10px] font-black rounded-full uppercase tracking-widest">Platform Admin</span>
              <h4 className="text-base font-bold text-gray-900 mt-3">admin@napawineries.com</h4>
              <p className="text-sm text-gray-600 mt-1">Default: <span className="font-mono bg-white px-2 py-0.5 rounded border font-semibold">Admin123!</span></p>
              <p className="text-xs text-gray-400 mt-3">Access: Users, wineries, analytics, global system controls</p>
            </div>

            <div className="p-5 bg-purple-50/40 border border-purple-100 rounded-2xl">
              <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-black rounded-full uppercase tracking-widest">Winery Owner</span>
              <h4 className="text-base font-bold text-gray-900 mt-3">owner@nvw.com</h4>
              <p className="text-sm text-gray-600 mt-1">Default: <span className="font-mono bg-white px-2 py-0.5 rounded border font-semibold">owner123</span></p>
              <p className="text-xs text-gray-400 mt-3">Access: Operating hours, pricing, availability slots, profile photos</p>
            </div>

            <div className="p-5 bg-blue-50/40 border border-blue-100 rounded-2xl">
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black rounded-full uppercase tracking-widest">Test Customer</span>
              <h4 className="text-base font-bold text-gray-900 mt-3">customer@test.com</h4>
              <p className="text-sm text-gray-600 mt-1">Default: <span className="font-mono bg-white px-2 py-0.5 rounded border font-semibold">customer123</span></p>
              <p className="text-xs text-gray-400 mt-3">Access: Itinerary building, voice search, tasting bookings</p>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white/50 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-gray-800">Recent Appointments</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">Live Tracking</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 text-left">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date Created</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Ticket Size</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((booking: any) => (
                  <tr key={booking._id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5 text-sm font-mono text-gray-400">#{booking._id.substring(booking._id.length - 6).toUpperCase()}</td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{booking.userId?.firstName} {booking.userId?.lastName}</span>
                        <span className="text-xs text-gray-500">{booking.userId?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600">
                      {new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-gray-900 px-3 py-1 bg-gray-100 rounded-lg">
                        ${booking.totalPrice?.toLocaleString() || '0'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm border ${booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-100' :
                          booking.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-red-50 text-red-700 border-red-100'
                        }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => openModal(booking)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all"
                      >
                        <ArrowRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-50 flex justify-between items-center text-sm font-medium">
              <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50">Previous</button>
              <span className="text-gray-500 tracking-widest">PAGE {currentPage} OF {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {modalOpen && selectedBooking && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[200] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative animate-in fade-in zoom-in duration-200">
            <button className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all" onClick={closeModal}>
              <X size={24} />
            </button>
            <div className="mb-8">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Booking Resolution</span>
              <h2 className="text-2xl font-black text-gray-900 mt-1">Order Details #{selectedBooking._id.substring(0, 8)}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <DetailRow label="Customer" value={`${selectedBooking.userId?.firstName} ${selectedBooking.userId?.lastName}`} />
                <DetailRow label="Email" value={selectedBooking.userId?.email} />
                <DetailRow label="Payment" value={selectedBooking.payment_method?.replace('_', ' ') || "Pay at Winery"} />
                <DetailRow label="Gross Revenue" value={`$${selectedBooking.totalPrice || '0'}`} highlight />
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Itinerary</h3>
                {selectedBooking.wineries?.map((w: any, i: number) => (
                  <div key={i} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-sm font-bold text-gray-800">{w.wineryId?.name}</p>
                    <p className="text-xs text-gray-500">{new Date(w.datetime).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedBooking.status === 'pending' && (
              <div className="mt-10 flex gap-4 pt-6 border-t border-gray-100">
                <button
                  onClick={() => { handleConfirm(selectedBooking._id); closeModal(); }}
                  className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                >
                  Approve Reservation
                </button>
                <button
                  onClick={() => { handleCancel(selectedBooking._id); closeModal(); }}
                  className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all"
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color}`}>{icon}</div>
        <span className="text-[10px] font-black text-green-500 uppercase">Live</span>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <h4 className="text-3xl font-black text-gray-900 my-1">{value}</h4>
        <p className="text-xs text-gray-500 font-medium">{trend}</p>
      </div>
    </div>
  );
}

function QuickLink({ href, label, icon, sub, color }: any) {
  return (
    <Link href={href} className={`p-5 rounded-2xl border flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] ${color || 'bg-white border-gray-100 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5'}`}>
      <div className={`p-3 rounded-xl ${color ? 'bg-white/20' : 'bg-gray-50 text-primary'}`}>{icon}</div>
      <div>
        <p className="text-sm font-bold leading-tight">{label}</p>
        <p className={`text-[10px] ${color ? 'text-white/70' : 'text-gray-400'}`}>{sub}</p>
      </div>
    </Link>
  );
}

function DetailRow({ label, value, highlight }: any) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className={`text-sm ${highlight ? 'font-black text-berry-600' : 'font-semibold text-gray-800'}`}>{value || 'N/A'}</p>
    </div>
  );
}
