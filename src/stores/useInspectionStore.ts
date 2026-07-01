import type { FieldType } from "@/types";
import { create } from "zustand";
import type { InspectionApiResponse } from "@/lib/inspectionUtils";

interface UseInspectionStoreType {
  idInspecao: string | null;
  setIdInspecao: (id: string) => void;
  layoutObject: Partial<FieldType>[] | null;
  setLayoutObject: (layout: Partial<FieldType>[] | null) => void;
  rawResponse: InspectionApiResponse | null;
  setRawResponse: (response: InspectionApiResponse) => void;
}

export const useInspectionStore = create<UseInspectionStoreType>((set) => {
  const storedId = localStorage.getItem("idInspecao");

  return {
    idInspecao: storedId,
    setIdInspecao: (id: string) => {
      localStorage.setItem("idInspecao", id);
      set({ idInspecao: id });
    },
    layoutObject: null,
    setLayoutObject: (layoutObject) => set({ layoutObject }),
    rawResponse: null,
    setRawResponse: (rawResponse) => set({ rawResponse }),
  };
});

export const setIdInspecao = useInspectionStore.getState().setIdInspecao;
export const setInspectionLayout = useInspectionStore.getState().setLayoutObject;
export const setInspectionRawResponse = useInspectionStore.getState().setRawResponse;
