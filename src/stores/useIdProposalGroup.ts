import { create } from "zustand";

interface useIdProposalGroupType {
  idProposalGroup: string | null;
  setIdProposalGroup: (id: string) => void;
}

export const useIdProposalGroup = create<useIdProposalGroupType>((set) => {
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
  useIdProposalGroup.getState().setIdProposalGroup;
