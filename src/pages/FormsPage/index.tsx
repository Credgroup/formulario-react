import Container from "@/components/Container";
import { useLayoutStore } from "@/stores/useLayoutStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FieldType, SessaoType } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SessionContainer from "./components/SessionContainer";
import NavContainer from "./NavContainer";
import { execApi } from "@/hooks/useApi";
import { useIdProposalGroupStore } from "@/stores/useIdProposalGroup";
// import { mockData } from "./mock";

export default function FormsPage() {
  const layoutObj = useLayoutStore((state) => state.layoutObject);
  // const layoutObj = mockData
  const navigate = useNavigate();
  const [siderbar, setSidebar] = useState<Partial<SessaoType>[] | null>(null);
  const [currentSessao, setCurrentSessao] =
    useState<Partial<SessaoType> | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const idProposalGroup = useIdProposalGroupStore(
    (state) => state.idProposalGroup
  );

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
      console.log(found);
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

    const sidebarItems: Partial<SessaoType>[] = sessoesArray.map((sessao) => ({
      title: sessao.titulo ?? sessao.sessao,
      descricao: sessao.descricao,
      checked: false,
      disabled: true,
      campos: sessao.campos,
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
      isInputType: true,
      campos: [],
    };

    sidebarItems.push(resumeSessao);

    sidebarItems[0].disabled = false;
    sidebarItems[0].active = true;
    setSidebar(sidebarItems);
    console.log(sessoesArray);
  }, []);

  useEffect(() => {
    if (siderbar && siderbar.length > 0) {
      setCurrentSessao(siderbar[0]);
    }
  }, [siderbar]);

  const handleSelectSessao = (sessao: Partial<SessaoType>) => {
    siderbar?.forEach((item) => {
      item.disabled = true;
      item.active = false;
    });
    sessao.active = true;
    sessao.checked = false;
    sessao.disabled = false;
    setCurrentSessao(sessao);
  };

  const handleBackSession = () => {
    if (siderbar && siderbar.length > 0) {
      const currentIndex = siderbar.findIndex((item) => item.active === true);
      if (hasBackSession()) {
        handleSelectSessao(siderbar[currentIndex - 1]);
      }
    }
  };

  const handleNextSession = () => {
    if (
      !siderbar ||
      siderbar.length === 0 ||
      !currentSessao ||
      !currentSessao.campos
    ) {
      return;
    }

    // 1. Validação de campos obrigatórios
    const allRequiredFilled = currentSessao.campos.every((campo) => {
      if (campo.obrigatorio && campo.type !== "titulo_subtitulo") {
        return (
          campo.conteudoCampoApi !== undefined &&
          campo.conteudoCampoApi.toString().trim() !== ""
        );
      }
      return true;
    });

    if (!allRequiredFilled) {
      toast.error("Preencha todos os campos obrigatórios. (*)");
      setFieldError("Preencha todos os campos obrigatórios. (*)");
      return;
    }

    // 2. Envia os dados
    const sented = handleSendFieldsData(currentSessao.campos);

    if (!sented) {
      toast.error("Erro ao enviar os dados.");
      console.log("Não foi possível enviar os dados para a api.");
      return;
    }

    // 3. Marca a sessão atual como checked e desativa
    const currentIndex = siderbar.findIndex((item) => item.active === true);
    if (currentIndex !== -1) {
      siderbar[currentIndex].checked = true;
      siderbar[currentIndex].active = false;
      siderbar[currentIndex].disabled = true;
    }

    // 4. Busca a próxima sessão ainda não checada
    const nextUncheckedIndex = siderbar.findIndex(
      (item, index) => !item.checked && index > currentIndex
    );

    // 5. Define o índice de destino
    const targetIndex =
      nextUncheckedIndex !== -1 ? nextUncheckedIndex : siderbar.length - 1;

    // 6. Atualiza todos os itens
    siderbar.forEach((item, index) => {
      item.active = index === targetIndex;
      item.disabled = index !== targetIndex;
    });

    // 7. Define a nova sessão atual
    setCurrentSessao(siderbar[targetIndex]);
    setFieldError(null);
  };

  const handleGoToSession = (sessao: Partial<SessaoType>) => {
    siderbar?.forEach((item) => {
      item.disabled = true;
      item.active = false;
    });
    sessao.active = true;
    sessao.checked = false;
    sessao.disabled = false;
    setCurrentSessao(sessao);
  };

  const hasBackSession = () => {
    if (siderbar && siderbar.length > 0) {
      const currentIndex = siderbar.findIndex((item) => item.active === true);
      return currentIndex > 0;
    }
    return false;
  };

  const hasNextSession = (index?: number) => {
    if (siderbar && siderbar.length > 0) {
      if (index) {
        return index < siderbar.length - 1;
      }
      const currentIndex = siderbar.findIndex((item) => item.active === true);
      return currentIndex < siderbar.length - 1;
    }
    return false;
  };

  const handleSendFieldsData = async (fields: Partial<FieldType>[]) => {
    console.log(fields);
    const dataToSend = fields.filter(
      (item) => item.type !== "titulo_subtitulo"
    );
    console.log(dataToSend);

    const res = await execApi({
      url: `api/crm/proposal/answer/unified/layout/${idProposalGroup}`,
      data: dataToSend,
      method: "POST",
    });

    return res.status === 200;
  };

  return (
    <Container className="py-10">
      <div className="flex justify-center items-start flex-col sm:flex-row gap-10">
        <div className="w-full sm:max-w-1/3 space-y-4">
          {siderbar && <NavContainer navItems={siderbar} />}
        </div>
        <div className="w-full sm:max-w-2/3">
          {currentSessao?.campos && (
            <SessionContainer
              fields={currentSessao.campos.filter(
                (item) => item.type !== "titulo_subtitulo"
              )}
              error={fieldError}
              isInputType={currentSessao.isInputType}
              resumeSessions={siderbar}
              handleSelectSessao={handleGoToSession}
            />
          )}
          <div className="w-full mt-10 grid grid-cols-2 gap-x-4">
            <Button
              className="w-full cursor-pointer"
              variant="secondary"
              onClick={() => handleBackSession()}
              disabled={!hasBackSession()}
            >
              Voltar
            </Button>
            <Button
              className="w-full cursor-pointer"
              onClick={() => handleNextSession()}
              disabled={!hasNextSession()}
            >
              Avançar
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
