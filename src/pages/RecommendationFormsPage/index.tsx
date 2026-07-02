import Container from "@/components/Container";
import { Button } from "@/components/ui/button";

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

import { LuLoaderCircle, LuPlus } from "react-icons/lu";
import { useRecommendationFormHook } from "./useRecommendationFormHook";
import { v4 as uuidv4 } from "uuid";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { dev_log } from "@/lib/utils";

export default function RecommendationFormsPage() {
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
  } = useRecommendationFormHook();

  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [canSendCode, setCanSendCode] = useState(false);
  const [isPendingMfa, setIsPendingMfa] = useState(false);
  const [isPendingCodeGeneration, setIsPendingCodeGeneration] = useState(false);

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
    setIsPendingCodeGeneration(true);
    try {
      // Simulação da geração de código MFA
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCanSendCode(true);
      toast.success("Código de confirmação enviado para seu e-mail.");
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
      // 1. Simulação da validação do código
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (code !== "123456" && code !== "000000") {
        // Just simulating that anything works, but let's just make it success regardless of what user typed, as requested: "simule o sucesso"
      }

      // 2. Extração dos dados no formato array de objetos
      // [{campoApiDoCampoSessao1: conteudoDoCampoSessao1, ...}, {campoApiDoCampoSessao2: conteudoDoCampoSessao2, ...}]
      const payload: Record<string, any>[] = [];

      sidebar?.forEach(session => {
        const sessionObj: Record<string, any> = {};
        session.campos?.forEach(campo => {
          if (campo.type !== "titulo_subtitulo" && campo.campoApi) {
            sessionObj[campo.campoApi] = campo.conteudo;
          }
        });
        // Só adiciona se tiver campos
        if (Object.keys(sessionObj).length > 0) {
          payload.push(sessionObj);
        }
      });

      dev_log(() => console.log("Payload que seria enviado para a API:", payload));

      // 3. Simular sucesso da submissão à API (que ainda não existe)
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success("Recomendações enviadas com sucesso!");
      handleGoToSuccessPage();
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
            {sidebar && (
              <Button onClick={handleCloneSession} className="w-full mt-4 bg-green-600 hover:bg-green-700">
                <LuPlus className="mr-2" />
                Adicionar nova recomendação
              </Button>
            )}
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
              <div className="w-full mt-10 grid grid-cols-2 gap-x-4">
                <Button
                  className="w-full cursor-pointer"
                  variant="secondary"
                  onClick={() => handleBackSession()}
                  disabled={!hasBackSession()}
                >
                  Voltar
                </Button>
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
