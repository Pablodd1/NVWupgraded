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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 text-white transition-opacity duration-500">
            <div className="text-center p-8 max-w-2xl">
                <div className="flex justify-center mb-6">
                    <FaWineGlassAlt size={60} className="text-primary animate-pulse" />
                </div>

                <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">
                    WELCOME TO NAPA VALLEY
                </h1>

                <div className="space-y-6 mb-10">
                    <p className="text-lg text-gray-300">
                        To explore our vineyards and curated wine experiences, you must be of legal drinking age.
                    </p>

                    <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                        <h3 className="text-xl font-bold mb-2">California Alcohol Regulation Compliance</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            By entering this site, you acknowledge and agree to our Terms of Service and Privacy Policy.
                            You affirm that you are at least 21 years of age. It is illegal to sell or serve alcohol to anyone under the age of 21.
                            Please drink responsibly.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => window.location.href = "https://google.com"}
                        className="px-8 py-4 rounded-xl font-bold text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 transition-all uppercase tracking-wider text-sm"
                    >
                        I am under 21
                    </button>

                    <button
                        onClick={handleEnter}
                        className="px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest"
                    >
                        Enter Site
                    </button>
                </div>

                <p className="mt-8 text-xs text-gray-600 font-mono">
                    EST. 2024 • NAPA VALLEY WINERIES
                </p>
            </div>
        </div>
    );
}
