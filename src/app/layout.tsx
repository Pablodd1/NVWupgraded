"use client";
import React, { useEffect, useState } from "react";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { ItineraryProvider } from "@/store/itinerary";
import WineLoader from "@/components/loader/wine-loader";
import { ToastContainer } from "react-toastify";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [isAppLoading, setAppLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setAppLoading(false);
    }, 500);
  }, []);

  return (
    <html lang="en">
      <body className="font-inter">
        {isAppLoading ? (
          <WineLoader />
        ) : (
          <ItineraryProvider>
            <Navbar />
            {children}
          </ItineraryProvider>
        )}
        {/* <ToastContainer theme="colored" stacked={true} newestOnTop={true} /> */}
      </body>
    </html>
  );
}
