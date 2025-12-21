"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { FaUserAlt, FaUserShield, FaWineBottle, FaTimes } from "react-icons/fa";

const TEST_ACCOUNTS = {
    customer: { email: "customer@example.com", password: "customer123", label: "Customer", icon: FaUserAlt },
    admin: { email: "admin@napawineries.com", password: "admin123", label: "Admin", icon: FaUserShield },
    winery: { email: "owner@napawineries.com", password: "owner123", label: "Winery", icon: FaWineBottle },
};

export default function DevModePanel() {
    const [isOpen, setIsOpen] = useState(true);
    const [loadingRole, setLoadingRole] = useState<string | null>(null);
    const { login, user, logout } = useAuthStore();

    const handleQuickLogin = async (role: keyof typeof TEST_ACCOUNTS) => {
        setLoadingRole(role);
        const account = TEST_ACCOUNTS[role];
        await login(account.email, account.password);
        setLoadingRole(null);
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
        <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 w-64">
            <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">🧪 Dev Mode</span>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <FaTimes size={14} />
                </button>
            </div>

            {user ? (
                <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                        Logged in as <span className="font-semibold text-primary">{user.role}</span>
                    </p>
                    <button
                        onClick={() => logout()}
                        className="btn btn-sm btn-outline btn-error w-full"
                    >
                        Logout
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {(Object.keys(TEST_ACCOUNTS) as (keyof typeof TEST_ACCOUNTS)[]).map((role) => {
                        const account = TEST_ACCOUNTS[role];
                        const Icon = account.icon;
                        return (
                            <button
                                key={role}
                                onClick={() => handleQuickLogin(role)}
                                disabled={loadingRole !== null}
                                className="btn btn-sm btn-outline w-full flex items-center justify-start gap-2 hover:bg-primary hover:text-white hover:border-primary transition-all"
                            >
                                {loadingRole === role ? (
                                    <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                    <Icon size={14} />
                                )}
                                {account.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
