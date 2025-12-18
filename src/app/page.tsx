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
import { FaRobot, FaStar, FaTimes, FaMicrophone } from "react-icons/fa";
import { useFilterStore } from "@/hooks/useFilterStore";

export default function Home() {
  const [showPopup, setShowPopup] = useState(false);
  const { itinerary, setItinerary } = useItinerary();
  const { user, loading } = useAuthStore();
  const [filteredWineries, setFilteredWineries] = useState<Winery[]>([]);
  const [wineries, setWineries] = useState<Winery[]>([]);
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [nlpQuery, setNlpQuery] = useState<NLPResult | null>(null);
  const { setFilters } = useFilterStore();

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

  const handleVoiceFilters = (result: NLPResult) => {
    setNlpQuery(result);

    // Map NLP result to Filter Store
    const newFilters: any = {};

    if (result.filters.ava) {
      newFilters.ava = result.filters.ava;
    }

    if (result.filters.wineTypes) {
      const wineTypeMap: any = { red: false, rosé: false, white: false, sparkling: false, dessert: false };
      result.filters.wineTypes.forEach(type => {
        const lowerType = type.toLowerCase() as keyof typeof wineTypeMap;
        if (wineTypeMap.hasOwnProperty(lowerType)) {
          wineTypeMap[lowerType] = true;
        }
      });
      newFilters.wineType = wineTypeMap;
    }

    if (result.filters.priceRange) {
      const min = result.filters.priceRange.min || 0;
      const max = result.filters.priceRange.max || 1000;
      newFilters.priceRange = [min, max];
    }

    if (result.filters.features) {
      newFilters.specialFeatures = result.filters.features;
    }

    if (result.filters.timePreference && result.filters.timePreference.length > 0) {
      newFilters.time = result.filters.timePreference[0];
    }

    setFilters(newFilters);
    toast.success("AI filters applied!");
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
          {/* Voice Search Toggle */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                🍷 {nlpQuery ? "AI Filtered Experience" : "Explore Wineries"}
              </h2>
              <p className="text-sm text-gray-500">
                {nlpQuery ? "Showing results based on your AI search" : "Use filters or voice search to find your perfect winery"}
              </p>
            </div>
            <button
              onClick={() => setShowVoiceSearch(!showVoiceSearch)}
              className={`btn btn-sm ${showVoiceSearch ? 'btn-error' : 'btn-primary'} flex items-center gap-2`}
            >
              {showVoiceSearch ? <FaTimes /> : <FaMicrophone />}
              {showVoiceSearch ? "Close AI Search" : "AI Voice Search"}
            </button>
          </div>

          {/* Voice Search Panel */}
          {showVoiceSearch && (
            <VoiceSearchPanel
              onFiltersApplied={handleVoiceFilters}
              className="mb-8 border-2 border-primary/20 animate-in fade-in slide-in-from-top-4 duration-300"
            />
          )}

          {filteredWineries.length === 0 ? (
            <div className="bg-white p-12 rounded-xl text-center">
              <p className="text-lg text-gray-600 mb-4">No wineries match your filters</p>
              <button
                onClick={() => {
                  setFilters({
                    priceRange: [0, 1000],
                    wineType: { red: false, rosé: false, white: false, sparkling: false, dessert: false },
                    ava: [],
                    time: "",
                    specialFeatures: []
                  } as any);
                  setNlpQuery(null);
                }}
                className="btn btn-outline btn-primary"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredWineries.map((winery, index) => <WineryCard key={index} winery={winery} addToItinerary={addToItinerary} />)
          )}
        </div>
      </div>
    </div>
  );
}
