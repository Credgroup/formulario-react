import Container from "@/components/Container";
import { Button } from "@/components/ui/button";

import SessionContainer from "../FormsPage/components/SessionContainer";
import NavContainer from "../FormsPage/components/NavContainer";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { LuLoaderCircle } from "react-icons/lu";
import { useInspectionFormPageHook } from "./useInspectionFormPageHook";
import { v4 as uuidv4 } from "uuid";
import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { execApi } from "@/hooks/useApi";
import { useInspectionStore } from "@/stores/useInspectionStore";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface MfaApiResponse {
  sucesso: boolean;
  mensagem?: string;
}

export default function InspectionFormsPage() {
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
    isPending,
    handleGoToSuccessPage,
    updateFieldValue,
    updateNormalField,
    handleNotificateRespondedForms
  } = useInspectionFormPageHook();

  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [canSendCode, setCanSendCode] = useState(false);

  const idInspecao = useInspectionStore((state) => state.idInspecao);

  const handleFinalizeForm = useCallback(() => {
    setCodeModalOpen(true);
  }, []);

  // Mutação para validar código do MFA
  const { mutate: sendCode, isPending: sendCodePending } = useMutation<MfaApiResponse, Error, string>({
    mutationFn: async (codeValue: string) => {
      try {
        if (!codeValue.trim()) {
          throw new Error("É necessário preencher o código de verificação");
        }

        const res = await execApi<MfaApiResponse>({
          url: "api/crm/risk/inspection/validate/code",
          data: {
            idInspecao: idInspecao,
            codigo: codeValue
          },
          method: "POST",
          dontNeedLogout: true
        });

        if (!res.data.sucesso) {
          throw new Error(res.data.mensagem);
        }

        return res.data;
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        throw new Error(
          "Aconteceu algum problema ao enviar código de verificação. \n\n" + errMsg
        );
      }
    },
    onSuccess: () => {
      handleNotificateRespondedForms();
      handleGoToSuccessPage();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Mutação para gerar e enviar código do MFA
  const { mutate: generateCode, isPending: generateCodePending } = useMutation<MfaApiResponse, Error, void>({
    mutationFn: async () => {
      try {
        const res = await execApi<MfaApiResponse>({
          url: "api/crm/risk/inspection/send/confirmation/email",
          data: {
            idInspecao: idInspecao
          },
          method: "POST",
          dontNeedLogout: true
        });

        if (!res.data.sucesso) {
          throw new Error(res.data.mensagem);
        }

        return res.data;
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        throw new Error(
          "Aconteceu algum problema ao gerar código de verificação. \n\n" + errMsg
        );
      }
    },
    onSuccess: () => {
      setCanSendCode(true);
      toast.success("Código de confirmação enviado para seu e-mail.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  return (
    <Container className="py-10">
      <div className="flex justify-center items-start flex-col sm:flex-row gap-10">
        <div className="w-full sm:max-w-1/3 space-y-4 sticky top-8">
          {sidebar && <NavContainer navItems={sidebar} />}
        </div>
        <div className="w-full sm:max-w-2/3">
          {currentSessao && currentSessao.campos && (
            <SessionContainer
              fields={currentSessao.campos.filter(
                (item) =>
                  item.type !== "titulo_subtitulo" &&
                  item.visual !== false
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
              {currentSessao?.typeSession === "input" || currentSessao?.typeSession === "documento" ? (
                <Button
                  className="w-full cursor-pointer"
                  onClick={() => handleNextSession()}
                  disabled={!hasNextSession() || isPending}
                >
                  Avançar
                </Button>
              ) : (
                <Button className="w-full cursor-pointer" onClick={() => handleFinalizeForm()}>
                  Finalizar
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dialog para erros genéricos */}
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

      {/* Dialog para código de confirmação (MFA) */}
      <Dialog open={codeModalOpen} onOpenChange={setCodeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Código de confirmação</DialogTitle>
            <DialogDescription>
              Para concluir a inspeção, confirme o código de verificação enviado
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
              <Button onClick={() => sendCode(code)} disabled={sendCodePending}>
                Enviar
                {sendCodePending && <LuLoaderCircle className="animate-spin ml-2" />}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => generateCode()} disabled={generateCodePending}>
                Confirmar código
                {generateCodePending && <LuLoaderCircle className="animate-spin ml-2" />}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}
