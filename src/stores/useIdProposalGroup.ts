import { create } from "zustand";

interface useIdProposalGroupType {
  idProposalGroup: string | null;
  setIdProposalGroup: (id: string) => void;
}

export const useIdProposalGroupStore = create<useIdProposalGroupType>((set) => {
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
