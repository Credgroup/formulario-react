import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { FieldType, SessaoType } from "@/types";
import { toast } from "sonner";
import { execApi } from "@/hooks/useApi";
import { useInspectionStore } from "@/stores/useInspectionStore";
import { useMutation } from "@tanstack/react-query";
import { dev_log } from "@/lib/utils";
import { useSidebarContext } from "@/context/SidebarContext";
import { v4 } from "uuid";
import { uploadFiles } from "@/hooks/useUploadFiles";
import axios from "axios";
import { useLanguageStore } from "@/stores/useLanguageStore";

const VITE_TRANSLATE_URL = import.meta.env.VITE_TRANSLATE_URL;

export const useInspectionFormPageHook = () => {
  const layoutObj = useInspectionStore((state) => state.layoutObject);
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
  const idInspecao = useInspectionStore((state) => state.idInspecao);
  const [postApiError, setPostApiError] = useState<string[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const lngSelected = useLanguageStore((state) => state.lng);
  const [isInitialized, setIsInitialized] = useState(false);

  // Mantém a estrutura de mutação preparada para o futuro
  const { mutate, isPending, isError, error } = useMutation<unknown, Error, Partial<FieldType>[]>({
    mutationKey: ["sendInspectionFieldsToApi", idInspecao],
    mutationFn: async (data: Partial<FieldType>[]) => {
      const res = await execApi({
        url: `api/crm/risk/inspection/answer/unified/layout/${idInspecao}`,
        data: data,
        method: "POST",
      });
      return res;
    },
    onSuccess: (data) => {
      const resData = data as { status?: number } | undefined;
      if (resData && resData.status === 200) {
        handleUpdateCurrentSession();
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    },
    onError: (err: Error) => {
      dev_log(() => console.error("Error in mutation:", err));
      setPostApiError([err.message]);
    },
  });

  const {
    mutate: mutateFile,
    isPending: isPendingFile,
    isError: isErrorFile,
    error: errorFile,
  } = useMutation<void, Error, Partial<FieldType>[]>({
    mutationKey: ["sendInspectionFilesFieldsToApi", idInspecao],
    mutationFn: async (data: Partial<FieldType>[]) => {
      if (data.length === 0) {
        throw new Error(
          "Campos não encontrados \n" + JSON.stringify(data, null, 2)
        );
      }

      await Promise.all(
        data.map(async (field) => {
          if (field.conteudo) {
            try {
              await uploadFiles({ field, idProposalGroup: idInspecao ?? "" });
            } catch (err: unknown) {
              const errMsg = err instanceof Error ? err.message : String(err);
              console.error("Erro no envio do documento:", errMsg);
              throw new Error(errMsg);
            }
          }
        })
      );
    },
    onSuccess: () => {
      handleUpdateCurrentSession();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
    onError: (err: Error) => {
      dev_log(() => console.error("Error in mutation:", err));
      toast.error(err.message);
      setPostApiError([err.message]);
    },
  });

  const applyTranslateInLayout = useCallback(async (sidebarItems: Partial<SessaoType>[]) => {
    try {
      const sidebarItemsCopy = sidebarItems.slice();
      let stringToTranslate: string = "";
      sidebarItemsCopy.forEach(session => {
        session.campos?.forEach(item => {
          if (item.nome) {
            stringToTranslate += `${item.nome}\n\n`;
          }
        });
      });

      stringToTranslate += "$Br0k3";

      sidebarItemsCopy.forEach(session => {
        if (session.title) {
          stringToTranslate += `${session.title}\n\n`;
        }
      });

      dev_log(() => console.log(stringToTranslate));

      const languageStoreValue = lngSelected ?? "pt";
      dev_log(() => console.log("selected language: ", languageStoreValue));

      const formData = new FormData();
      formData.append("q", stringToTranslate);
      formData.append("source", "pt");
      formData.append("target", languageStoreValue);

      const url = VITE_TRANSLATE_URL + "translate";

      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      let [askWords, sessionTitles] = response.data.translatedText.split("$Br0k3");
      askWords = askWords.split("\n\n");
      sessionTitles = sessionTitles.split("\n\n");

      sidebarItemsCopy.forEach(session => {
        if (session.title) {
          session.title = sessionTitles[0];
          sessionTitles.splice(0, 1);
        }
        session.campos?.forEach(item => {
          if (item.nome) {
            item.nome = askWords[0];
            askWords.splice(0, 1);
          }
        });
      });

      return sidebarItemsCopy;
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      toast.error("Não foi possível traduzir o formulário\n" + errMsg);
      dev_log(() => console.log(errMsg));
      return [];
    }
  }, [lngSelected]);

  useEffect(() => {
    async function init() {
      if (!layoutObj || layoutObj.length === 0) {
        toast.error("Layout da inspeção vazio ou não encontrado.");
        navigate("/risk/inspection/welcome");
        return;
      }

      const filesFields = layoutObj.filter((item) => item.type === "file" && !item.sessao);
      console.log("filesFields", filesFields);

      const camposPorSessao = layoutObj.reduce(
        (acc, campo) => {
          if (campo.type === "file" && !campo.sessao) {
            return acc;
          }

          const sessao = campo.sessao?.trim() || "Outros Campos";

          if (!acc[sessao]) {
            acc[sessao] = {
              titulo: sessao,
              descricao: "",
              campos: [],
            };
          }

          acc[sessao].campos.push(campo);

          return acc;
        },
        {} as Record<
          string,
          {
            titulo: string;
            descricao: string;
            campos: Partial<FieldType>[];
          }
        >
      );

      const sessoesArray = Object.entries(camposPorSessao).map(
        ([sessao, data]) => {
          return {
            sessao,
            titulo: findTitleBySessao(data.campos),
            descricao: findDescriptionBySessao(data.campos),
            campos: data.campos,
            active: false,
          };
        }
      );

      const sidebarItems: Partial<SessaoType>[] = sessoesArray.map((sessao) => ({
        id: v4(),
        title: sessao.titulo ?? sessao.sessao,
        descricao: sessao.descricao,
        checked: false,
        disabled: true,
        campos: sessao.campos,
        typeSession: "input",
      }));

      const sessaoOutrosIndex = sidebarItems.findIndex(
        (item) => item.title === "Outros Campos"
      );

      if (sessaoOutrosIndex !== -1) {
        const sessaoOutros = sidebarItems[sessaoOutrosIndex];
        sessaoOutros.descricao = "Campos complementares ao formulário";
        sidebarItems.splice(sessaoOutrosIndex, 1);
        sidebarItems.push(sessaoOutros);
      }

      const filesSessao: Partial<SessaoType> = {
        id: v4(),
        active: false,
        checked: false,
        disabled: true,
        title: "Anexos complementares",
        descricao: "Anexos complementares ao formulário",
        typeSession: "documento",
        campos: filesFields,
      };

      const resumeSessao: Partial<SessaoType> = {
        id: v4(),
        active: false,
        checked: false,
        disabled: true,
        title: "Resumo",
        descricao: "Reveja os dados preenchidos antes de enviar",
        typeSession: "resumo",
        campos: [],
      };

      if (filesSessao.campos!.length > 0) {
        sidebarItems.push(filesSessao);
      }
      sidebarItems.push(resumeSessao);

      let translatedSideBar = await applyTranslateInLayout(sidebarItems);

      if (translatedSideBar.length === 0) {
        translatedSideBar = sidebarItems;
      }

      translatedSideBar[0].active = true;
      translatedSideBar[0].disabled = false;

      setSidebar(translatedSideBar);
      dev_log(() => console.log("Sessions array:", sessoesArray));
    }

    init();
  }, [layoutObj, navigate, applyTranslateInLayout]);

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
      dev_log(() => console.log("Selecting first default inspection session"));
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
    if (
      !sidebar ||
      sidebar.length === 0 ||
      !currentSessao ||
      !currentSessao.campos
    ) {
      return;
    }

    // Por enquanto, avança puramente local como solicitado ("sem chamada externa")
    // Se no futuro quiser reativar o POST de edições, basta descomentar a lógica abaixo:
    /*
    const { fields: dataToSend, errors: hasError } = validateFields(currentSessao.campos);

    if (hasError.length > 0) {
      setPostApiError(hasError);
      const message = hasError.join(", \n");
      toast.error(`Erro ao enviar os dados: \n\n ${message}`);
      return;
    }

    if (currentSessao.typeSession === "documento") {
      mutateFile(dataToSend);
      return;
    }

    mutate(dataToSend);
    */

    // Avanço puramente local das sessões
    handleUpdateCurrentSession();
  };

  const validateFields = useCallback((fields: Partial<FieldType>[]): { fields: Partial<FieldType>[], errors: string[] } => {
    try {
      dev_log(() => console.log(fields));
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
        return {
          fields,
          errors: proccessErrors
        };
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

      const typesDontNeedValidateLength = ["documento"];
      fieldsWithoutMasks.forEach((item) => {
        if (item.visual !== false && item.obrigatorio && !typesDontNeedValidateLength.includes(item.type!)) {
          if (
            item.tamanho &&
            item.conteudo &&
            item.conteudo.length > parseInt(item.tamanho)
          ) {
            proccessErrors.push(
              `Campo "${item.nome}" deve ter no máximo ${item.tamanho} caracteres`
            );
            return {
              fields,
              errors: proccessErrors
            };
          }
        }
      });

      const res = {
        fields: fieldsWithoutMasks,
        errors: proccessErrors
      };

      dev_log(() => console.log(res));
      return res;
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      return {
        fields,
        errors: [errMsg]
      };
    }
  }, []);

  const handleUpdateCurrentSession = () => {
    if (
      !sidebar ||
      sidebar.length === 0 ||
      !currentSessao ||
      !currentSessao.campos
    ) {
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

    const targetIndex =
      nextUncheckedIndex !== -1 ? nextUncheckedIndex : updatedSidebar.length - 1;

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
    navigate("/risk/inspection/success");
  };

  function findDescriptionBySessao(fields: Partial<FieldType>[]) {
    const found = fields.find((item) => {
      if (item.type === "titulo_subtitulo") {
        return item;
      }
    });
    return found ? found.dsSubtitulo : "(Descrição não encontrada)";
  }

  function findTitleBySessao(fields: Partial<FieldType>[]) {
    const found = fields.find((item) => {
      if (item.type === "titulo_subtitulo") {
        return item;
      }
    });

    if (found) {
      return found.dsTitulo;
    }

    let notHaveSession = false;
    fields.forEach((item) => {
      if (item.type !== "titulo_subtitulo" && !item.sessao) {
        notHaveSession = true;
      }
    });

    if (notHaveSession) {
      return "Outros Campos";
    }
  }

  const updateNormalField = useCallback((campoApi: string, newValue: string) => {
    setSidebar(prevSidebar => {
      if (!prevSidebar) return prevSidebar;

      return prevSidebar.map(session => ({
        ...session,
        campos: session.campos?.map(campo =>
          campo.campoApi === campoApi
            ? { ...campo, conteudo: newValue }
            : campo
        )
      }));
    });

    setCurrentSessao(prevCurrentSessao => {
      if (!prevCurrentSessao) return prevCurrentSessao;

      return {
        ...prevCurrentSessao,
        campos: prevCurrentSessao.campos?.map(campo =>
          campo.campoApi === campoApi
            ? { ...campo, conteudo: newValue }
            : campo
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
          campo.target === targetName
            ? { ...campo, conteudo: newValue }
            : campo
        )
      }));
    });

    setCurrentSessao(prevCurrentSessao => {
      if (!prevCurrentSessao) return prevCurrentSessao;

      return {
        ...prevCurrentSessao,
        campos: prevCurrentSessao.campos?.map(campo =>
          campo.target === targetName
            ? { ...campo, conteudo: newValue }
            : campo
        )
      };
    });
  }, []);

  const handleNotificateRespondedForms = async () => {
    try {
      const message = {
        senderId: "questionario-forms-inspecoes",
        platform: "18844",
        operationId: "8003",
        type: 1,
        title: "Inspeção Visualizada",
        message: "A inspeção de risco de número " + idInspecao + " foi respondida/visualizada com sucesso",
        metadata: {
          id: idInspecao,
        },
        userIds: null
      };

      dev_log(() => console.log(message));

      const res = await execApi<{ mensagem?: string }>({
        apiUrl: import.meta.env.VITE_COMMUNICATIONHUB_URL,
        url: "api/Notification/byplatformandoperation/users",
        data: message,
        method: "POST"
      });

      dev_log(() => console.log(res));

      if (res.status !== 202) {
        const resMsg = res.data && res.data.mensagem ? res.data.mensagem : "Erro desconhecido";
        throw new Error(resMsg);
      }
    } catch (error) {
      dev_log(() => console.log(error));
    }
  };

  return {
    sidebar,
    currentSessao,
    fieldError,
    postApiError,
    dialogOpen,
    setDialogOpen,
    isPending,
    isError,
    error,
    isPendingFile,
    isErrorFile,
    errorFile,
    mutate,
    mutateFile,
    validateFields,
    handleSelectSessao,
    handleBackSession,
    handleNextSession,
    handleUpdateCurrentSession,
    hasBackSession,
    hasNextSession,
    handleGoToSuccessPage,
    updateFieldValue,
    updateNormalField,
    handleNotificateRespondedForms
  };
};
