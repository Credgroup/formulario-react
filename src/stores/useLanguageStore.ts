import { create } from "zustand";

export type LanguagesType = "pt" | "en" | "es"

interface UseLanguageType {
  lng: LanguagesType | null;
  setLng: (id: LanguagesType) => void;
}

export const useLanguageStore = create<UseLanguageType>((set) => {
  const lngSelected = localStorage.getItem("lng") as LanguagesType;

  return {
    lng: lngSelected,
    setLng: (lng) => {
      localStorage.setItem("lng", lng);
      set({ lng });
    },
  };
});

export const setLng =
  useLanguageStore.getState().setLng;
export const lngSelected =
  useLanguageStore.getState().lng;
