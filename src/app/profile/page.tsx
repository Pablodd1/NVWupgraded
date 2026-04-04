"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import axios from "axios";
import { Button } from "@/components/buttons/button";
import { useRouter } from "next/navigation";
import { wineTypes, specialFeatures, avaOrder } from "@/data/data";

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

    // Preferences state
    const [preferences, setPreferences] = useState({
        priceRange: user?.preferences?.priceRange || [0, 1000],
        wineType: user?.preferences?.wineType || { red: false, rosé: false, white: false, sparkling: false, dessert: false },
        ava: user?.preferences?.ava || [],
        specialFeatures: user?.preferences?.specialFeatures || [],
        numberOfPeople: user?.preferences?.numberOfPeople || [1, 20],
        allowsChildren: user?.preferences?.allowsChildren || false,
        allowsNonDrinkers: user?.preferences?.allowsNonDrinkers || false,
    });

    const handlePreferenceChange = (key: string, value: any) => {
        setPreferences((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleWineTypeChange = (type: string, checked: boolean) => {
        setPreferences((prev: any) => ({
            ...prev,
            wineType: { ...prev.wineType, [type]: checked }
        }));
    };

    const handleSpecialFeatureChange = (feature: string, checked: boolean) => {
        setPreferences((prev: any) => {
            if (checked) {
                return { ...prev, specialFeatures: [...prev.specialFeatures, feature] };
            } else {
                return { ...prev, specialFeatures: prev.specialFeatures.filter((f: string) => f !== feature) };
            }
        });
    };

    const handleSavePreferences = async () => {
        setLoading(true);
        try {
            const response = await axios.put("/api/user/profile", {
                preferences,
            });

            if (response.data.success) {
                toast.success("Preferences saved successfully!");
                updateUser({ preferences });
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to save preferences");
        } finally {
            setLoading(false);
        }
    };

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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

                {/* My Preferences Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 border-b pb-4 flex items-center gap-2">
                        🍷 My Winery Preferences
                    </h2>
                    <p className="text-gray-600 mb-6">Set your default preferences for searching wineries. These will be automatically applied when you search.</p>

                    <div className="space-y-6">
                        {/* Price Range */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Price Range: ${preferences.priceRange[0]} - ${preferences.priceRange[1]}</label>
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                step="50"
                                value={preferences.priceRange[1]}
                                onChange={(e) => handlePreferenceChange('priceRange', [preferences.priceRange[0], parseInt(e.target.value)])}
                                className="range range-primary range-sm w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>$0</span>
                                <span>$1000</span>
                            </div>
                        </div>

                        {/* Wine Types */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Wine Types</label>
                            <div className="flex flex-wrap gap-3">
                                {wineTypes.map((type) => (
                                    <label key={type} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-primary checkbox-sm"
                                            checked={preferences.wineType[type as keyof typeof preferences.wineType]}
                                            onChange={(e) => handleWineTypeChange(type, e.target.checked)}
                                        />
                                        <span className="text-sm">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* AVA Regions */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Preferred AVA Regions</label>
                            <select
                                multiple
                                value={preferences.ava}
                                onChange={(e) => handlePreferenceChange('ava', Array.from(e.target.selectedOptions, option => option.value))}
                                className="select select-bordered w-full h-32"
                            >
                                {avaOrder.map((ava) => (
                                    <option key={ava} value={ava}>{ava}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                        </div>

                        {/* Special Features */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Special Features</label>
                            <div className="flex flex-wrap gap-3">
                                {specialFeatures.map((feature) => (
                                    <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-primary checkbox-sm"
                                            checked={preferences.specialFeatures.includes(feature)}
                                            onChange={(e) => handleSpecialFeatureChange(feature, e.target.checked)}
                                        />
                                        <span className="text-sm">{feature}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Number of People */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Number of People: {preferences.numberOfPeople[0]} - {preferences.numberOfPeople[1]}</label>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                step="1"
                                value={preferences.numberOfPeople[1]}
                                onChange={(e) => handlePreferenceChange('numberOfPeople', [preferences.numberOfPeople[0], parseInt(e.target.value)])}
                                className="range range-primary range-sm w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>1</span>
                                <span>20</span>
                            </div>
                        </div>

                        {/* Family Friendly */}
                        <div className="flex flex-wrap gap-6 pt-2 border-t border-gray-100">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary"
                                    checked={preferences.allowsChildren}
                                    onChange={(e) => handlePreferenceChange('allowsChildren', e.target.checked)}
                                />
                                <span className="font-medium text-gray-700">Allows Children</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary"
                                    checked={preferences.allowsNonDrinkers}
                                    onChange={(e) => handlePreferenceChange('allowsNonDrinkers', e.target.checked)}
                                />
                                <span className="font-medium text-gray-700">Non-Drinker Friendly</span>
                            </label>
                        </div>

                        <Button
                            onClick={handleSavePreferences}
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3"
                        >
                            {loading ? "Saving..." : "Save Preferences"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
