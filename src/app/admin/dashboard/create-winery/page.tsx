"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaWineGlassAlt,
  FaMapMarkerAlt,
  FaGlobe,
  FaArrowLeft,
} from "react-icons/fa";
import { APIProvider } from "@vis.gl/react-google-maps";
import { AddressAutocomplete } from "@/components/common/AddressAutocomplete";

export default function CreateWineryAccount() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: User Account, 2: Winery Profile

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  });

  const [wineryData, setWineryData] = useState({
    wineryName: "",
    wineryAddress: "",
    wineryLat: 0,
    wineryLong: 0,
    wineryPhone: "",
    wineryEmail: "",
    wineryWebsite: "",
    wineryDescription: "",
  });

  // Auto-generate password
  const generatePassword = () => {
    const chars =
      "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setUserData({ ...userData, password });
    toast.info("Password generated! Copy it before proceeding.");
  };

  const handleNext = () => {
    // Validate step 1
    if (!userData.firstName || !userData.lastName || !userData.email || !userData.password || !userData.phone) {
      toast.error("Please fill all user account fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      toast.error("Invalid email format");
      return;
    }

    // Validate phone format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(userData.phone.replace(/[\s-()]/g, ""))) {
      toast.error("Invalid phone format. Use international format: +1-234-567-8900");
      return;
    }

    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate step 2
    if (!wineryData.wineryName || !wineryData.wineryAddress) {
      toast.error("Winery name and address are required");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/create-winery-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userData,
          ...wineryData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Winery account created successfully!");

        // Show credentials
        const credentials = `
📧 Email: ${userData.email}
🔑 Password: ${userData.password}
🏰 Winery: ${wineryData.wineryName}
        `;

        alert(`✅ Account Created!\n\n${credentials}\n\nMake sure to save these credentials!`);

        // Reset form
        setUserData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          phone: "",
        });
        setWineryData({
          wineryName: "",
          wineryAddress: "",
          wineryLat: 0,
          wineryLong: 0,
          wineryPhone: "",
          wineryEmail: "",
          wineryWebsite: "",
          wineryDescription: "",
        });
        setStep(1);

      } else {
        toast.error(data.message || "Failed to create winery account");
      }
    } catch (error) {
      console.error("Error creating winery account:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <FaWineGlassAlt className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create Winery Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Step {step} of 2: {step === 1 ? "User Account" : "Winery Profile"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex-1 h-2 rounded-l-full ${step >= 1 ? "bg-primary" : "bg-gray-200"}`}></div>
            <div className={`flex-1 h-2 rounded-r-full ${step >= 2 ? "bg-primary" : "bg-gray-200"}`}></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Owner Info</span>
            <span>Winery Details</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: User Account */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name *
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={userData.firstName}
                        onChange={(e) =>
                          setUserData({ ...userData, firstName: e.target.value })
                        }
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        placeholder="John"
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name *
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={userData.lastName}
                        onChange={(e) =>
                          setUserData({ ...userData, lastName: e.target.value })
                        }
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={userData.email}
                      onChange={(e) =>
                        setUserData({ ...userData, email: e.target.value })
                      }
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      placeholder="owner@winery.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={userData.phone}
                      onChange={(e) =>
                        setUserData({ ...userData, phone: e.target.value })
                      }
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      placeholder="+1-707-555-0123"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    International format: +1-234-567-8900
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <div className="mt-1 flex space-x-2">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={userData.password}
                        onChange={(e) =>
                          setUserData({ ...userData, password: e.target.value })
                        }
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary font-mono"
                        placeholder="Enter or generate password"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Generate
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    ⚠️ Make sure to copy and save the password before proceeding!
                  </p>
                </div>

                {/* Next Button */}
                <div>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Next: Winery Profile →
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Winery Profile */}
            {step === 2 && (
              <>
                {/* Winery Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Winery Name *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaWineGlassAlt className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={wineryData.wineryName}
                      onChange={(e) =>
                        setWineryData({ ...wineryData, wineryName: e.target.value })
                      }
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      placeholder="Napa Valley Estate Winery"
                    />
                  </div>
                </div>

                {/* Address with Autocomplete */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Winery Address *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <FaMapMarkerAlt className="text-gray-400" />
                    </div>
                    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
                      <AddressAutocomplete
                        value={wineryData.wineryAddress}
                        onChange={(address, lat, lng) => {
                          setWineryData({
                            ...wineryData,
                            wineryAddress: address,
                            wineryLat: lat || 0,
                            wineryLong: lng || 0,
                          });
                        }}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        placeholder="123 Vineyard Rd, Napa, CA 94558"
                      />
                    </APIProvider>
                  </div>
                  {wineryData.wineryLat !== 0 && wineryData.wineryLong !== 0 && (
                    <p className="mt-1 text-xs text-green-600">
                      ✓ Coordinates: {wineryData.wineryLat.toFixed(4)}, {wineryData.wineryLong.toFixed(4)}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={wineryData.wineryDescription}
                    onChange={(e) =>
                      setWineryData({
                        ...wineryData,
                        wineryDescription: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"
                    placeholder="Tell us about the winery's history, specialties, and unique features..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Winery Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Winery Phone
                    </label>
                    <input
                      type="tel"
                      value={wineryData.wineryPhone}
                      onChange={(e) =>
                        setWineryData({ ...wineryData, wineryPhone: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"
                      placeholder="(707) 555-0456"
                    />
                  </div>

                  {/* Winery Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Winery Email
                    </label>
                    <input
                      type="email"
                      value={wineryData.wineryEmail}
                      onChange={(e) =>
                        setWineryData({ ...wineryData, wineryEmail: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"
                      placeholder="info@winery.com"
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Website
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaGlobe className="text-gray-400" />
                    </div>
                    <input
                      type="url"
                      value={wineryData.wineryWebsite}
                      onChange={(e) =>
                        setWineryData({ ...wineryData, wineryWebsite: e.target.value })
                      }
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      placeholder="https://winery.com"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <FaArrowLeft className="mr-2" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-sm mr-2"></span>
                        Creating...
                      </>
                    ) : (
                      "Create Winery Account"
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Back to Dashboard Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="text-sm text-primary hover:text-primary/80"
          >
            ← Back to Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
