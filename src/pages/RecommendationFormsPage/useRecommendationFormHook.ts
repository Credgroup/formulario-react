import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { FieldType } from "@/types";
import { toast } from "sonner";
import { useLayoutStore } from "@/stores/useLayoutStore";
import { v4 } from "uuid";

import { useStepFormCore } from "@/lib/sbs-form-components/src/core/useStepFormCore";

export const useRecommendationFormHook = () => {
  const layoutObj = useLayoutStore((state) => state.layoutObject);
  const navigate = useNavigate();

  const [postApiError, setPostApiError] = useState<string[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [baseFields, setBaseFields] = useState<Partial<FieldType>[]>([]);

  // Prepara o layout injetando o nome da sessão "Recomendação 1"
  const preparedLayout = useMemo(() => {
    if (!layoutObj || layoutObj.length === 0) return [];
    const sessaoNome = "Recomendação 1";
    return layoutObj.map(campo => ({
      ...campo,
      sessao: sessaoNome
    }));
  }, [layoutObj]);

  const {
    sidebar,
    currentSessao,
    fieldError,
    handleSelectSessao,
    handleBackSession,
    handleNextSession,
    hasBackSession,
    hasNextSession,
    updateFieldValue,
    updateNormalField,
    setSidebar,
    setCurrentSessao,
  } = useStepFormCore({
    layoutObj: preparedLayout,
    onBlankLayout: () => {
      toast.error("Layout da recomendação vazio ou não encontrado.");
      navigate("/risk/recom/welcome");
    },
    onSubmitStep: async (currentSession) => {
      // Validar campos da sessão
      if (!currentSession.campos) return { canContinueForm: true };

      const proccessErrors: string[] = [];
      const allRequiredFilled = currentSession.campos.every((campo) => {
        if (campo.obrigatorio && campo.type !== "titulo_subtitulo") {
          return (
            campo.conteudo !== undefined &&
            campo.conteudo?.toString().trim() !== ""
          );
        }
        return true;
      });

      if (!allRequiredFilled) {
        proccessErrors.push("Preencha todos os campos obrigatórios. (*)");
        return { canContinueForm: false, errors: proccessErrors };
      }

      return { canContinueForm: true };
    },
    onErrorSubmitStep: (error) => {
      const msgs = error.errors || [];
      setPostApiError(msgs);
      toast.error(`Erro ao avançar: \n\n ${msgs.join(", \n")}`);
    },
    onFinish: () => {
      // Como o fluxo final do botão concluir é gerido fora do hook com handleGoToSuccessPage ou
      // com a validação do MFA na interface, o onFinish aqui pode ser vazio e
      // tratado na interface "Concluir" caso o hasNextSession seja false.
      // Ou seja, quando chega na última etapa (Resumo), a interface lida com a submissão.
    },
    onInit: () => {
      // Quando inicializa, guardamos a baseFields
      if (layoutObj && layoutObj.length > 0) {
        setBaseFields(layoutObj.map(field => ({ ...field, conteudo: "" })));
      }
    }
  });

  useEffect(() => {
    if (postApiError && postApiError.length > 0) {
      setDialogOpen(true);
    }
  }, [postApiError]);

  const canAddNewSession = useMemo(() => {
    if (!sidebar) return false;
    const inputSessions = sidebar.filter(item => item.typeSession === "input");
    if (inputSessions.length === 0) return true;

    return inputSessions.every(session => {
      if (!session.campos) return true;
      return session.campos.every(campo => {
        if (campo.obrigatorio && campo.type !== "titulo_subtitulo") {
          return (
            campo.conteudo !== undefined &&
            campo.conteudo !== null &&
            campo.conteudo.toString().trim() !== ""
          );
        }
        return true;
      });
    });
  }, [sidebar]);

  const canDeleteSession = useMemo(() => {
    if (!sidebar) return false;
    return sidebar.filter(item => item.typeSession === "input").length > 1;
  }, [sidebar]);

  const handleDeleteSession = useCallback((sessionId: string) => {
    if (!sidebar || !setSidebar) return;
    
    const sessionToDelete = sidebar.find(s => s.id === sessionId);
    if (!sessionToDelete) return;

    const updatedSidebar = sidebar.filter(s => s.id !== sessionId);

    if (sessionToDelete.active) {
      const remainingInputSessions = updatedSidebar.filter(s => s.typeSession === "input");
      if (remainingInputSessions.length > 0) {
        // Find current index of deleted session to activate the previous or next one
        const deletedIndex = sidebar.findIndex(s => s.id === sessionId);
        const newActiveSession = updatedSidebar[Math.max(0, deletedIndex - 1)];
        if (newActiveSession) {
          newActiveSession.active = true;
          newActiveSession.disabled = false;
          setCurrentSessao?.(newActiveSession);
        }
      } else {
        if (updatedSidebar.length > 0) {
          updatedSidebar[0].active = true;
          updatedSidebar[0].disabled = false;
          setCurrentSessao?.(updatedSidebar[0]);
        }
      }
    }
    
    setSidebar(updatedSidebar);
    toast.success(`${sessionToDelete.title} removida com sucesso!`);
  }, [sidebar, setSidebar, setCurrentSessao]);

  const handleGoToSuccessPage = () => {
    navigate("/risk/recom/success");
  };

  const handleCloneSession = useCallback(() => {
    if (!sidebar || !setSidebar) return;

    // Filtramos apenas as sessões de input para saber qual é o próximo número de recomendação
    const recomendacoesSessions = sidebar.filter(item => item.typeSession === "input");
    const newSessionName = `Recomendação ${recomendacoesSessions.length + 1}`;

    const newSessionFields = baseFields.map(campo => {
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
      typeSession: "input" as const,
      sessao: newSessionName,
      active: false,
    };

    if (!sidebar) {
      setSidebar([novaSessao]);
    } else {
      const lastInputIndex = sidebar.map(s => s.typeSession).lastIndexOf("input");
      const updated = [...sidebar];
      if (lastInputIndex !== -1) {
        updated.splice(lastInputIndex + 1, 0, novaSessao);
      } else {
        const docIndex = updated.findIndex(s => s.typeSession === "documento");
        if (docIndex !== -1) {
          updated.splice(docIndex, 0, novaSessao);
        } else {
          const resumoIndex = updated.findIndex(s => s.typeSession === "resumo");
          if (resumoIndex !== -1) {
            updated.splice(resumoIndex, 0, novaSessao);
          } else {
            updated.push(novaSessao);
          }
        }
      }
      setSidebar(updated);
    }

    toast.success(`${newSessionName} adicionada com sucesso!`);
  }, [baseFields, sidebar, setSidebar]);

  return {
    sidebar,
    currentSessao,
    fieldError,
    postApiError,
    dialogOpen,
    setDialogOpen,
    handleSelectSessao,
    handleBackSession,
    handleNextSession,
    hasBackSession,
    hasNextSession,
    handleGoToSuccessPage,
    updateFieldValue,
    updateNormalField,
    handleCloneSession,
    canAddNewSession,
    canDeleteSession,
    handleDeleteSession,
  };
};
