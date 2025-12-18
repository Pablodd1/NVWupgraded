"use client";
import { Winery } from "@/app/interfaces";
import { createContext, useContext, useState, ReactNode } from "react";

export interface BookingData {
  selectedDate: string;
  selectedTime: string;
  selectedTastingIndex: number;
  tasting: boolean;
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

  return <ItineraryContext.Provider value={{ itinerary, setItinerary }}>{children}</ItineraryContext.Provider>;
};

export const useItinerary = () => {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error("useItinerary must be used within an ItineraryProvider");
  }
  return context;
};