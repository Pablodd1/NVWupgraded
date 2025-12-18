"use client";
import { useState, useEffect } from "react";
import AuthModal from "@/components/modal/AuthModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useItinerary } from "@/store/itinerary";
import { Winery } from "./interfaces";
import WineryCard from "@/components/cards/winnery-list";
import Filter from "@/components/filter-bar/filter-box";
import { SessionStorageService } from "@/lib/localstorage.config";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import VoiceSearchPanel from "@/components/voice-search/VoiceSearchPanel";
import { type NLPResult, generateWineryRecommendations } from "@/lib/ai-nlp";
import { FaRobot, FaStar, FaTimes } from "react-icons/fa";

export default function Home() {
  const [showPopup, setShowPopup] = useState(false);
  const { itinerary, setItinerary } = useItinerary();
  const { user, loading } = useAuthStore();
  const [filteredWineries, setFilteredWineries] = useState<Winery[]>([]);
  const [wineries, setWineries] = useState<Winery[]>([]);
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [nlpQuery, setNlpQuery] = useState<NLPResult | null>(null);

  const fetchWineries = async () => {
    const response = await axios.get("/api/winery");
    const wineriesData = response.data.wineries;
    
    // Migrate old payment_method format to new format for all wineries
    const migratedWineries = wineriesData.map((winery: any) => {
      if (typeof winery.payment_method === 'string') {
        winery.payment_method = { 
          type: winery.payment_method,
          external_booking_link: ''
        };
      }
      return winery;
    });
    
    setWineries(migratedWineries);
  };

  useEffect(() => {
    fetchWineries();
  }, []);

  const addToItinerary = (winery: any) => {
    setItinerary([...itinerary, winery]);
    toast.success(`${winery.name} added to your itinerary!`);
  };

  useEffect(() => {
    if (!loading) {
      const config = SessionStorageService.getConfig();
      if (config && config.isGuest) return setShowPopup(false);
      if (user) return setShowPopup(false);
      setShowPopup(true);
    }
  }, [loading]);

  return (
    <div className="min-h-screen relative md:top-20 top-[50px] bg-gray-100">
      {showPopup && <AuthModal setShowPopup={setShowPopup} />}
      <div className="grid grid-cols-1 lg:grid-cols-4 p-4 max-w-[1600px] mx-auto">
        <div className="lg:col-span-1 sm:col-span-1 mb-10">
          <Filter wineries={wineries} onFilterApply={setFilteredWineries} />
        </div>

        <div className="col-span-3 space-y-6 lg:ml-10 mb-20">
          {filteredWineries.length === 0 ? (
            <p className="text-center text-lg text-gray-600">No wineries match your filters</p>
          ) : (
            filteredWineries.map((winery, index) => <WineryCard key={index} winery={winery} addToItinerary={addToItinerary} />)
          )}
        </div>
      </div>
    </div>
  );
}
