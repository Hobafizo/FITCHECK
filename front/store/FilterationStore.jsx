import { create } from "zustand";

export const useFilterStore = create((set, get) => ({
  filters: {
    Occasion: [],
    Category: [],
    Color: [],
    Season: [],
  },
  updateFilter: (filterGroup, updatedFilter) => {
    console.log("Updating filter:", filterGroup, updatedFilter);
    set((state) => ({
      filters: {
        ...state.filters,
        [filterGroup]: updatedFilter || [], // Ensure updatedFilter is always an array
      },
    }));
    // Correct usage of `get` to log the updated state
    console.log("Updated filters:", get().filters);
  },
  clearFilters: () => {
    set((state) => ({
      filters: {
        Occasion: [],
        Category: [],
        Color: [],
        Season: [],
      },
    }));
  },
}));
