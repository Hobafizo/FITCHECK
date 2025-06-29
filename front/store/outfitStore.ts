import { create } from "zustand";

type Outfit = {
  OutfitID: number;
  ItemIDs: number[];
  Favorite: false;
};

type OutfitStore = {
  outfits: Outfit[];
  setOutfits: (newOutfits: Outfit[]) => void;
  getOutfit: (OutfitID: number) => Outfit | undefined;
  getFavoriteOutfits: () => Outfit[] | undefined;
  getRecentOutfits: () => Outfit[] | undefined;
};

export const useOutfitStore = create<OutfitStore>((set) => ({
  outfits: [],
  setOutfits: (newOutfits) => set((state) => ({ outfits: newOutfits })),
  getOutfit: (OutfitID) => {
    return useOutfitStore
      .getState()
      .outfits.find((outfit: Outfit) => outfit.OutfitID === OutfitID);
  },
  getFavoriteOutfits: () => {
    return useOutfitStore
      .getState()
      .outfits.filter((outfit: Outfit) => outfit.Favorite);
  },
  getRecentOutfits: () => {
    return useOutfitStore.getState().outfits.slice(-3);
  },
}));
