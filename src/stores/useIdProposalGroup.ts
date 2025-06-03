import { create } from "zustand";

interface UseIdProposalGroupType {
  idProposalGroup: string | null;
  setIdProposalGroup: (id: string) => void;
}

export const useIdProposalGroupStore = create<UseIdProposalGroupType>((set) => {
  const storedPartnerId = localStorage.getItem("idProposalGroup");

  return {
    idProposalGroup: storedPartnerId,
    setIdProposalGroup: (id: string) => {
      localStorage.setItem("idProposalGroup", id);
      set({ idProposalGroup: id });
    },
  };
});

export const setIdProposalGroup =
  useIdProposalGroupStore.getState().setIdProposalGroup;
