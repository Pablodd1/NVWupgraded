import { create } from "zustand";

export type Filters = {
  priceRange: [number, number];
  numberOfWines: [number, number];
  wineType: { red: boolean; rosé: boolean; white: boolean; sparkling: boolean; dessert: boolean };
  ava: string[];
  time: string;
  specialFeatures: string[];
  numberOfPeople: [number, number];
  toursAvailable: boolean;
  tastingPrice: number;
  multipleTastings: boolean;
  foodPairings: boolean;
  mountainLocation: boolean;
  allowsChildren: boolean;
  allowsNonDrinkers: boolean;
<<<<<<< HEAD
  handicapAccessible: boolean;
  uberAvailability: boolean;
  lyftAvailability: boolean;
=======
  searchQuery: string;
>>>>>>> 02b657b8bd4daeadc2919ec1dd967032c2818b82
};

export interface FilterState {
  filters: Filters;
  setFilters: (newFilters: Partial<FilterState["filters"]>) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  filters: {
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
    mountainLocation: false,
    allowsChildren: false,
    allowsNonDrinkers: false,
<<<<<<< HEAD
    handicapAccessible: false,
    uberAvailability: false,
    lyftAvailability: false,
=======
    searchQuery: "",
>>>>>>> 02b657b8bd4daeadc2919ec1dd967032c2818b82
  },
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
}));