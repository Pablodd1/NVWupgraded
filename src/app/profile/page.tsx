"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import axios from "axios";
import { Button } from "@/components/buttons/button";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const { user, updateUser } = useAuthStore();
    const router = useRouter();

    const [isEditingData, setIsEditingData] = useState(false);
    const [firstName, setFirstName] = useState(user?.firstName || "");
    const [lastName, setLastName] = useState(user?.lastName || "");
    const [phone, setPhone] = useState(user?.phone || "");

    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);

    if (!user) {
        if (typeof window !== "undefined") {
            router.push("/");
        }
        return null;
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put("/api/user/profile", {
                firstName,
                lastName,
                phone,
            });

            if (response.data.success) {
                toast.success("Profile updated successfully!");
                updateUser(response.data.user);
                setIsEditingData(false);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.put("/api/user/update-password", {
                currentPassword,
                newPassword,
            });

            if (response.data.success) {
                toast.success("Password updated successfully!");
                setIsEditingPassword(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-wine-background relative pt-24 md:pt-28 pb-32">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-serif font-bold text-wine-primary mb-8 text-center">Your Profile</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Profile Details Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 border-b pb-4">Personal Details</h2>

                        {!isEditingData ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-black text-gray-500 uppercase tracking-wider">First Name</label>
                                    <p className="text-lg text-gray-900 font-medium">{user.firstName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-gray-500 uppercase tracking-wider">Last Name</label>
                                    <p className="text-lg text-gray-900 font-medium">{user.lastName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-gray-500 uppercase tracking-wider">Email</label>
                                    <p className="text-lg text-gray-900 font-medium">{user.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-gray-500 uppercase tracking-wider">Phone</label>
                                    <p className="text-lg text-gray-900 font-medium">{user.phone || "Not provided"}</p>
                                </div>
                                <Button
                                    onClick={() => setIsEditingData(true)}
                                    className="mt-6 w-full bg-wine-secondary hover:bg-wine-primary transition-all text-white font-bold"
                                >
                                    Edit Details
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-black text-gray-700 mb-1">First Name</label>
                                    <input
                                        id="firstName"
                                        type="text"
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="input input-bordered w-full bg-gray-50 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-black text-gray-700 mb-1">Last Name</label>
                                    <input
                                        id="lastName"
                                        type="text"
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="input input-bordered w-full bg-gray-50 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-black text-gray-700 mb-1">Phone</label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="input input-bordered w-full bg-gray-50 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            setIsEditingData(false);
                                            setFirstName(user.firstName || "");
                                            setLastName(user.lastName || "");
                                            setPhone(user.phone || "");
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-wine-primary hover:bg-wine-primary/90 text-white font-bold"
                                    >
                                        {loading ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Security Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 border-b pb-4">Security</h2>

                        {!isEditingPassword ? (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-black text-gray-500 uppercase tracking-wider mb-2">Password</label>
                                    <p className="text-gray-500 italic">••••••••••••</p>
                                </div>
                                <Button
                                    onClick={() => setIsEditingPassword(true)}
                                    variant="outline"
                                    className="w-full text-wine-primary border-wine-primary hover:bg-wine-primary hover:text-white transition-all font-bold"
                                >
                                    Change Password
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <div>
                                    <label htmlFor="currentPassword" className="block text-sm font-black text-gray-700 mb-1">Current Password</label>
                                    <input
                                        id="currentPassword"
                                        type="password"
                                        required
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="input input-bordered w-full bg-gray-50 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-black text-gray-700 mb-1">New Password</label>
                                    <input
                                        id="newPassword"
                                        type="password"
                                        required
                                        minLength={6}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="input input-bordered w-full bg-gray-50 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-black text-gray-700 mb-1">Confirm New Password</label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        required
                                        minLength={6}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="input input-bordered w-full bg-gray-50 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            setIsEditingPassword(false);
                                            setCurrentPassword("");
                                            setNewPassword("");
                                            setConfirmPassword("");
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-wine-primary hover:bg-wine-primary/90 text-white font-bold"
                                    >
                                        {loading ? "Updating..." : "Update Password"}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
