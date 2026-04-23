"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaWineGlassAlt,
  FaMapMarkerAlt,
  FaGlobe,
  FaArrowLeft,
  FaArrowRight,
  FaMagic,
  FaCheckCircle,
} from "react-icons/fa";
import { APIProvider } from "@vis.gl/react-google-maps";
import { AddressAutocomplete } from "@/components/common/AddressAutocomplete";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumInput } from "@/components/ui/PremiumInput";
import { cn } from "@/lib/utils";

export default function CreateWineryAccount() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

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

  const generatePassword = () => {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setUserData({ ...userData, password });
    toast.info("Secure password generated!");
  };

  const validateStep1 = () => {
    if (!userData.firstName || !userData.lastName || !userData.email || !userData.password || !userData.phone) {
      toast.error("Please fill all user account fields");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      toast.error("Invalid email format");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting Create Winery Form...", { userData, wineryData });

    if (!wineryData.wineryName || !wineryData.wineryAddress) {
      console.error("Validation Failed: Name or Address missing");
      toast.error("Winery name and address are required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/create-winery-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userData, ...wineryData }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Winery account created successfully!");
        alert(`✅ Account Created!\n\nEmail: ${userData.email}\nPassword: ${userData.password}\n\nCredentials are active.`);
        router.push("/admin/dashboard");
      } else {
        toast.error(data.message || "Failed to create winery account");
      }
    } catch (error) {
      console.error("Error creating winery account:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 premium-gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-secondary rounded-full blur-[120px]" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block p-4 bg-white rounded-2xl shadow-premium mb-4"
          >
            <FaWineGlassAlt className="h-10 w-10 text-primary" />
          </motion.div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-bold text-neutral-900 tracking-tight"
          >
            Onboard New Winery
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-neutral-600 font-medium"
          >
            Deploy a premium digital storefront in minutes
          </motion.p>
        </div>

        {/* Step Progress */}
        <div className="mb-10 px-4">
          <div className="flex items-center justify-between mb-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm",
                  step >= i ? "bg-primary text-white scale-110" : "bg-white text-neutral-400 border border-neutral-200"
                )}>
                  {step > i ? <FaCheckCircle /> : i}
                </div>
                <span className={cn(
                  "mt-2 text-xs font-semibold uppercase tracking-wider",
                  step >= i ? "text-primary" : "text-neutral-400"
                )}>
                  {i === 1 ? "Owner" : "Winery"}
                </span>
              </div>
            ))}
            <div className="absolute left-[50%] top-[20px] -translate-x-1/2 w-[120px] h-[2px] bg-neutral-200 -z-10">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: step === 2 ? "100%" : "0%" }}
              />
            </div>
          </div>
        </div>

        <GlassCard className="p-0 overflow-hidden bg-white/70">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="p-8 space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <PremiumInput
                      label="First Name"
                      placeholder="e.g. Robert"
                      icon={<FaUser />}
                      value={userData.firstName}
                      onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                    />
                    <PremiumInput
                      label="Last Name"
                      placeholder="e.g. Mondavi"
                      icon={<FaUser />}
                      value={userData.lastName}
                      onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                    />
                  </div>

                  <PremiumInput
                    label="Email Address"
                    type="email"
                    placeholder="owner@estates.com"
                    icon={<FaEnvelope />}
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  />

                  <PremiumInput
                    label="Phone Number"
                    placeholder="+1 (707) 000-0000"
                    icon={<FaPhone />}
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    helperText="International format preferred for SMS automation"
                  />

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
                    <div className="flex space-x-2">
                      <PremiumInput
                        label=""
                        type="text"
                        placeholder="••••••••••••"
                        icon={<FaLock />}
                        className="font-mono"
                        value={userData.password}
                        onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="h-[46px] px-6 bg-neutral-800 text-white rounded-xl hover:bg-black transition-colors flex items-center shadow-lg"
                      >
                        <FaMagic className="mr-2" /> Magic
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-premium hover:bg-primary/90 transition-all flex items-center justify-center text-lg"
                  >
                    Next Details <FaArrowRight className="ml-2" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="p-8 space-y-6"
                >
                  <PremiumInput
                    label="Winery Name"
                    placeholder="The Napa Collection"
                    icon={<FaWineGlassAlt />}
                    value={wineryData.wineryName}
                    onChange={(e) => setWineryData({ ...wineryData, wineryName: e.target.value })}
                  />

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Physical Address</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 z-[1] text-gray-400">
                        <FaMapMarkerAlt />
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
                          className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                      </APIProvider>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <PremiumInput
                      label="Public Phone"
                      placeholder="(707) 123-4567"
                      icon={<FaPhone />}
                      value={wineryData.wineryPhone}
                      onChange={(e) => setWineryData({ ...wineryData, wineryPhone: e.target.value })}
                    />
                    <PremiumInput
                      label="Public Email"
                      placeholder="info@winery.com"
                      icon={<FaEnvelope />}
                      value={wineryData.wineryEmail}
                      onChange={(e) => setWineryData({ ...wineryData, wineryEmail: e.target.value })}
                    />
                  </div>

                  <PremiumInput
                    label="Official Website"
                    placeholder="https://www.winery.com"
                    icon={<FaGlobe />}
                    value={wineryData.wineryWebsite}
                    onChange={(e) => setWineryData({ ...wineryData, wineryWebsite: e.target.value })}
                  />

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-8 py-4 bg-white border border-neutral-200 text-neutral-600 rounded-2xl font-bold hover:bg-neutral-50 transition-all flex items-center shadow-md"
                    >
                      <FaArrowLeft className="mr-2" /> Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-premium hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center text-lg"
                    >
                      {loading ? "Onboarding..." : "Instantiate Estate"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </GlassCard>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="text-neutral-500 hover:text-primary font-semibold transition-colors flex items-center justify-center mx-auto group"
          >
            <FaArrowLeft className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
            Exit to Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
}
