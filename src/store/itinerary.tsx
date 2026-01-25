"use client";
import { Winery } from "@/app/interfaces";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface BookingData {
  selectedDate: string;
  selectedTime: string;
  selectedTastingIndex: number;
  tasting: boolean;
  numberOfGuests?: number;
  foodPairings: { name: string; price: number }[];
  tours: { description: string; price: number }[];
  otherFeature: { description: string; price: number }[];
}

export type ItineraryWinery = Winery & { bookingDetails?: BookingData };

interface ItineraryContextType {
  itinerary: ItineraryWinery[];
  setItinerary: React.Dispatch<React.SetStateAction<ItineraryWinery[]>>;
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined);

export const ItineraryProvider = ({ children }: { children: ReactNode }) => {
  const [itinerary, setItinerary] = useState<ItineraryWinery[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("nvw_itinerary");
    if (saved) {
      try {
        setItinerary(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved itinerary", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever itinerary changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("nvw_itinerary", JSON.stringify(itinerary));
    }
  }, [itinerary, isInitialized]);

  return <ItineraryContext.Provider value={{ itinerary, setItinerary }}>{children}</ItineraryContext.Provider>;
};

export const useItinerary = () => {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error("useItinerary must be used within an ItineraryProvider");
  }
  return context;
};