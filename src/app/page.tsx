"use client";
// Build trigger: 2025-12-28 13:20
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
import dynamic from "next/dynamic";
import { type NLPResult } from "@/lib/ai-nlp";
import { useFilterStore } from "@/hooks/useFilterStore";
import { useUIStore } from "@/store/uiStore";
import DevModePanel from "@/components/DevModePanel";
import DirectBookingSection from "@/components/DirectBookingSection";

// Lazy‑load the heavy voice‑search panel to improve initial bundle size
const VoiceSearchPanel = dynamic(() => import("@/components/voice-search/VoiceSearchPanel"), {
  ssr: false,
  loading: () => <div className="flex justify-center py-4"><span className="loading loading-spinner loading-lg text-primary"></span></div>,
});

export default function Home() {
  const [showPopup, setShowPopup] = useState(false);
  const { itinerary, setItinerary } = useItinerary();
  const { user, loading: authLoading } = useAuthStore();
  const [filteredWineries, setFilteredWineries] = useState<Winery[]>([]);
  const [wineries, setWineries] = useState<Winery[]>([]);
  const { showVoiceSearch } = useUIStore();
  const [nlpQuery, setNlpQuery] = useState<NLPResult | null>(null);
  const { setFilters } = useFilterStore();
  const [isLoading, setIsLoading] = useState(false);

  const fetchWineries = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/winery");
      const wineriesData = response.data.wineries;

      setWineries(wineriesData);
      setFilteredWineries(wineriesData);
    } catch (err) {
      console.error("Failed to fetch wineries", err);
      toast.error("Unable to load wineries. Please try again later.");
    } finally {
      setIsLoading(false);
    }
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
    const newFilters: any = {};
    if (result.filters.ava) newFilters.ava = result.filters.ava;
    if (result.filters.wineTypes) {
      const wineTypeMap: any = { red: false, rosé: false, white: false, sparkling: false, dessert: false };
      result.filters.wineTypes.forEach((type) => {
        const lower = type.toLowerCase() as keyof typeof wineTypeMap;
        if (wineTypeMap.hasOwnProperty(lower)) wineTypeMap[lower] = true;
      });
      newFilters.wineType = wineTypeMap;
    }
    if (result.filters.priceRange) {
      const min = result.filters.priceRange.min || 0;
      const max = result.filters.priceRange.max || 1000;
      newFilters.priceRange = [min, max];
    }
    if (result.filters.features) newFilters.specialFeatures = result.filters.features;
    if (result.filters.timePreference && result.filters.timePreference.length > 0) {
      newFilters.time = result.filters.timePreference[0];
    }
    setFilters(newFilters);
    toast.success("AI filters applied!");
  };

  // Dev Mode: Disabled mandatory login popup for testing
  // useEffect(() => {
  //   if (!authLoading) {
  //     const config = SessionStorageService.getConfig();
  //     if (config && config.isGuest) return setShowPopup(false);
  //     if (user) return setShowPopup(false);
  //     setShowPopup(true);
  //   }
  // }, [authLoading, user]);

  return (
    <div className="min-h-screen relative md:top-20 top-[50px] bg-gray-100">
      {showPopup && <AuthModal setShowPopup={setShowPopup} />}

      {/* Direct Booking Section */}
      <DirectBookingSection />

      <div className="grid grid-cols-1 lg:grid-cols-4 p-4 max-w-[1600px] mx-auto">
        <div className="lg:col-span-1 sm:col-span-1 mb-10">
          <Filter wineries={wineries} onFilterApply={setFilteredWineries} />
        </div>

        <div className="col-span-3 space-y-6 lg:ml-10 mb-20">
          {/* Voice Search Toggle Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                🍷 {nlpQuery ? "AI Selections" : "Napa Valley Collection"}
              </h2>
              <p className="text-sm text-gray-500 font-medium mt-1">
                {nlpQuery ? "Curated by your AI Sommelier" : "Discover 150+ world-class vineyard experiences"}
              </p>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    const res = await axios.get("/api/ai-search/surprise");
                    if (res.data.winery) {
                      setFilteredWineries([res.data.winery]);
                      toast.info(`Sommelier's Pick: "${res.data.reason}"`, { autoClose: 8000 });
                    }
                  } catch (e) {
                    toast.error("Sommelier is busy, try again later.");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-berry-600 to-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                🪄 Surprise Me
              </button>

              {nlpQuery && (
                <button
                  onClick={() => {
                    setNlpQuery(null);
                    setFilters({
                      priceRange: [0, 1000],
                      wineType: { red: false, rosé: false, white: false, sparkling: false, dessert: false },
                      ava: [],
                      time: "",
                      specialFeatures: [],
                    } as any);
                  }}
                  className="px-6 py-3 border border-red-200 text-red-600 font-bold rounded-2xl hover:bg-red-50 transition-all"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Voice Search Panel – lazy loaded */}
          {showVoiceSearch && (
            <VoiceSearchPanel onFiltersApplied={handleVoiceFilters} className="mb-8 border-2 border-primary/20 animate-in fade-in slide-in-from-top-4 duration-300" />
          )}

          {/* Loading indicator for wineries */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="ml-3 text-gray-600">Loading wineries…</p>
            </div>
          ) : filteredWineries.length === 0 ? (
            <div className="bg-white p-12 rounded-xl text-center">
              <p className="text-lg text-gray-600 mb-4">No wineries match your filters</p>
              <button
                onClick={() => {
                  setFilters({
                    priceRange: [0, 1000],
                    wineType: { red: false, rosé: false, white: false, sparkling: false, dessert: false },
                    ava: [],
                    time: "",
                    specialFeatures: [],
                  } as any);
                  setNlpQuery(null);
                }}
                className="btn btn-outline btn-primary"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredWineries.map((winery, index) => (
              <WineryCard key={index} winery={winery} addToItinerary={addToItinerary} />
            ))
          )}
        </div>
      </div>

      {/* Dev Mode Panel for Quick Login */}
      <DevModePanel />
    </div>
  );
}
