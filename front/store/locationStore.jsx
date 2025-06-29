import { create } from "zustand";
import * as Location from "expo-location";

export const useLocationStore = create((set) => ({
  regieon: null,
  city: null,
  coords: null,
  street: null,
  district: null,
  errormsg: null,
  getLocation: async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        set({ errormsg: "Permission denied" });
        return;
      }

      const loc = await Location.getCurrentPositionAsync();
      set({ coords: loc.coords });

      const geocode = await Location.reverseGeocodeAsync(loc.coords);
      const info = geocode[0];
      set({ city: info.city, regieon: info.region, district: info.district });
    } catch (err) {
      set({ errormsg: err.message });
    }
  },
}));
