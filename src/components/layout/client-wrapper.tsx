"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { ItineraryProvider } from "@/store/itinerary";
import WineLoader from "@/components/loader/wine-loader";
import AgeGate from "@/components/AgeGate";
import { LanguageProvider } from "@/context/LanguageContext";
import ChatWidget from "@/components/chat/ChatWidget";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
    const [isAppLoading, setAppLoading] = useState(true);
    const [ageVerified, setAgeVerified] = useState(false);
    const [checkingAge, setCheckingAge] = useState(true);

    useEffect(() => {
        setAppLoading(false);

        // Check if age already verified in session
        const verified = sessionStorage.getItem('ageVerified');
        const verifiedDate = sessionStorage.getItem('ageVerifiedDate');

        if (verified === 'true' && verifiedDate) {
            // Check if verification is still valid (within 24 hours)
            const verifiedTime = new Date(verifiedDate).getTime();
            const now = new Date().getTime();
            const hoursSinceVerification = (now - verifiedTime) / (1000 * 60 * 60);

            if (hoursSinceVerification < 24) {
                setAgeVerified(true);
            }
        }

        setCheckingAge(false);
    }, []);

    if (isAppLoading || checkingAge) {
        return <WineLoader />;
    }

    // Show age gate if not verified
    if (!ageVerified) {
        return (
            <AgeGate
                onVerified={() => setAgeVerified(true)}
                showSMSOptIn={true}
            />
        );
    }

    return (
        <LanguageProvider>
            <ItineraryProvider>
                <Navbar />
                {children}
                <ChatWidget />
                <ToastContainer position="bottom-right" theme="colored" />
            </ItineraryProvider>
        </LanguageProvider>
    );
}
