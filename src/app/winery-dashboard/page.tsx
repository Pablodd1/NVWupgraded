"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { 
  FaWineGlass, 
  FaCalendarAlt, 
  FaClipboardList, 
  FaUser, 
  FaChartLine 
} from "react-icons/fa";

export default function WineryDashboard() {
  const { user, loading, fetchUser } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState({
    todayBookings: 0,
    pendingBookings: 0,
    totalCapacity: 0,
    availableSlots: 0
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

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const [bookingsRes, slotsRes] = await Promise.all([
          fetch("/api/winery-dashboard/bookings"),
          fetch("/api/winery-dashboard/slots")
        ]);

        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          const today = new Date().toISOString().split('T')[0];
          const todayBookings = bookingsData.bookings?.filter((b: any) => 
            b.createdAt?.startsWith(today)
          ).length || 0;
          const pending = bookingsData.bookings?.filter((b: any) => 
            b.status === "pending"
          ).length || 0;
          
          setStats(prev => ({
            ...prev,
            todayBookings,
            pendingBookings: pending
          }));
        }

        if (slotsRes.ok) {
          const slotsData = await slotsRes.json();
          const totalCap = slotsData.slots?.reduce((sum: number, slot: any) => 
            sum + (slot.totalCapacity || 0), 0
          ) || 0;
          const available = slotsData.slots?.reduce((sum: number, slot: any) => 
            sum + (slot.availableCapacity || 0), 0
          ) || 0;
          
          setStats(prev => ({
            ...prev,
            totalCapacity: totalCap,
            availableSlots: available
          }));
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    if (user?.role === "winery") {
      fetchStats();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (user.role !== "winery") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20 pb-20 md:pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Winery Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your winery profile, inventory, and bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Today's Bookings"
            value={stats.todayBookings}
            icon={<FaClipboardList className="text-blue-600" size={24} />}
            bgColor="bg-blue-50"
          />
          <StatCard
            title="Pending Bookings"
            value={stats.pendingBookings}
            icon={<FaCalendarAlt className="text-yellow-600" size={24} />}
            bgColor="bg-yellow-50"
          />
          <StatCard
            title="Total Capacity"
            value={stats.totalCapacity}
            icon={<FaWineGlass className="text-purple-600" size={24} />}
            bgColor="bg-purple-50"
          />
          <StatCard
            title="Available Slots"
            value={stats.availableSlots}
            icon={<FaChartLine className="text-green-600" size={24} />}
            bgColor="bg-green-50"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="Profile Management"
            description="Update your winery details, hours, and contact information"
            icon={<FaUser size={32} />}
            href="/winery-dashboard/profile"
            bgColor="bg-white"
          />
          <DashboardCard
            title="Inventory & Slots"
            description="Manage your availability, capacity, and time slots"
            icon={<FaCalendarAlt size={32} />}
            href="/winery-dashboard/inventory"
            bgColor="bg-white"
          />
          <DashboardCard
            title="Bookings"
            description="View and manage customer bookings and reservations"
            icon={<FaClipboardList size={32} />}
            href="/winery-dashboard/bookings"
            bgColor="bg-white"
          />
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ 
  title, 
  value, 
  icon, 
  bgColor 
}: { 
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  bgColor: string;
}) => (
  <div className={`${bgColor} rounded-lg shadow-md p-6`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
      <div className="p-3 rounded-full bg-white">
        {icon}
      </div>
    </div>
  </div>
);

const DashboardCard = ({ 
  title, 
  description, 
  icon, 
  href, 
  bgColor 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  href: string; 
  bgColor: string;
}) => (
  <Link href={href}>
    <div className={`${bgColor} rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 h-full`}>
      <div className="flex items-center mb-4">
        <div className="p-3 rounded-full bg-primary bg-opacity-10 text-primary">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
      <div className="mt-4 flex items-center text-primary font-semibold text-sm">
        <span>Manage</span>
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  </Link>
);
