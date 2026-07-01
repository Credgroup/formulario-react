import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { FieldType, SessaoType } from "@/types";
import { toast } from "sonner";
import { useRecommendationStore } from "@/stores/useRecommendationStore";
import { useLayoutStore } from "@/stores/useLayoutStore";
import { useSidebarContext } from "@/context/SidebarContext";
import { v4 } from "uuid";
import { useLanguageStore } from "@/stores/useLanguageStore";

export const useRecommendationFormHook = () => {
  const layoutObj = useLayoutStore((state) => state.layoutObject);
  const navigate = useNavigate();
  const [sidebar, setSidebar] = useState<Partial<SessaoType>[] | null>(null);
  const [currentSessao, setCurrentSessao] = useState<Partial<SessaoType> | null>(null);

  // Context para scroll automático
  let scrollToActiveItem: ((index: number) => void) | null = null;
  try {
    const context = useSidebarContext();
    scrollToActiveItem = context.scrollToActiveItem;
  } catch {
    scrollToActiveItem = () => { };
  }
  const [fieldError, setFieldError] = useState<string | null>(null);
  const idInspecao = useRecommendationStore((state) => state.idInspecao);
  const [postApiError, setPostApiError] = useState<string[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [baseFields, setBaseFields] = useState<Partial<FieldType>[]>([]);

  useEffect(() => {
    async function init() {
      if (!layoutObj || layoutObj.length === 0) {
        toast.error("Layout da recomendação vazio ou não encontrado.");
        navigate("/risk/recom/welcome");
        return;
      }

      // Salva os campos originais (sem conteudo) para a clonagem depois
      const originalBase = layoutObj.map(field => ({ ...field, conteudo: "" }));
      setBaseFields(originalBase);

      const sessaoNome = "Recomendação 1";

      const novaSessao = {
        id: v4(),
        title: sessaoNome,
        descricao: "Preencha os dados da recomendação",
        checked: false,
        disabled: true,
        campos: layoutObj.map(campo => ({
          ...campo,
          sessao: sessaoNome
        })),
        typeSession: "input",
        sessao: sessaoNome,
        active: false,
      };

      const sidebarItems: Partial<SessaoType>[] = [novaSessao];

      sidebarItems[0].active = true;
      sidebarItems[0].disabled = false;

      setSidebar(sidebarItems);
    }

    init();
  }, [layoutObj, navigate]);

  const handleSelectSessao = useCallback((sessao: Partial<SessaoType>) => {
    if (!sidebar) return;

    const updatedSidebar = sidebar.map((item) => ({
      ...item,
      disabled: true,
      active: false,
    }));

    const sessaoIndex = updatedSidebar.findIndex((item) => item.id === sessao.id);
    if (sessaoIndex !== -1) {
      updatedSidebar[sessaoIndex] = {
        ...updatedSidebar[sessaoIndex],
        active: true,
        checked: false,
        disabled: false,
      };

      updatedSidebar.forEach((item, index) => {
        if (index < sessaoIndex) {
          updatedSidebar[index] = {
            ...item,
            checked: true,
          };
        }
      });
    }

    setSidebar(updatedSidebar);
    setCurrentSessao(updatedSidebar[sessaoIndex]);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [sidebar]);

  useEffect(() => {
    if (sidebar && sidebar.length > 0 && !isInitialized) {
      handleSelectSessao(sidebar[0]);
      setIsInitialized(true);
    }
  }, [sidebar, isInitialized, handleSelectSessao]);

  useEffect(() => {
    if (postApiError && postApiError.length > 0) {
      setDialogOpen(true);
    }
  }, [postApiError]);

  useEffect(() => {
    if (sidebar && sidebar.length > 0 && scrollToActiveItem) {
      const activeIndex = sidebar.findIndex((item) => item.active === true);
      if (activeIndex !== -1) {
        setTimeout(() => {
          scrollToActiveItem!(activeIndex);
        }, 150);
      }
    }
  }, [sidebar, scrollToActiveItem]);

  useEffect(() => {
    if (sidebar && currentSessao && sidebar.length > 0 && scrollToActiveItem) {
      const activeIndex = sidebar.findIndex((item) => item.active === true);
      if (activeIndex !== -1) {
        setTimeout(() => {
          scrollToActiveItem!(activeIndex);
        }, 200);
      }
    }
  }, [currentSessao, sidebar, scrollToActiveItem]);

  const handleBackSession = () => {
    if (sidebar && sidebar.length > 0) {
      const currentIndex = sidebar.findIndex((item) => item.active === true);
      if (hasBackSession()) {
        handleSelectSessao(sidebar[currentIndex - 1]);
      }
    }
  };

  const handleNextSession = () => {
    if (!sidebar || sidebar.length === 0 || !currentSessao || !currentSessao.campos) {
      return;
    }

    const { errors: hasError } = validateFields(currentSessao.campos);

    if (hasError.length > 0) {
      setPostApiError(hasError);
      const message = hasError.join(", \n");
      toast.error(`Erro ao enviar os dados: \n\n ${message}`);
      return;
    }

    handleUpdateCurrentSession();
  };

  const validateFields = useCallback((fields: Partial<FieldType>[]): { fields: Partial<FieldType>[], errors: string[] } => {
    try {
      const proccessErrors: string[] = [];

      const allRequiredFilled = fields.every((campo) => {
        if (campo.obrigatorio && campo.type !== "titulo_subtitulo") {
          return (
            campo.conteudo !== undefined &&
            campo.conteudo.toString().trim() !== ""
          );
        }
        return true;
      });

      if (!allRequiredFilled) {
        proccessErrors.push("Preencha todos os campos obrigatórios. (*)");
        return { fields, errors: proccessErrors };
      }

      const typesDontNeedSend = ["titulo_subtitulo"];
      const typesDontNeedValidate = ["tabela", "file", "condicional", "email", "date"];
      const fieldsWithoutMasks = fields
        .filter((item) => !typesDontNeedSend.includes(item.type!))
        .map((item) => {
          if (typesDontNeedValidate.includes(item.type!)) {
            return { ...item };
          }
          return {
            ...item,
            conteudo:
              typeof item.conteudo === "string"
                ? item.conteudo.replace(/[^\w\s;]/gi, "")
                : item.conteudo
          };
        });

      const res = { fields: fieldsWithoutMasks, errors: proccessErrors };
      return res;
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      return { fields, errors: [errMsg] };
    }
  }, []);

  const handleUpdateCurrentSession = () => {
    if (!sidebar || sidebar.length === 0 || !currentSessao || !currentSessao.campos) {
      return;
    }

    const updatedSidebar = [...sidebar];

    const currentIndex = updatedSidebar.findIndex((item) => item.active === true);
    if (currentIndex !== -1) {
      updatedSidebar[currentIndex] = {
        ...updatedSidebar[currentIndex],
        checked: true,
        active: false,
        disabled: true,
      };
    }

    const nextUncheckedIndex = updatedSidebar.findIndex(
      (item, index) => !item.checked && index > currentIndex
    );

    const targetIndex = nextUncheckedIndex !== -1 ? nextUncheckedIndex : updatedSidebar.length - 1;

    updatedSidebar.forEach((item, index) => {
      updatedSidebar[index] = {
        ...item,
        active: index === targetIndex,
        disabled: index !== targetIndex,
      };
    });

    setSidebar(updatedSidebar);
    setCurrentSessao(updatedSidebar[targetIndex]);
    setFieldError(null);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const hasBackSession = () => {
    if (sidebar && sidebar.length > 0) {
      const currentIndex = sidebar.findIndex((item) => item.active === true);
      return currentIndex > 0;
    }
    return false;
  };

  const hasNextSession = (index?: number) => {
    if (sidebar && sidebar.length > 0) {
      if (index !== undefined) {
        return index < sidebar.length - 1;
      }
      const currentIndex = sidebar.findIndex((item) => item.active === true);
      return currentIndex < sidebar.length - 1;
    }
    return false;
  };

  const handleGoToSuccessPage = () => {
    navigate("/risk/recom/success");
  };

  const updateNormalField = useCallback((campoApi: string, newValue: string) => {
    setSidebar(prevSidebar => {
      if (!prevSidebar) return prevSidebar;
      return prevSidebar.map(session => ({
        ...session,
        campos: session.campos?.map(campo =>
          campo.campoApi === campoApi ? { ...campo, conteudo: newValue } : campo
        )
      }));
    });

    setCurrentSessao(prevCurrentSessao => {
      if (!prevCurrentSessao) return prevCurrentSessao;
      return {
        ...prevCurrentSessao,
        campos: prevCurrentSessao.campos?.map(campo =>
          campo.campoApi === campoApi ? { ...campo, conteudo: newValue } : campo
        )
      };
    });
  }, []);

  const updateFieldValue = useCallback((targetName: string, newValue: string) => {
    setSidebar(prevSidebar => {
      if (!prevSidebar) return prevSidebar;
      return prevSidebar.map(session => ({
        ...session,
        campos: session.campos?.map(campo =>
          campo.target === targetName ? { ...campo, conteudo: newValue } : campo
        )
      }));
    });

    setCurrentSessao(prevCurrentSessao => {
      if (!prevCurrentSessao) return prevCurrentSessao;
      return {
        ...prevCurrentSessao,
        campos: prevCurrentSessao.campos?.map(campo =>
          campo.target === targetName ? { ...campo, conteudo: newValue } : campo
        )
      };
    });
  }, []);

  const handleCloneSession = useCallback(() => {
    if (!sidebar) return;
    const newSessionName = `Recomendação ${sidebar.length + 1}`;
    
    // Clonar do baseFields para garantir que está limpo
    const newSessionFields = baseFields.map(campo => {
      // Modificamos titulo_subtitulo para refletir o novo nome
      if (campo.type === 'titulo_subtitulo') {
        return { ...campo, dsTitulo: newSessionName, sessao: newSessionName };
      }
      return { ...campo, sessao: newSessionName };
    });

    const novaSessao = {
      id: v4(),
      title: newSessionName,
      descricao: "Preencha os dados da recomendação",
      checked: false,
      disabled: true,
      campos: newSessionFields,
      typeSession: "input",
      sessao: newSessionName,
      active: false,
    };

    setSidebar(prev => {
      if (!prev) return [novaSessao];
      return [...prev, novaSessao];
    });

    toast.success(`${newSessionName} adicionada com sucesso!`);
  }, [baseFields, sidebar]);

  return {
    sidebar,
    currentSessao,
    fieldError,
    postApiError,
    dialogOpen,
    setDialogOpen,
    validateFields,
    handleSelectSessao,
    handleBackSession,
    handleNextSession,
    hasBackSession,
    hasNextSession,
    handleGoToSuccessPage,
    updateFieldValue,
    updateNormalField,
    handleCloneSession,
  };
};
