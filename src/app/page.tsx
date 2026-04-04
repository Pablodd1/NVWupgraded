"use client";
// Build trigger: 2025-12-28 13:20
import { useState, useEffect, useRef, useCallback } from "react";
import AuthModal from "@/components/modal/AuthModal";
import AgeGateSplash from "@/components/AgeGateSplash";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useItinerary } from "@/store/itinerary";
import { Winery } from "./interfaces";
import WineryCard from "@/components/cards/winery-card";
import Filter from "@/components/filter-bar/filter-box";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { type NLPResult } from "@/lib/ai-nlp";
import { Filters, useFilterStore } from "@/hooks/useFilterStore";
import { useUIStore } from "@/store/uiStore";

// Lazy‑load the heavy voice‑search panel to improve initial bundle size
const VoiceSearchPanel = dynamic(() => import("@/components/voice-search/VoiceSearchPanel"), {
  ssr: false,
  loading: () => <div className="flex justify-center py-4"><span className="loading loading-spinner loading-lg text-primary"></span></div>,
});


export default function Home() {
  const [showPopup, setShowPopup] = useState(false);
  const { itinerary, setItinerary } = useItinerary();
  const { user, loading: authLoading } = useAuthStore();
  const router = useRouter();
  const [filteredWineries, setFilteredWineries] = useState<Winery[]>([]);
  const [wineries, setWineries] = useState<Winery[]>([]);
  const { showVoiceSearch } = useUIStore();
  const [nlpQuery, setNlpQuery] = useState<NLPResult | null>(null);
  const { filters, setFilters } = useFilterStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isAgeVerified, setIsAgeVerified] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if previously verified to skip splash, but for now we enforce it per session as requested
    const verified = localStorage.getItem("age_verified");
    if (verified === "true") {
      setIsAgeVerified(true);
    }
  }, []);

  // Auto-load saved user preferences into homepage filters, if present
  useEffect(() => {
    if (user?.preferences) {
      setFilters(user.preferences as any);
    }
  }, [user?.preferences]);

  const loadWineries = useCallback(async (pageNum: number, currentFilters: Filters, isNewFilter: boolean = false) => {
    try {
      if (pageNum === 1) setIsLoading(true);
      else setIsMoreLoading(true);

      const limit = 20;
      // Pass filters to the backend
      const response = await axios.get(`/api/winery`, {
        params: {
          page: pageNum,
          limit,
          filters: JSON.stringify(currentFilters)
        }
      });

      const newWineries = response.data.wineries || [];
      const total = response.data.total;

      if (isNewFilter) {
        setWineries(newWineries);
        setFilteredWineries(newWineries);
      } else {
        setWineries(prev => {
          // Prevent duplicates
          const existingIds = new Set(prev.map(w => w._id));
          const uniqueNew = newWineries.filter((w: Winery) => !existingIds.has(w._id));
          return [...prev, ...uniqueNew];
        });
        setFilteredWineries(prev => {
          const existingIds = new Set(prev.map(w => w._id));
          const uniqueNew = newWineries.filter((w: Winery) => !existingIds.has(w._id));
          return [...prev, ...uniqueNew];
        });
      }

      setHasMore(newWineries.length === limit);

    } catch (err) {
      console.error("Failed to fetch wineries", err);
      toast.error("Unable to load wineries. Please try again later.");
    } finally {
      setIsLoading(false);
      setIsMoreLoading(false);
    }
  }, []);

  // Effect to load initial or when filters update from backend
  useEffect(() => {
    setPage(1);
    loadWineries(1, filters, true);
  }, [filters, loadWineries]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isMoreLoading && !isLoading) {
          setPage(prev => {
            const nextPage = prev + 1;
            loadWineries(nextPage, filters, false);
            return nextPage;
          });
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isMoreLoading, isLoading, loadWineries, filters]);

  // Re-apply filters when `wineries` changes (due to pagination) or `filters` change
  useEffect(() => {
    // This logic is already handled by the Filter component's `onFilterApply` or internal effect?
    // Looking at `Filter` component usage: <Filter wineries={wineries} onFilterApply={setFilteredWineries} />
    // The Filter component takes `wineries` (all loaded so far) and returns `filteredWineries`.
    // So when `wineries` updates, Filter component should re-run its logic if it has specific effects or we need to trigger it.
    // `Filter` component has an effect `useEffect(() => { applyFilters(); }, [filters, applyFilters]);`
    // And `applyFilters` depends on `wineries`.
    // So just updating `wineries` should automatically update `filteredWineries` via the Filter component!
  }, [wineries]); // Redundant comment, just verifying logic.

  // Sort by featured status - featured wineries appear first
  const sortedFilteredWineries = [...filteredWineries].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return 0;
  });

  const addToItinerary = (winery: Winery) => {
    setItinerary(prev => {
      const isAlreadyAdded = prev.some(item => (item._id || item.name) === (winery._id || winery.name));
      if (!isAlreadyAdded) {
        return [...prev, winery];
      }
      return prev;
    });

    toast.success(`${winery?.name} added to your itinerary!`);
    // Use router.push to navigate to itinerary page so user can see their addition
    router.push("/itinerary");
  };

  const handleVoiceFilters = (result: NLPResult) => {
    setNlpQuery(result);
    // ... existing logic ...
    const newFilters: Partial<Filters> = {};
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

  return (
    <div className="min-h-screen relative pt-24 md:pt-28 pb-20 md:pb-32 bg-gray-100">
      {!isAgeVerified && <AgeGateSplash onVerify={() => setIsAgeVerified(true)} />}
      {showPopup && isAgeVerified && <AuthModal setShowPopup={setShowPopup} />}
      <div className="grid grid-cols-1 lg:grid-cols-4 px-4 sm:px-6 max-w-[1600px] mx-auto gap-6">

        <div className="lg:col-span-1 mb-4 lg:mb-10">
          {/* We pass all loaded wineries to the filter. Client-side filtering applies to "Loaded So Far" */}
          <Filter wineries={wineries} onFilterApply={setFilteredWineries} />
        </div>

        <div className="lg:col-span-3 space-y-6 lg:ml-10 mb-20">
          {/* Voice Search Toggle Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 sm:p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 mb-6 gap-3">
            <div>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                🍷 {nlpQuery ? "AI Selections" : "Napa Valley Collection"}
              </h2>
              <p className="text-sm text-gray-500 font-medium mt-1">
                {nlpQuery ? "Curated by your AI Sommelier" : "Curated Vineyards"}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
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
                  className="flex-1 md:flex-none px-6 py-3 border border-red-200 text-red-600 font-bold rounded-2xl hover:bg-red-50 transition-all text-center"
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

          {/* Winery List */}
          {isLoading && page === 1 ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="ml-3 text-gray-600">Loading wineries…</p>
            </div>
          ) : filteredWineries.length === 0 ? (
            <div className="bg-white p-12 rounded-xl text-center">
              <p className="text-lg text-gray-600 mb-4">No wineries match your filters</p>
              <button
                onClick={() => {
                  // Reset Logic
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
            <>
              {sortedFilteredWineries.map((winery, index) => (
                <WineryCard key={`${winery._id || winery.name}-${index}`} winery={winery} addToItinerary={addToItinerary} />
              ))}

              {/* Loader for Infinite Scroll */}
              <div ref={observerTarget} className="flex justify-center py-6 h-20">
                {isMoreLoading && <span className="loading loading-spinner loading-md text-primary"></span>}
              </div>
            </>
          )}
        </div>
      </div>
    </div >
  );
}
