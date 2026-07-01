import { create } from "zustand";

interface UseRecommendationStoreType {
  idInspecao: string | null;
  idOperacao: string | null;
  setIds: (idInspecao: string, idOperacao: string) => void;
}

export const useRecommendationStore = create<UseRecommendationStoreType>((set) => {
  const storedIdInspecao = localStorage.getItem("rec_idInspecao");
  const storedIdOperacao = localStorage.getItem("rec_idOperacao");

  return {
    idInspecao: storedIdInspecao,
    idOperacao: storedIdOperacao,
    setIds: (idInspecao: string, idOperacao: string) => {
      localStorage.setItem("rec_idInspecao", idInspecao);
      localStorage.setItem("rec_idOperacao", idOperacao);
      set({ idInspecao, idOperacao });
    },
  };
});

export const setRecommendationIds = useRecommendationStore.getState().setIds;
