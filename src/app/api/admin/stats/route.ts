import { dbConnect } from "@/lib/dbConnect";
import BookingModel from "@/models/booking.model";
import UserModel from "@/models/user.model";
import WineryModel from "@/models/winery.model";
import { NextResponse } from "next/server";
import { getUserIdFromToken } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const adminId = await getUserIdFromToken();
        if (!adminId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const admin = await UserModel.findById(adminId);
        if (!admin || admin.role !== "admin") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // 1. Total Revenue (Confirmed Bookings)
        const revenueData = await BookingModel.aggregate([
            { $match: { status: "confirmed" } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);
        const totalRevenue = revenueData[0]?.total || 0;

        // 2. Booking Status Breakdown
        const statusBreakdown = await BookingModel.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // 3. User Demographics (Age Groups)
        const users = await UserModel.find({ role: "customer" }).select("dateOfBirth");
        const now = new Date();
        const ageGroups = {
            "21-30": 0,
            "31-45": 0,
            "46-60": 0,
            "60+": 0,
            "Unknown": 0
        };

        users.forEach(u => {
            if (!u.dateOfBirth) {
                ageGroups["Unknown"]++;
                return;
            }
            const age = now.getFullYear() - u.dateOfBirth.getFullYear();
            if (age <= 30) ageGroups["21-30"]++;
            else if (age <= 45) ageGroups["31-45"]++;
            else if (age <= 60) ageGroups["46-60"]++;
            else ageGroups["60+"]++;
        });

        // 4. Platform Totals
        const totalUsers = await UserModel.countDocuments({ role: "customer" });
        const totalWineries = await WineryModel.countDocuments();
        const totalBookings = await BookingModel.countDocuments();

        // 5. Recent Activity (Last 5 bookings)
        const recentBookings = await BookingModel.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("userId", "firstName lastName");

        return NextResponse.json({
            revenue: totalRevenue,
            statusBreakdown,
            demographics: ageGroups,
            totals: {
                users: totalUsers,
                wineries: totalWineries,
                bookings: totalBookings
            },
            recentActivity: recentBookings
        });
    } catch (error: any) {
        console.error("Stats API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
