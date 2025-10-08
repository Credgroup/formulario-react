import Container from "@/components/Container";
import { Button } from "@/components/ui/button";

import SessionContainer from "./components/SessionContainer";
import NavContainer from "./components/NavContainer";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { LuLoaderCircle } from "react-icons/lu";
import { useFormPageHook } from "./useFormPageHook";
import { v4 as uuidv4 } from "uuid";
import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { execApi } from "@/hooks/useApi";
import { useIdProposalGroupStore } from "@/stores/useIdProposalGroup";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
export default function FormsPage() {

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
    isError,
    error,
    isPendingFile,
    isErrorFile,
    errorFile,
    handleGoToSuccessPage,
    continueFromLastSession,
    dialogContinueFromLastSessionOpen,
    setDialogContinueFromLastSessionOpen,
    updateFieldValue,
    updateNormalField,
    handleAcceptContinueFromLastSession,
    handleNotificateRespondedForms
  } = useFormPageHook();

  const [codeModalOpen, setCodeModalOpen] = useState(false)
  const [code, setCode] = useState("")

  const handleFinalizeForm = useCallback(()=>{
    setCodeModalOpen(true)
  }, [])

  const id = useIdProposalGroupStore((state) => state.idProposalGroup)
  const [canSendCode, setCanSendCode] = useState(false)


  const { mutate: sendCode, isPending: sendCodePending } = useMutation({
    mutationFn: async (code: string) =>{
      try {
        if(!code.trim()) {
          throw new Error("É necessário preencher o código de verificação")
        }

        const res: any = await execApi({
          url: "api/crm/proposal/validate/code",
          data: {
            idGrupoProposta: id,
            codigo: code
          },
          method: "POST",
          dontNeedLogout: true
        })

        if(!res.data.sucesso){
          throw new Error(res.data.mensagem)
        }

        return res.data
      } catch (error: any) {
        throw new Error("Aconteceu algum problema ao enviar codigo de verificação. \n\n" + error.message)
      }
    },
    onSuccess: () =>{
      handleNotificateRespondedForms()
      handleGoToSuccessPage()
    },
    onError: (error) =>{
      toast.error(error.message)
    }
  })

  const { mutate: generateCode, isPending: generateCodePending } = useMutation({
    mutationFn: async () =>{
      try {
        const res: any = await execApi({
          url: "api/crm/proposal/send/confirmation/email",
          data: {
            idGrupoProposta: id
          },
          method: "POST",
          dontNeedLogout: true
        })

        if(!res.data.sucesso){
          throw new Error(res.data.mensagem)
        }

        return res.data
      } catch (error: any) {
        throw new Error("Aconteceu algum problema ao gerar codigo de verificação. \n\n" + error.message)
      }
    },
    onSuccess: () =>{
      setCanSendCode(true)
    },
    onError: () =>{
      toast.error(error.message)
    }
  })

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

          {
            !currentSessao && (
              <div className="w-full h-full flex justify-center items-center">
                <LuLoaderCircle className="animate-spin" />
              </div>
            )
          }

          {
            currentSessao && (
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
                    {isPending && <LuLoaderCircle className="animate-spin ml-2" />}
                    {isPendingFile && <LuLoaderCircle className="animate-spin ml-2" />}
                  </Button>
                ) : (
                  <Button onClick={() => handleFinalizeForm()}>Finalizar</Button>
                )}
              </div>
            )
          }
        </div>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="!w-full !max-w-2xl">
          <DialogTitle>Erro ao enviar dados</DialogTitle>
          <DialogDescription>
            Preencha os campos de forma correta e tente novamente
          </DialogDescription>
          <div className="space-y-4 w-full">
            {postApiError?.map((item) => {
              return (
                <div
                  key={uuidv4()}
                  className="w-full bg-red-500/20 border border-red-500/50 p-3 rounded-md"
                >
                  {item}
                </div>
              );
            })}
            {isErrorFile && (
              <div className="w-full bg-red-500/20 border border-red-500/50 p-3 rounded-md">
                {errorFile.message}
              </div>
            )}
            {isError && (
              <div className="w-full bg-red-500/20 border border-red-500/50 p-3 rounded-md">
                {error.message}
              </div>
            )}
          </div>
          <DialogClose asChild>
            <Button className="cursor-pointer">Ok, Fechar</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
      <Dialog
        open={
          dialogContinueFromLastSessionOpen &&
          continueFromLastSession.userAccepted === false
        }
        onOpenChange={setDialogContinueFromLastSessionOpen}
      >
        <DialogContent className="!w-full !max-w-md">
          <DialogTitle>Continuar da última sessão?</DialogTitle>
          <DialogDescription>
            Identificamos que você já preencheu alguns campos anteriormente.
            Deseja continuar de onde parou?
          </DialogDescription>
          <div className="w-full bg-yellow-500/20 border border-yellow-500/50 p-3 rounded-md">
            {sidebar ? (
              <p>
                A ultima sessão identificada foi:{" "}
                <span className="font-semibold">
                  {sidebar[continueFromLastSession.index]?.title}
                </span>
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="cursor-pointer" variant="secondary">
                Não, obrigado
              </Button>
            </DialogClose>
            <Button
              className="cursor-pointer"
              onClick={() => {
                setDialogContinueFromLastSessionOpen(false);
                handleAcceptContinueFromLastSession();
              }}
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={codeModalOpen} onOpenChange={setCodeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Código de confirmação</DialogTitle>
            <DialogDescription>Para concluir o envio, confirme o código de verificação</DialogDescription>
          </DialogHeader>

          {
            canSendCode ? (
              <>
                <Label className="w-full flex flex-col gap-2 justify-start items-start">
                  <span>Código de verificação</span>
                  <Input className="!text-2xl font-semibold" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6}/>
                </Label>
                <Button onClick={()=> sendCode(code)} disabled={sendCodePending}>
                  Enviar
                  {
                    sendCodePending && <LuLoaderCircle className="animate-spin" />
                  }
                </Button>
              </>
            ) : (
              <>
                <Button onClick={()=> generateCode()} disabled={generateCodePending}>
                  Confirmar codigo
                  {
                    generateCodePending && <LuLoaderCircle className="animate-spin" />
                  }
                </Button>
              </>
            )
          }
        </DialogContent>
      </Dialog>
    </Container>
  );
}
