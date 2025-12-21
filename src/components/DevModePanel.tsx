"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { FaUserAlt, FaUserShield, FaWineBottle, FaTimes, FaArrowRight } from "react-icons/fa";

const TEST_ACCOUNTS = {
    customer: { email: "customer@example.com", password: "customer123", label: "Customer", icon: FaUserAlt, redirect: "/" },
    admin: { email: "admin@napawineries.com", password: "admin123", label: "Admin", icon: FaUserShield, redirect: "/admin" },
    winery: { email: "owner@napawineries.com", password: "owner123", label: "Winery", icon: FaWineBottle, redirect: "/winery-dashboard" },
};

export default function DevModePanel() {
    const [isOpen, setIsOpen] = useState(true);
    const [loadingRole, setLoadingRole] = useState<string | null>(null);
    const { login, user, logout } = useAuthStore();
    const router = useRouter();

    const handleQuickLogin = async (role: keyof typeof TEST_ACCOUNTS) => {
        setLoadingRole(role);
        const account = TEST_ACCOUNTS[role];
        const result = await login(account.email, account.password);
        setLoadingRole(null);

        // Auto-redirect to role-specific page after successful login
        if (result.success) {
            router.push(account.redirect);
        }
    };

    const getDashboardLink = () => {
        if (!user) return null;
        if (user.role === "admin") return "/admin";
        if (user.role === "winery") return "/winery-dashboard";
        return "/itinerary";
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-50 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-all"
                title="Open Dev Panel"
            >
                🧪
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 w-72">
            <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">🧪 Dev Mode</span>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <FaTimes size={14} />
                </button>
            </div>

            {user ? (
                <div className="space-y-2">
                    <p className="text-sm text-gray-600 text-center">
                        Logged in as <span className="font-semibold text-primary">{user.role}</span>
                    </p>

                    {/* Quick Navigation Links */}
                    <button
                        onClick={() => router.push(getDashboardLink()!)}
                        className="btn btn-sm btn-primary w-full flex items-center justify-center gap-2"
                    >
                        Go to Dashboard <FaArrowRight size={12} />
                    </button>

                    <button
                        onClick={() => logout()}
                        className="btn btn-sm btn-outline btn-error w-full"
                    >
                        Logout
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    <p className="text-xs text-gray-500 text-center mb-2">Click to login & go to dashboard</p>
                    {(Object.keys(TEST_ACCOUNTS) as (keyof typeof TEST_ACCOUNTS)[]).map((role) => {
                        const account = TEST_ACCOUNTS[role];
                        const Icon = account.icon;
                        return (
                            <button
                                key={role}
                                onClick={() => handleQuickLogin(role)}
                                disabled={loadingRole !== null}
                                className="btn btn-sm btn-outline w-full flex items-center justify-between hover:bg-primary hover:text-white hover:border-primary transition-all"
                            >
                                <span className="flex items-center gap-2">
                                    {loadingRole === role ? (
                                        <span className="loading loading-spinner loading-xs"></span>
                                    ) : (
                                        <Icon size={14} />
                                    )}
                                    {account.label}
                                </span>
                                <FaArrowRight size={10} className="opacity-50" />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

