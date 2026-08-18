import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { FieldType } from "@/types";
import { toast } from "sonner";
import { useLayoutStore } from "@/stores/useLayoutStore";
import { v4 } from "uuid";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getDynamicToken } from "@/lib/utils";
import { useRecommendationStore } from "@/stores/useRecommendationStore";

import { useStepFormCore } from "@/lib/sbs-form-components/src/core/useStepFormCore";

export const useRecommendationFormHook = () => {
  const layoutObj = useLayoutStore((state) => state.layoutObject);
  const navigate = useNavigate();

  const idInspecaoStr = useRecommendationStore((state) => state.idInspecao);
  const idInspecao = Number(idInspecaoStr) || 0;

  const [postApiError, setPostApiError] = useState<string[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [baseFields, setBaseFields] = useState<Partial<FieldType>[]>([]);

  const { data: vistoriaLayout, isError, isFetching } = useQuery({
    queryKey: ["vistoriaLayout", idInspecao],
    queryFn: async () => {
      if (!idInspecao) return null;
      const { data } = await axios.get(
        `${import.meta.env.VITE_URL_DOTCORE}api/crm/risk/inspection/${idInspecao}/layout`,
        {
          headers: {
            "x-token": `${getDynamicToken()}`,
          },
        }
      );
      return data;
    },
    enabled: !!idInspecao,
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    if (isError || (vistoriaLayout && !vistoriaLayout.success)) {
      toast.error("Ocorreu algum erro ao processar dados da vistoria selecionada");
    }
  }, [isError, vistoriaLayout]);

  // Prepara o layout com os dados recebidos da API
  const preparedLayout = useMemo(() => {
    if (!layoutObj || layoutObj.length === 0) return [];
    if (!vistoriaLayout || !vistoriaLayout.dados) return [];

    const { dados } = vistoriaLayout;

    const baseVistoriaFields: Partial<FieldType>[] = [
      {
        type: "titulo_subtitulo",
        dsTitulo: "Vistoria",
        dsSubtitulo: "Preencha os dados para criar a vistoria",
        sessao: "vistoria"
      },
      {
        type: "select",
        nome: "Status da Vistoria",
        campoApi: "cdStatusInspecao",
        obrigatorio: true,
        conteudo: dados.cdStatusInspecao?.toString() || "",
        options: "Agendada:1;Em andamento:2;Em atraso:3;Concluída:4;Cancelada:5;",
        sessao: "vistoria"
      },
      {
        type: "date",
        nome: "Data de Agendamento",
        campoApi: "dtAgendamento",
        obrigatorio: false,
        conteudo: dados.dtAgendamento || "",
        sessao: "vistoria"
      },
      {
        type: "date",
        nome: "Data de Realização",
        campoApi: "dtRealizacao",
        obrigatorio: false,
        conteudo: dados.dtRealizacao || "",
        sessao: "vistoria"
      },
      {
        type: "date",
        nome: "Data de Conclusão",
        campoApi: "dtConclusao",
        obrigatorio: false,
        conteudo: dados.dtConclusao || "",
        sessao: "vistoria"
      },
      {
        type: "textarea",
        nome: "Parecer Geral",
        campoApi: "dsParecerGeral",
        obrigatorio: false,
        conteudo: dados.dsParecerGeral || "",
        sessao: "vistoria"
      }
    ];

    let extraFields: Partial<FieldType>[] = [];
    if (dados.layoutAdicional) {
      try {
        const parsed = JSON.parse(dados.layoutAdicional);
        if (Array.isArray(parsed) && parsed.length > 0) {
          extraFields = parsed;
        }
      } catch (e) {
        console.error("Erro ao fazer parse de layoutAdicional:", e);
      }
    }

    const vistoriaFields = [...baseVistoriaFields, ...extraFields].map(campo => ({
      ...campo
    }));

    return vistoriaFields;
  }, [layoutObj, vistoriaLayout]);

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
    isReady: !isFetching,
    onBlankLayout: () => {
      toast.error("Layout da nota vazio ou não encontrado.");
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
    const notas = sidebar.filter(item => item.typeSession === "input" && item.title !== "Vistoria");
    return notas.length > 0;
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

    // Filtramos apenas as sessões de input para saber qual é o próximo número de nota
    const notasSessions = sidebar.filter(item => item.typeSession === "input" && item.title !== "Vistoria");
    const nextIndex = notasSessions.length + 1;
    const newSessionName = `Nota ${nextIndex}`;

    const newSessionFields = baseFields.map(campo => {
      let updatedCampoApi = campo.campoApi;
      if (updatedCampoApi) {
        updatedCampoApi = `${updatedCampoApi}_nota_${nextIndex}`;
      }

      if (campo.type === 'titulo_subtitulo') {
        return { ...campo, dsTitulo: newSessionName, sessao: newSessionName, campoApi: updatedCampoApi };
      }
      return { ...campo, sessao: newSessionName, campoApi: updatedCampoApi };
    });

    const novaSessao = {
      id: v4(),
      title: newSessionName,
      descricao: "Preencha os dados da nota",
      checked: false,
      disabled: true,
      campos: newSessionFields,
      typeSession: "input" as const,
      sessao: newSessionName,
      active: false,
    };

    if (!sidebar) {
      setSidebar([novaSessao]);
      handleSelectSessao(novaSessao);
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
      handleSelectSessao(novaSessao);
    }

    toast.success(`${newSessionName} adicionada com sucesso!`);
  }, [baseFields, sidebar, setSidebar, handleSelectSessao]);

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
