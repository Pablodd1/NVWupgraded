"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { ItineraryProvider } from "@/store/itinerary";
import WineLoader from "@/components/loader/wine-loader";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
    const [isAppLoading, setAppLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setAppLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    if (isAppLoading) {
        return <WineLoader />;
    }

    return (
        <ItineraryProvider>
            <Navbar />
            {children}
        </ItineraryProvider>
    );
}
