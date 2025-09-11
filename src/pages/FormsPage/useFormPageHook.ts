import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { FieldType, SessaoType } from "@/types";
import { toast } from "sonner";
import { execApi } from "@/hooks/useApi";
import { useIdProposalGroupStore } from "@/stores/useIdProposalGroup";
import { useMutation } from "@tanstack/react-query";
import { useLayoutStore } from "@/stores/useLayoutStore";
import { dev_log } from "@/lib/utils";
// import { mockData } from "./mock";
import { useSidebarContext } from "@/context/SidebarContext";
import { v4 } from "uuid";
import { uploadFiles } from "@/hooks/useUploadFiles";

export const useFormPageHook = () => {
  const layoutObj = useLayoutStore((state) => state.layoutObject);
  // const layoutObj = mockData;
  const navigate = useNavigate();
  const [sidebar, setSidebar] = useState<Partial<SessaoType>[] | null>(null);
  const [currentSessao, setCurrentSessao] = useState<Partial<SessaoType> | null>(null);

  // Context para scroll automático - opcional para evitar erro quando não está disponível
  let scrollToActiveItem: ((index: number) => void) | null = null;
  try {
    const context = useSidebarContext();
    scrollToActiveItem = context.scrollToActiveItem;
  } catch (error) {
    // Context não disponível, scroll será ignorado
    scrollToActiveItem = () => {};
  }
  const [fieldError, setFieldError] = useState<string | null>(null);
  const idProposalGroup = useIdProposalGroupStore((state) => state.idProposalGroup);
  const [postApiError, setPostApiError] = useState<string[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContinueFromLastSessionOpen, setDialogContinueFromLastSessionOpen] = useState(false);
  const [continueFromLastSession, setContinueFromLastSession] = useState({
    enabled: false,
    index: 0,
    userAccepted: false,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  const { mutate, isPending, isError, error } = useMutation({
    mutationKey: ["sendFieldsToApi", idProposalGroup],
    mutationFn: async (data: Partial<FieldType>[]) => {
      const res = await execApi({
        url: `api/crm/proposal/answer/unified/layout/${idProposalGroup}`,
        data: data,
        method: "POST",
      });
      return res;
      // dev_log(() => console.log(data));
      // dev_log(() => console.log(data[1].conteudo));
      // return {
      //   status: 200,
      // };
    },
    onSuccess: (data) => {
      if (data.status === 200) {
        handleUpdateCurrentSession();
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    },
    onError: (error: any) => {
      dev_log(() => console.error("Error in mutation:", error));
      setPostApiError([error.message]);
    },
  });

  const {
    mutate: mutateFile,
    isPending: isPendingFile,
    isError: isErrorFile,
    error: errorFile,
  } = useMutation({
    mutationKey: ["sendFilesFieldsToApi", idProposalGroup],
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
              await uploadFiles({ field, idProposalGroup });
            } catch (err: any) {
              console.error("Erro no envio do documento:", err);
              throw new Error(err);
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
    onError: (error: any) => {
      dev_log(() => console.error("Error in mutation:", error));
      toast.error(error.message)
      setPostApiError([error.message]);
    },
  });

  useEffect(() => {
    if (!layoutObj || layoutObj.length === 0) {
      toast.error("Layout vazio ou não encontrado.");
      navigate("/");
      return;
    }

    const filesFields = layoutObj.filter((item) => item.type === "file");
    console.log("filesFields", filesFields);

    const camposPorSessao = layoutObj.reduce(
      (acc, campo) => {
        if (campo.type === "file") {
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

    // coloca a sessao "Outros Campos" no final
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

    // Adiciona a sessão de resumo no final
    if (filesSessao.campos!.length > 0) {
      sidebarItems.push(filesSessao);
    }
    sidebarItems.push(resumeSessao);

    console.log("sidebarItems", sidebarItems);

    // Verifica se deve continuar da última sessão preenchida
    verifyContinueFromLastSession(sidebarItems);

    setSidebar(sidebarItems);
    dev_log(() => console.log("Sessions array:", sessoesArray));
  }, []);

  useEffect(() => {
    if (sidebar && sidebar.length > 0 && !isInitialized) {
      dev_log(() => console.log(continueFromLastSession));
      if (
        continueFromLastSession.index > 0 &&
        continueFromLastSession.userAccepted &&
        continueFromLastSession.enabled
      ) {
        dev_log(() =>
          console.log(
            "Continuando da última sessão:",
            continueFromLastSession.index
          )
        );

        handleSelectSessao(sidebar[continueFromLastSession.index]);
        setIsInitialized(true);
        return;
      }
      dev_log(() => console.log("selecionando primeira sessao default"))
      handleSelectSessao(sidebar[0]);
      setIsInitialized(true);
    }
  }, [sidebar, continueFromLastSession, isInitialized]);

  useEffect(() => {
    if (postApiError && postApiError.length > 0) {
      setDialogOpen(true);
    }
  }, [postApiError]);
  
  // Effect para scroll automático quando a sessão ativa muda
  useEffect(() => {
    if (sidebar && sidebar.length > 0 && scrollToActiveItem) {
      const activeIndex = sidebar.findIndex((item) => item.active === true);
      if (activeIndex !== -1) {
        // Pequeno delay para garantir que o DOM foi atualizado
        setTimeout(() => {
          scrollToActiveItem(activeIndex);
        }, 150);
      }
    }
  }, [sidebar, scrollToActiveItem]);

  // Effect adicional para scroll quando currentSessao muda
  useEffect(() => {
    if (sidebar && currentSessao && sidebar.length > 0 && scrollToActiveItem) {
      const activeIndex = sidebar.findIndex((item) => item.active === true);
      if (activeIndex !== -1) {
        // Delay um pouco maior para garantir que a transição visual foi aplicada
        setTimeout(() => {
          scrollToActiveItem(activeIndex);
        }, 200);
      }
    }
  }, [currentSessao, sidebar, scrollToActiveItem]);

  const handleSelectSessao = (sessao: Partial<SessaoType>) => {
    console.log("selecionando sessao", sessao)
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
      
      // aplica checked em todas as sessões anteriores
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
  };

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


    const {fields: dataToSend, errors: hasError} = validateFields(currentSessao.campos)
  
    if (hasError.length > 0) {
      setPostApiError(hasError);
      const message = hasError.join(", \n")
      toast.error(`Erro ao enviar os dados: \n\n ${message}`);
      return;
    }

    if (currentSessao.typeSession == "documento") {
      mutateFile(dataToSend);
      return;
    }

    mutate(dataToSend);
  };

  const validateFields = (fields: Partial<FieldType>[]): {fields: Partial<FieldType>[], errors: string[]} => {
    try {
      dev_log(() => console.log(fields))
      const proccessErrors: string[] = []

      // 1. Validação de campos obrigatórios
      const allRequiredFilled = fields.every((campo) => {
        if (campo.obrigatorio && campo.type !== "titulo_subtitulo") {
          return (
            campo.conteudo !== undefined &&
            campo.conteudo.toString().trim() !== ""
          );
        }
        return true;
      });

      if(!allRequiredFilled){
        proccessErrors.push("Preencha todos os campos obrigatórios. (*)")
        return {
          fields, 
          errors: proccessErrors
        }
      }

      // 2. Retirando máscaras necessárias
      const typesDontNeedSend = ["titulo_subtitulo"]
      const typesDontNeedValidate = ["tabela", "file", "condicional", "email", "date"]
      const fieldsWithoutMasks = fields
        .filter((item) => !typesDontNeedSend.includes(item.type!))
        .map((item) => {

          if(typesDontNeedValidate.includes(item.type!)){
            return {...item}
          }

          return {
            ...item,
            conteudo:
            typeof item.conteudo === "string"
              ? item.conteudo.replace(/[^\w\s;]/gi, "")
              : item.conteudo
            }
        });


      // 3. Validando tamanho do campo
      const typesDontNeedValidateLength = ["documento"]
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
            }
          }
        }
      });

      const res = {
        fields: fieldsWithoutMasks,
        errors: proccessErrors
      }

      dev_log(() => console.log(res))
      return res
    } catch (error: any) {
      return {
        fields,
        errors: [error.message]
      }
    }
  }

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
    
    // 3. Marca a sessão atual como checked e desativa
    const currentIndex = updatedSidebar.findIndex((item) => item.active === true);
    if (currentIndex !== -1) {
      updatedSidebar[currentIndex] = {
        ...updatedSidebar[currentIndex],
        checked: true,
        active: false,
        disabled: true,
      };
    }

    // 4. Busca a próxima sessão ainda não checada
    const nextUncheckedIndex = updatedSidebar.findIndex(
      (item, index) => !item.checked && index > currentIndex
    );

    // 5. Define o índice de destino
    const targetIndex =
      nextUncheckedIndex !== -1 ? nextUncheckedIndex : updatedSidebar.length - 1;

    // 6. Atualiza todos os itens
    updatedSidebar.forEach((item, index) => {
      updatedSidebar[index] = {
        ...item,
        active: index === targetIndex,
        disabled: index !== targetIndex,
      };
    });

    // 7. Define a nova sessão atual
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
      if (index) {
        return index < sidebar.length - 1;
      }
      const currentIndex = sidebar.findIndex((item) => item.active === true);
      return currentIndex < sidebar.length - 1;
    }
    return false;
  };

  const handleGoToSuccessPage = () => {
    navigate("/forms/success");
  };

  function verifyContinueFromLastSession(sidebarItems: Partial<SessaoType>[]) {
    let lastSessionIndex: number | null = null;

    for (let index = sidebarItems.length - 1; index >= 0; index--) {
      const item = sidebarItems[index];
      if (item.campos && item.campos.length > 0) {
        for (const campo of item.campos) {
          if (campo.type !== "titulo_subtitulo" && campo?.conteudo) {
            lastSessionIndex = index;
            break;
          }
        }
      }

      if (lastSessionIndex !== null) break;
    }

    let lastSessionIndexNotNull = lastSessionIndex ?? 0;

    // verifica se a ultima sessão encontrada tem todos campos obrigatorios preenchidos
    const lastSession = sidebarItems[lastSessionIndexNotNull];
    const allRequiredFilled = lastSession.campos?.every((campo) => {
      if (campo.obrigatorio && campo.type !== "titulo_subtitulo") {
        return campo.conteudo && campo.conteudo.trim() !== "";
      }
      return true;
    });

    if (allRequiredFilled) {
      lastSessionIndexNotNull++;
    }

    dev_log(() => console.log("lastSessionIndex:", lastSessionIndex));

    // Só atualiza se os valores forem diferentes
    setContinueFromLastSession(prev => {
      const newState = {
        enabled: lastSessionIndexNotNull !== 0,
        index: lastSessionIndexNotNull,
        userAccepted: false,
      };
      
      if (prev.enabled !== newState.enabled || prev.index !== newState.index) {
        // Reset da inicialização quando os valores mudam
        setIsInitialized(false);
        return newState;
      }
      return prev;
    });

    setDialogContinueFromLastSessionOpen(lastSessionIndexNotNull !== 0);
  }

  function findDescriptionBySessao(fields: Partial<FieldType>[]) {
    const found = fields.find((item) => {
      if (item.type == "titulo_subtitulo") {
        return item;
      }
    });
    return found ? found.dsSubtitulo : "(Descrição não encontrada)";
  }

  function findTitleBySessao(fields: Partial<FieldType>[]) {
    const found = fields.find((item) => {
      if (item.type == "titulo_subtitulo") {
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

  // Função para atualizar campos normais (não-API) - Otimizada
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

  // Função para atualizar campos via API (apenas campos com target) - Otimizada
  const updateFieldValue = useCallback((targetName: string, newValue: string) => {
    
    setSidebar(prevSidebar => {
      if (!prevSidebar) return prevSidebar;
      
      return prevSidebar.map(session => ({
        ...session,
        campos: session.campos?.map(campo => 
          // Só atualiza se o campo tem target e o targetName corresponde
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
          // Só atualiza se o campo tem target e o targetName corresponde
          campo.target === targetName
            ? { ...campo, conteudo: newValue }
            : campo
        )
      };
    });
  }, []);

  const handleAcceptContinueFromLastSession = () => {
    setContinueFromLastSession(prev => ({
      ...prev,
      userAccepted: true
    }));
    setIsInitialized(false); // Reset para permitir nova inicialização
    setDialogContinueFromLastSessionOpen(false);
  };

  const handleRejectContinueFromLastSession = () => {
    setContinueFromLastSession(prev => ({
      ...prev,
      userAccepted: false,
      enabled: false,
      index: 0
    }));
    setIsInitialized(false); // Reset para permitir nova inicialização
    setDialogContinueFromLastSessionOpen(false);
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
    handleSelectSessao,
    handleBackSession,
    handleNextSession,
    handleUpdateCurrentSession,
    hasBackSession,
    hasNextSession,
    handleGoToSuccessPage,
    continueFromLastSession,
    setContinueFromLastSession,
    dialogContinueFromLastSessionOpen,
    setDialogContinueFromLastSessionOpen,
    handleAcceptContinueFromLastSession,
    handleRejectContinueFromLastSession,
    updateFieldValue,
    updateNormalField,
  };
};