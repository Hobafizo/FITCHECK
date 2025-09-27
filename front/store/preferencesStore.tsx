import { create } from "zustand";
interface GeneralPreferences {
  selectedSkin: string;
  selectedStyle: string;
  selectedColorTone: string;
  customTheme: string[];
  setSelectedSkin: (skin: string) => void;
  setSelectedStyle: (style: string) => void;
  setSelectedColorTone: (tone: string) => void;
  setCustomTheme: (theme: string[]) => void;
  updateCustomTheme: () => void;
}

export const preferencesStore = create<GeneralPreferences>((set, get) => ({
  selectedSkin: "",
  selectedStyle: "Neutral",
  selectedColorTone: "Neutral",
  customTheme: [],
  setSelectedSkin: (skin) => set({ selectedSkin: skin }),
  setSelectedStyle: (style) => set({ selectedStyle: style }),
  setSelectedColorTone: (tone) => set({ selectedColorTone: tone }),
  setCustomTheme: (theme) => set({ customTheme: theme }),
  updateCustomTheme: () => {
    const { selectedSkin, selectedColorTone, setCustomTheme } = get();
    let theme: string[] = [];
    if (selectedSkin === "white") {
      theme = ["Dark"];
    } else if (selectedSkin === "black") {
      theme = ["Light"];
    } else if (selectedSkin === "brown") {
      theme = ["Light", "Dark"];
    }
    if (selectedColorTone && selectedColorTone !== "Neutral") {
      theme = [...theme, selectedColorTone];
    }
    setCustomTheme(theme);
  },
}));
