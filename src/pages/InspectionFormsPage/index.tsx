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
import { useUsuarioStore } from "@/stores/useUsuarioStore";
import { base64ToFile } from "../FormsPage/components/UploadFileField/utils";
import axios from "axios";

interface MfaApiResponse {
  sucesso: boolean;
  mensagem?: string;
}

const isEmailValid = (emailStr: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
};

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
  const [email, setEmail] = useState("");
  const [canSendCode, setCanSendCode] = useState(false);

  const idInspecao = useInspectionStore((state) => state.idInspecao);
  const usuario = useUsuarioStore((state) => state.usuario);

  const handleFinalizeForm = useCallback(() => {
    setCode("");
    setCanSendCode(false);
    setCodeModalOpen(true);
  }, []);

  // Mutação para validar código do MFA e enviar evidências
  const { mutate: sendCode, isPending: sendCodePending } = useMutation<MfaApiResponse, Error, string>({
    mutationFn: async (codeValue: string) => {
      try {
        if (!codeValue.trim()) {
          throw new Error("É necessário preencher o código de verificação");
        }

        // 1. Coleta das respostas do formulário
        const ids = new Set<number>();
        sidebar?.forEach(session => {
          session.campos?.forEach(field => {
            const match = field.campoApi?.match(/^respostaCliente_(\d+)$/);
            if (match) {
              ids.add(parseInt(match[1]));
            }
            const match2 = field.campoApi?.match(/^evidencia_recomendacao_(\d+)$/);
            if (match2) {
              ids.add(parseInt(match2[1]));
            }
          });
        });

        const respostas: any[] = [];
        const evidenciasUploads: { idRecomendacao: number; files: any[] }[] = [];

        Array.from(ids).forEach((idRecomendacao) => {
          let comentario = "";
          let fileInfoList: any[] = [];

          sidebar?.forEach(session => {
            session.campos?.forEach(field => {
              if (field.campoApi === `respostaCliente_${idRecomendacao}`) {
                comentario = typeof field.conteudo === "string" ? field.conteudo : "";
              }
              if (field.campoApi === `evidencia_recomendacao_${idRecomendacao}`) {
                if (field.conteudo && typeof field.conteudo === "string") {
                  try {
                    fileInfoList = JSON.parse(field.conteudo);
                  } catch (e) {
                    console.error("Erro ao fazer parse das evidencias", e);
                  }
                }
              }
            });
          });

          respostas.push({
            idRecomendacao,
            comentario,
            evidenciasBase64: []
          });

          if (fileInfoList && fileInfoList.length > 0) {
            evidenciasUploads.push({
              idRecomendacao,
              files: fileInfoList
            });
          }
        });

        // 2. Chamar api/crm/risk/inspection/validate/code
        const clientName = usuario?.nmUsuario || "";
        const res = await execApi<MfaApiResponse>({
          url: "api/crm/risk/inspection/validate/code",
          data: {
            idInspecao: Number(idInspecao),
            codigo: codeValue,
            dadosResposta: {
              idInspecao: Number(idInspecao),
              nomeCliente: clientName,
              emailCliente: email,
              respostas: respostas
            }
          },
          method: "POST",
          dontNeedLogout: true
        });

        if (!res.data.sucesso) {
          throw new Error(res.data.mensagem || "Erro na validação do código.");
        }

        // 3. Chamar api/crm/risk/inspection/recommendation/evidence/upload se houverem evidências
        if (evidenciasUploads.length > 0) {
          const uploadPromises = evidenciasUploads.map(async (item) => {
            const formData = new FormData();
            formData.append("idRecomendacao", String(item.idRecomendacao));
            
            item.files.forEach((fileInfo) => {
              const file = base64ToFile(fileInfo.base64, fileInfo.nomeArquivo);
              formData.append("Files", file);
            });

            const hasAuthToken = localStorage.getItem("token");
            const headers: Record<string, string> = {
              "Content-Type": "multipart/form-data",
            };
            if (hasAuthToken) {
              headers["Authorization"] = `bearer ${hasAuthToken}`;
            }

            const uploadRes = await axios.post(
              `${import.meta.env.VITE_URL_DOTCORE}api/crm/risk/inspection/recommendation/evidence/upload`,
              formData,
              { headers }
            );

            if (uploadRes.status !== 200 && uploadRes.status !== 201 && uploadRes.status !== 204) {
              throw new Error(`Erro ao enviar evidências da recomendação ${item.idRecomendacao}`);
            }
          });

          await Promise.all(uploadPromises);
        }

        return res.data;
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        throw new Error(
          "Aconteceu algum problema ao finalizar o formulário. \n\n" + errMsg
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
  const { mutate: generateCode, isPending: generateCodePending } = useMutation<MfaApiResponse, Error, { email: string; nome: string }>({
    mutationFn: async ({ email, nome }) => {
      try {
        const res = await execApi<MfaApiResponse>({
          url: "api/crm/risk/inspection/send/confirmation/email",
          data: {
            idInspecao: Number(idInspecao),
            email,
            nome
          },
          method: "POST",
          dontNeedLogout: true
        });

        if (!res.data.sucesso) {
          throw new Error(res.data.mensagem || "Erro ao gerar código de confirmação.");
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

  const handleSendEmailCode = useCallback(() => {
    if (!email.trim()) {
      toast.error("Por favor, insira o seu e-mail.");
      return;
    }
    if (!isEmailValid(email)) {
      toast.error("Por favor, insira um e-mail válido.");
      return;
    }
    const nome = usuario?.nmUsuario || "";
    generateCode({ email, nome });
  }, [email, generateCode, usuario]);

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
              {canSendCode
                ? "Para concluir a inspeção, insira o código de verificação enviado ao seu e-mail."
                : "Para concluir a inspeção, informe o seu e-mail para envio do código de verificação."}
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
                Confirmar Código
                {sendCodePending && <LuLoaderCircle className="animate-spin ml-2" />}
              </Button>
            </>
          ) : (
            <>
              <Label className="w-full flex flex-col gap-2 justify-start items-start">
                <span>E-mail do remetente</span>
                <Input
                  type="email"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Label>
              <Button onClick={handleSendEmailCode} disabled={generateCodePending}>
                Enviar Código
                {generateCodePending && <LuLoaderCircle className="animate-spin ml-2" />}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}
