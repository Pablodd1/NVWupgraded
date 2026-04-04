import { useState, useEffect, useCallback } from "react";
import { Winery } from "@/app/interfaces";
import { mountainAVAs } from "@/data/data";
import BottomSheet from "../bottom-sheet";
import { FilterIcon, SearchIcon } from "lucide-react";
import { MdRestore } from "react-icons/md";
import { FilterBlock } from "./FilterBlock";
import { Filters, useFilterStore } from "@/hooks/useFilterStore";

interface FilterProps {
  wineries: Winery[];
  onFilterApply: (filteredWineries: Winery[]) => void;
}

const Filter = ({ wineries, onFilterApply }: FilterProps) => {
  const { filters, setFilters } = useFilterStore();

  const [isLoading, setIsLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(true);

  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || "");

  const applyFilters = useCallback(() => {
    setIsLoading(true);
    // Instead of doing client-side filtering here, we update the global store which triggers loadWineries in page.tsx
    // The actual filtering is done by `api/winery`.
    // The results will be loaded into `wineries` by page.tsx from the backend.

    // 1. Update global search query state first if it changed
    if (filters.searchQuery !== searchQuery) {
      handleFilterChange("searchQuery", searchQuery);
    }

    // We then emit onFilterApply with current parent `wineries` just to populate initially,
    // The real magic happens inside page.tsx capturing the `filters` state change and firing API query.
    onFilterApply(wineries);
    setIsLoading(false);
  }, [filters, wineries, onFilterApply, searchQuery]);

  // We DO NOT want the `useEffect` calling `applyFilters` automatically on every keystroke
  // because the user should press "Search" to execute the request to the database.
  useEffect(() => {
    // Only apply on initial load if needed, otherwise rely on manual trigger
  }, []); // Changed dependency array to empty to stop real-time filtering

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleSpecialFeatureChange = (feature: string, checked: boolean) => {
    if (checked) {
      filters.specialFeatures.push(feature);
    } else {
      const index = filters.specialFeatures.findIndex((spf) => spf === feature);
      filters.specialFeatures.splice(index, 1);
    }
    setFilters({ ...filters, specialFeatures: [...filters.specialFeatures] });
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      priceRange: [0, 1000],
      numberOfWines: [1, 10],
      wineType: { red: false, rosé: false, white: false, sparkling: false, dessert: false },
      ava: [],
      time: "",
      specialFeatures: [],
      numberOfPeople: [1, 20],
      toursAvailable: false,
      tastingPrice: 200,
      multipleTastings: false,
      foodPairings: false,
      handicapAccessible: false,
      allowsChildren: false,
      allowsNonDrinkers: false,
      mountainLocation: false,
      uberAvailability: false,
      searchQuery: ""
    });
    setShowResetModal(false);
  };


  const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);

  return (
    <>
      {/* Mobile Search Bar */}
      <div className="flex md:hidden flex-col gap-2 w-full mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search wineries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
          <SearchIcon size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <div className="flex flex-row gap-2">
          <button
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-all duration-300 ease-in-out bg-primary text-white shadow-glassmorphism text-sm font-medium"
            onClick={() => setBottomSheetOpen(true)}
            disabled={isLoading}
            aria-label="Apply Filters"
          >
            <FilterIcon size={18} />
            <span className="font-medium">Filters</span>
          </button>

          <button
            className="flex items-center justify-center space-x-2 px-4 py-3 rounded-md border border-wine-primary text-wine-primary bg-transparent hover:bg-wine-primary hover:text-white hover:shadow-neumorphism transition duration-300 ease-in-out text-sm font-medium"
            onClick={() => setShowResetModal(true)}
            aria-label="Reset Filters"
          >
            <MdRestore size={18} />
            <span className="font-medium">Reset</span>
          </button>

          <button
            className="flex items-center justify-center space-x-2 px-4 py-3 rounded-md bg-primary text-white hover:bg-primary/90 transition duration-300 ease-in-out text-sm font-semibold shadow-md"
            onClick={() => applyFilters()}
            aria-label="Search Wineries"
          >
            <FilterIcon size={18} />
            <span className="font-medium">Search</span>
          </button>
        </div>
      </div>

      <BottomSheet isOpen={isBottomSheetOpen} onClose={() => setBottomSheetOpen(false)}>
        <FilterBlock
          filters={filters}
          handleFilterChange={handleFilterChange}
          handleSpecialFeatureChange={handleSpecialFeatureChange}
          isFeaturesOpen={isFeaturesOpen}
          setIsFeaturesOpen={setIsFeaturesOpen}
        />
        <div className="p-4 border-t border-gray-200">
          <button
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-md bg-primary text-white hover:bg-primary/90 transition duration-300 ease-in-out text-sm font-semibold shadow-md"
            onClick={() => {
              applyFilters();
              setBottomSheetOpen(false);
            }}
            aria-label="Search Wineries"
          >
            <SearchIcon size={20} />
            <span>Search</span>
          </button>
        </div>
      </BottomSheet>
      <div className="hidden md:block p-4 bg-white shadow-lg rounded-lg w-full max-w-sm sm:max-w-md space-y-4 md:space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">Filter Wineries</h2>

        {/* Desktop Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search wineries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
          <SearchIcon size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <FilterBlock
          filters={filters}
          handleFilterChange={handleFilterChange}
          handleSpecialFeatureChange={handleSpecialFeatureChange}
          isFeaturesOpen={isFeaturesOpen}
          setIsFeaturesOpen={setIsFeaturesOpen}
        />

        <button
          className="flex-3 w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md border border-wine-primary text-wine-primary bg-transparent hover:bg-wine-primary hover:text-white hover:shadow-neumorphism transition duration-300 ease-in-out text-sm"
          onClick={() => setShowResetModal(true)}
          aria-label="Reset Filters"
        >
          <MdRestore size={20} />
          <span className="font-medium">Reset</span>
        </button>

        <button
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 mt-3 rounded-md bg-primary text-white hover:bg-primary/90 transition duration-300 ease-in-out text-sm font-semibold shadow-md"
          onClick={() => applyFilters()}
          aria-label="Search Wineries"
        >
          <FilterIcon size={20} />
          <span>Search</span>
        </button>
      </div>

      {showResetModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="modal modal-open">
            <div className="modal-box p-4 max-w-md bg-white rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold">Are you sure?</h2>
              <p className="text-gray-500 mt-2 text-sm">This will reset all the filters.</p>
              <div className="modal-action space-x-3">
                <button className="btn btn-ghost text-xs hover:bg-gray-200" onClick={() => setShowResetModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary text-xs hover:bg-indigo-500" onClick={resetFilters}>
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="mt-4 space-y-2">
          <div className="w-full h-4 bg-neutral-200 rounded animate-pulse"></div>
          <div className="w-full h-4 bg-neutral-200 rounded animate-pulse"></div>
          <div className="w-full h-4 bg-neutral-200 rounded animate-pulse"></div>
        </div>
      )}
    </>
  );
};

export default Filter;