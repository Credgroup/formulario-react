import { create } from "zustand";

// Tipagem do usuário
type User = {
  nmUsuario: string;
  idGrupoProposta: string;
  produtos: string[];
};

// Tipagem da store
interface UseUsuarioStoreProps {
  usuario: Partial<User> | null;
  setUsuario: (data: User) => void;
}

// Função auxiliar para carregar do localStorage
const getUsuarioFromLocalStorage = (): Partial<User> | null => {
  try {
    const stored = localStorage.getItem("userInfos");
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Erro ao ler userInfos do localStorage", error);
    return null;
  }
};

// Criação da store com Zustand
export const useUsuarioStore = create<UseUsuarioStoreProps>((set) => ({
  usuario: getUsuarioFromLocalStorage(),

  setUsuario: (data: User) => {
    try {
      localStorage.setItem("userInfos", JSON.stringify(data));
    } catch (error) {
      console.error("Erro ao salvar userInfos no localStorage", error);
    }
    set({ usuario: data });
  },
}));

// Exporta a função para uso externo
export const setUsuario = useUsuarioStore.getState().setUsuario;
