import type { FieldType } from "@/types";
import { create } from "zustand";

interface useLayoutStoreType {
  layoutString: string | null;
  layoutObject: Partial<FieldType>[] | null;
  setLayout: (layout: string | null | Partial<FieldType>[]) => void;
}

export const useLayoutStore = create<useLayoutStoreType>((set) => ({
  layoutString: null,
  layoutObject: [],
  setLayout: (layout) => {
    if (typeof layout === "string") {
      set({ layoutString: layout });
      set({ layoutObject: handleConvertValue(layout) });
    } else if (Array.isArray(layout)) {
      set({ layoutObject: layout });
      set({ layoutString: handleConvertValue(layout) });
    } else {
      set({ layoutString: null });
      set({ layoutObject: null });
    }
  },
}));

function handleConvertValue(value: string | null | Partial<FieldType>[]) {
  if (typeof value === "string") {
    return JSON.parse(value);
  }
  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }
}

export const setLayout = useLayoutStore.getState().setLayout;
