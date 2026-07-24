import { create } from "zustand";

interface UseLeadStoreType {
  idOperacao: string | null;
  idProduto: string | null;
  setLeadParams: (idOperacao: string, idProduto: string) => void;
}

export const useLeadStore = create<UseLeadStoreType>((set) => {
  const storedIdOperacao = localStorage.getItem("leadIdOperacao");
  const storedIdProduto = localStorage.getItem("leadIdProduto");

  return {
    idOperacao: storedIdOperacao,
    idProduto: storedIdProduto,
    setLeadParams: (idOperacao: string, idProduto: string) => {
      localStorage.setItem("leadIdOperacao", idOperacao);
      localStorage.setItem("leadIdProduto", idProduto);
      set({ idOperacao, idProduto });
    },
  };
});

export const setLeadParams = useLeadStore.getState().setLeadParams;
