import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FieldType, SessaoType } from "@/types";
import { toast } from "sonner";
import { execApi } from "@/hooks/useApi";
import { useIdProposalGroupStore } from "@/stores/useIdProposalGroup";
import { useMutation } from "@tanstack/react-query";
import { useLayoutStore } from "@/stores/useLayoutStore";
import { dev_log } from "@/lib/utils";

export const useFormPageHook = () => {
  const layoutObj = useLayoutStore((state) => state.layoutObject);
  const navigate = useNavigate();
  const [sidebar, setSidebar] = useState<Partial<SessaoType>[] | null>(null);
  const [currentSessao, setCurrentSessao] =
    useState<Partial<SessaoType> | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const idProposalGroup = useIdProposalGroupStore(
    (state) => state.idProposalGroup
  );
  const [postApiError, setPostApiError] = useState<string[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [
    dialogContinueFromLastSessionOpen,
    setDialogContinueFromLastSessionOpen,
  ] = useState(false);
  const [continueFromLastSession, setContinueFromLastSession] = useState({
    enabled: false,
    index: 0,
    userAccepted: false,
  });

  const { mutate, isPending, isError, error } = useMutation({
    mutationKey: ["sendFieldsToApi", idProposalGroup],
    mutationFn: async (data: Partial<FieldType>[]) => {
      const res = await execApi({
        url: `api/crm/proposal/answer/unified/layout/${idProposalGroup}`,
        data: data,
        method: "POST",
      });
      return res;
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

  useEffect(() => {
    if (!layoutObj || layoutObj.length === 0) {
      toast.error("Layout vazio ou não encontrado.");
      navigate("/");
      return;
    }

    const camposPorSessao = layoutObj.reduce(
      (acc, campo) => {
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
      title: sessao.titulo ?? sessao.sessao,
      descricao: sessao.descricao,
      checked: false,
      disabled: true,
      campos: sessao.campos,
      isInputType: true,
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

    const resumeSessao: Partial<SessaoType> = {
      active: false,
      checked: false,
      disabled: true,
      title: "Resumo",
      descricao: "Reveja os dados preenchidos antes de enviar",
      isInputType: false,
      campos: [],
    };

    // Adiciona a sessão de resumo no final
    sidebarItems.push(resumeSessao);

    // Verifica se deve continuar da última sessão preenchida
    verifyContinueFromLastSession(sidebarItems);

    setSidebar(sidebarItems);
    dev_log(() => console.log("Sessions array:", sessoesArray));
  }, []);

  useEffect(() => {
    if (sidebar && sidebar.length > 0) {
      dev_log(() => console.log(continueFromLastSession));
      if (
        continueFromLastSession.index > 0 &&
        continueFromLastSession.enabled &&
        continueFromLastSession.userAccepted
      ) {
        dev_log(() =>
          console.log(
            "Continuando da última sessão:",
            continueFromLastSession.index
          )
        );

        handleSelectSessao(sidebar[continueFromLastSession.index]);
        return;
      }
      handleSelectSessao(sidebar[0]);
    }
  }, [sidebar, continueFromLastSession]);

  useEffect(() => {
    if (postApiError && postApiError.length > 0) {
      setDialogOpen(true);
    }
  }, [postApiError]);

  const handleSelectSessao = (sessao: Partial<SessaoType>) => {
    sidebar?.forEach((item) => {
      item.disabled = true;
      item.active = false;
    });
    sessao.active = true;
    sessao.checked = false;
    sessao.disabled = false;
    setCurrentSessao(sessao);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // aplica checked em todas as sessões anteriores
    const currentIndex = sidebar?.findIndex((item) => item.active === true);
    if (currentIndex !== undefined && currentIndex !== -1) {
      sidebar?.forEach((item, index) => {
        if (index < currentIndex) {
          item.checked = true;
        }
      });
    }
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

    // 1. Validação de campos obrigatórios
    const allRequiredFilled = currentSessao.campos.every((campo) => {
      if (campo.obrigatorio && campo.type !== "titulo_subtitulo") {
        return (
          campo.conteudo !== undefined &&
          campo.conteudo.toString().trim() !== ""
        );
      }
      return true;
    });

    if (!allRequiredFilled) {
      toast.error("Preencha todos os campos obrigatórios. (*)");
      setFieldError("Preencha todos os campos obrigatórios. (*)");
      return;
    }

    const dataToSend = currentSessao.campos
      .filter((item) => item.type !== "titulo_subtitulo")
      .map((item) => ({
        ...item,
        conteudo:
          typeof item.conteudo === "string"
            ? item.conteudo.replace(/[^\w\s;]/gi, "")
            : item.conteudo,
      }));

    dev_log(() => console.log(dataToSend));

    let hasError: string[] = [];

    // Validação de tamanho máximo
    dataToSend.forEach((item) => {
      if (item.visual !== false && item.obrigatorio) {
        if (
          item.tamanho &&
          item.conteudo &&
          item.conteudo.length > parseInt(item.tamanho)
        ) {
          hasError.push(
            `Campo "${item.nome}" deve ter no máximo ${item.tamanho} caracteres`
          );
        }
      }
    });

    dev_log(() => console.log(hasError));
    if (hasError.length > 0) {
      setPostApiError(hasError);
      toast.error("Erro ao enviar os dados.");
      return;
    }

    // 2. Envia os dados
    mutate(dataToSend);
  };

  const handleUpdateCurrentSession = () => {
    if (
      !sidebar ||
      sidebar.length === 0 ||
      !currentSessao ||
      !currentSessao.campos
    ) {
      return;
    }
    // 3. Marca a sessão atual como checked e desativa
    const currentIndex = sidebar.findIndex((item) => item.active === true);
    if (currentIndex !== -1) {
      sidebar[currentIndex].checked = true;
      sidebar[currentIndex].active = false;
      sidebar[currentIndex].disabled = true;
    }

    // 4. Busca a próxima sessão ainda não checada
    const nextUncheckedIndex = sidebar.findIndex(
      (item, index) => !item.checked && index > currentIndex
    );

    // 5. Define o índice de destino
    const targetIndex =
      nextUncheckedIndex !== -1 ? nextUncheckedIndex : sidebar.length - 1;

    // 6. Atualiza todos os itens
    sidebar.forEach((item, index) => {
      item.active = index === targetIndex;
      item.disabled = index !== targetIndex;
    });

    // 7. Define a nova sessão atual
    setCurrentSessao(sidebar[targetIndex]);
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

    dev_log(() => console.log(lastSessionIndex));

    setContinueFromLastSession({
      enabled: lastSessionIndexNotNull !== 0,
      index: lastSessionIndexNotNull,
      userAccepted: false,
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
  };
};
