"use client";
import { useState, useEffect } from "react";
import Image from "next/image"; // Assuming you have next/image, otherwise standard img
import { FaWineGlassAlt } from "react-icons/fa";

interface AgeGateSplashProps {
    onVerify: () => void;
}

export default function AgeGateSplash({ onVerify }: AgeGateSplashProps) {
    const [isVisible, setIsVisible] = useState(true);

    const handleEnter = () => {
        localStorage.setItem("age_verified", "true");
        setIsVisible(false);
        setTimeout(onVerify, 500); // Allow fade out
    };

    if (!isVisible) return null;

return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 text-black transition-opacity duration-500">
            <div className="text-center p-8 max-w-2xl">
                <div className="flex justify-center mb-6">
                    <FaWineGlassAlt size={60} className="text-black animate-pulse" />
                </div>

                <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-black">
                    WELCOME TO NAPA VALLEY
                </h1>

                <div className="space-y-6 mb-10">
                    <p className="text-lg text-gray-700">
                        To explore our vineyards and curated wine experiences, you must be of legal drinking age.
                    </p>

                    <div className="bg-gray-100/50 p-6 rounded-2xl border border-gray-300">
                        <h3 className="text-xl font-bold mb-2">California Alcohol Regulation Compliance</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            By entering this site, you acknowledge and agree to our <a href="/terms" className="text-black hover:underline">Terms of Service</a> and <a href="/privacy" className="text-black hover:underline">Privacy Policy</a>.
                            You affirm that you are at least 21 years of age. It is illegal to sell or serve alcohol to anyone under the age of 21.
                            Please drink responsibly.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => window.location.href = "https://google.com"}
                        className="px-8 py-4 rounded-xl font-bold text-gray-600 hover:text-black border border-gray-400 hover:border-gray-600 transition-all uppercase tracking-wider text-sm"
                    >
                        I am under 21
                    </button>

                    <button
                        onClick={handleEnter}
                        className="px-8 py-4 bg-black text-white rounded-xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20 uppercase tracking-widest"
                    >
                        Enter Site
                    </button>
                </div>

                <p className="mt-8 text-xs text-gray-800 font-mono">
                    EST. 2024 • NAPA VALLEY WINERIES
                </p>
            </div>
        </div>
    );
}
