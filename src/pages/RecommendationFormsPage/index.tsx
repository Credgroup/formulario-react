import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { useRecommendationStore } from "@/stores/useRecommendationStore";

import { SessionContainer } from "@/lib/sbs-form-components/src/components/SessionContainer";
import { NavContainer } from "@/lib/sbs-form-components/src/components/NavContainer";
import { SidebarProvider } from "@/lib/sbs-form-components/src/context/SidebarContext";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { LuLoaderCircle, LuPlus, LuTrash } from "react-icons/lu";
import { useRecommendationFormHook } from "./useRecommendationFormHook";
import { v4 as uuidv4 } from "uuid";
import { useCallback, useState, useEffect } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { dev_log } from "@/lib/utils";
import type { SessaoType } from "@/types";
import axios from "axios";

function getDynamicToken() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const xtoken = import.meta.env.VITE_X_TOKEN;
  return `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}${xtoken}${hour.toString().padStart(2, '0')}${minute.toString().padStart(2, '0')}`;
}

export default function RecommendationFormsPage() {
  const idInspecaoStr = useRecommendationStore((state) => state.idInspecao);
  const idInspecao = Number(idInspecaoStr) || 0;

  const {
    sidebar,
    currentSessao,
    fieldError,
    postApiError,
    dialogOpen,
    setDialogOpen,
    handleBackSession,
    handleNextSession,
    hasBackSession,
    hasNextSession,
    handleSelectSessao,
    handleGoToSuccessPage,
    updateFieldValue,
    updateNormalField,
    handleCloneSession,
    canAddNewSession,
    canDeleteSession,
    handleDeleteSession,
  } = useRecommendationFormHook();

  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [canSendCode, setCanSendCode] = useState(false);
  const [isPendingMfa, setIsPendingMfa] = useState(false);
  const [isPendingCodeGeneration, setIsPendingCodeGeneration] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Fecha o modal de excluir se não for mais permitido excluir
  useEffect(() => {
    if (!canDeleteSession && deleteModalOpen) {
      setDeleteModalOpen(false);
    }
  }, [canDeleteSession, deleteModalOpen]);

  const handleRequestDelete = useCallback((session: Partial<SessaoType>) => {
    const hasFilledFields = session.campos?.some(campo => {
      if (campo.type === "titulo_subtitulo") return false;
      return campo.conteudo !== undefined && campo.conteudo !== null && campo.conteudo.toString().trim() !== "";
    });

    if (hasFilledFields) {
      if (!window.confirm("Tem certeza que deseja excluir essa recomendação? Ela possui campos preenchidos.")) {
        return;
      }
    }

    handleDeleteSession(session.id!);
    setDeleteModalOpen(false);
  }, [handleDeleteSession]);

  const handleFinalizeForm = useCallback(() => {
    setCode("");
    setCanSendCode(false);
    setCodeModalOpen(true);
  }, []);

  const handleGenerateCode = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Por favor, insira um e-mail válido.");
      return;
    }
    if (!idInspecao) {
      toast.error("ID da inspecao não encontrado.");
      return;
    }
    setIsPendingCodeGeneration(true);
    try {
      axios.post(
        `${import.meta.env.VITE_URL_DOTCORE}api/crm/risk/inspection/send/confirmation/email`,
        {
          idInspecao,
          email
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-token": `${getDynamicToken()}`,
          },
        }
      ).then(res => {
        dev_log(() => console.log("Resposta da API:", res));
        toast.success("Código de confirmação enviado para seu e-mail.");
        setCanSendCode(true);
      }).catch(err => {
        dev_log(() => console.log("Erro ao enviar para a API:", err));
        toast.error(err?.response?.data?.message || "Erro ao processar os dados.");
        setCanSendCode(false);
      })
    } catch (err) {
      toast.error("Erro ao gerar código.");
    } finally {
      setIsPendingCodeGeneration(false);
    }
  };

  const handleValidateCodeAndSubmit = async () => {
    if (!code.trim()) {
      toast.error("É necessário preencher o código de verificação");
      return;
    }

    setIsPendingMfa(true);
    try {
      const payload: Record<string, any>[] = [];

      sidebar?.forEach(session => {
        const sessionObj: Record<string, any> = {};
        session.campos?.forEach(campo => {
          if (campo.type !== "titulo_subtitulo" && campo.campoApi) {
            // remover pos fixo _recom_X
            let campoApi = campo.campoApi.replace(/_recom_\d+$/, '');
            sessionObj[campoApi] = campo.conteudo;
          }
        });
        // Só adiciona se tiver campos
        if (Object.keys(sessionObj).length > 0) {
          payload.push(sessionObj);
        }
      });

      if (!idInspecao) {
        toast.error("ID de inspecao não encontrado.");
        return;
      }

      const dados = {
        idInspecao: idInspecao,
        dados: payload,
        code: code,
      }
      dev_log(() => console.log("Payload que seria enviado para a API:", dados));

      axios.post(
        `${import.meta.env.VITE_URL_DOTCORE}api/crm/risk/recommendation/validate/code`,
        dados,
        {
          headers: {
            "Content-Type": "application/json",
            "x-token": `${getDynamicToken()}`,
          },
        }
      ).then(res => {
        dev_log(() => console.log("Resposta da API:", res));
        toast.success("Recomendações enviadas com sucesso!");
        handleGoToSuccessPage();
      }).catch(err => {
        dev_log(() => console.log("Erro ao enviar para a API:", err));
        toast.error(err?.response?.data?.message || "Erro ao processar os dados.");
      })

    } catch (err) {
      toast.error("Aconteceu algum problema ao finalizar o formulário.");
    } finally {
      setIsPendingMfa(false);
    }
  };

  return (
    <SidebarProvider>
      <Container className="py-10">
        <div className="flex justify-center items-start flex-col sm:flex-row gap-10">
          <div className="w-full sm:max-w-1/3 space-y-4 sticky top-8">
            {sidebar && <NavContainer navItems={sidebar} />}
          </div>
          <div className="w-full sm:max-w-2/3">
            {currentSessao && currentSessao.campos && (
              <SessionContainer
                fields={currentSessao.campos.filter(
                  (item) => item.type !== "titulo_subtitulo" && item.visual !== false
                )}
                error={fieldError}
                typeSession={currentSessao.typeSession}
                allSessions={sidebar}
                handleSelectSessao={handleSelectSessao}
                updateFieldValue={updateFieldValue}
                updateNormalField={updateNormalField}
              />
            )}

            {!currentSessao && (
              <div className="w-full h-full flex justify-center items-center py-20">
                <LuLoaderCircle className="animate-spin text-3xl text-primary" />
              </div>
            )}

            {currentSessao && (
              <div className={`w-full mt-10 grid gap-4 ${currentSessao.typeSession === "input" || currentSessao.typeSession === "resumo" ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 gap-x-4"}`}>
                <Button
                  className="w-full cursor-pointer"
                  variant="secondary"
                  onClick={() => handleBackSession()}
                  disabled={!hasBackSession()}
                >
                  Voltar
                </Button>

                {(currentSessao.typeSession === "input" || currentSessao.typeSession === "resumo") && (
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteModalOpen(true)}
                    className="w-full"
                    disabled={!canDeleteSession}
                  >
                    <LuTrash className="mr-2" />
                    Excluir
                  </Button>
                )}

                {currentSessao.typeSession === "input" ? (
                  <Button
                    onClick={handleCloneSession}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={!canAddNewSession}
                  >
                    <LuPlus className="mr-2" />
                    Adicionar
                  </Button>
                ) : currentSessao.typeSession === "resumo" ? (
                  <div />
                ) : null}

                {hasNextSession() ? (
                  <Button
                    className="w-full cursor-pointer"
                    onClick={() => handleNextSession()}
                  >
                    Avançar
                  </Button>
                ) : (
                  <Button className="w-full cursor-pointer" onClick={() => handleFinalizeForm()}>
                    Concluir
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="!w-full !max-w-2xl">
            <DialogTitle>Erro ao processar dados</DialogTitle>
            <DialogDescription>
              Por favor revise as sessões do formulário
            </DialogDescription>
            <div className="space-y-4 w-full">
              {postApiError?.map((item) => (
                <div
                  key={uuidv4()}
                  className="w-full bg-red-500/20 border border-red-500/50 p-3 rounded-md"
                >
                  {item}
                </div>
              ))}
            </div>
            <DialogClose asChild>
              <Button className="cursor-pointer">Ok, Fechar</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir recomendação</DialogTitle>
              <DialogDescription>
                Selecione a recomendação que deseja excluir.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
              {sidebar?.filter(s => s.typeSession === "input").map(session => (
                <Button
                  key={session.id}
                  variant="outline"
                  className="justify-between items-center w-full"
                  onClick={() => handleRequestDelete(session)}
                >
                  {session.title}
                  <LuTrash className="text-red-500" />
                </Button>
              ))}
              {sidebar?.filter(s => s.typeSession === "input").length === 0 && (
                <p className="text-sm text-center text-muted-foreground py-4">Nenhuma recomendação para excluir.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={codeModalOpen} onOpenChange={setCodeModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Código de confirmação</DialogTitle>
              <DialogDescription>
                {canSendCode
                  ? "Para concluir, insira o código de verificação enviado ao seu e-mail."
                  : "Para concluir, informe o seu e-mail para envio do código de verificação."}
              </DialogDescription>
            </DialogHeader>

            {canSendCode ? (
              <>
                <Label className="w-full flex flex-col gap-2 justify-start items-start">
                  <span>Código de verificação</span>
                  <Input
                    className="!text-2xl font-semibold"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                  />
                </Label>
                <Button onClick={handleValidateCodeAndSubmit} disabled={isPendingMfa}>
                  Confirmar Código
                  {isPendingMfa && <LuLoaderCircle className="animate-spin ml-2" />}
                </Button>
              </>
            ) : (
              <>
                <Label className="w-full flex flex-col gap-2 justify-start items-start">
                  <span>E-mail</span>
                  <Input
                    type="email"
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Label>
                <Button onClick={handleGenerateCode} disabled={isPendingCodeGeneration}>
                  Enviar Código
                  {isPendingCodeGeneration && <LuLoaderCircle className="animate-spin ml-2" />}
                </Button>
              </>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </SidebarProvider>
  );
}
