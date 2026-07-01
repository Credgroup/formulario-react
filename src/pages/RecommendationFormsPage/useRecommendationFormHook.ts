import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { FieldType, SessaoType } from "@/types";
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
    // setCurrentSessao, // se precisarmos setar a sessao atual programaticamente (aqui o handleSelectSessao já faz o q precisamos pra navegação natural)
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
    onFinish: (allSessions) => {
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
      typeSession: "input",
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
        updated.push(novaSessao);
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
  };
};
