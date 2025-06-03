import Container from "@/components/Container";
import { Button } from "@/components/ui/button";

import SessionContainer from "./components/SessionContainer";
import NavContainer from "./NavContainer";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

import { LuLoaderCircle } from "react-icons/lu";
import { useFormPageHook } from "./useFormPageHook";
import { v4 as uuidv4 } from "uuid";
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
    handleGoToSuccessPage,
    continueFromLastSession,
    setContinueFromLastSession,
    dialogContinueFromLastSessionOpen,
    setDialogContinueFromLastSessionOpen,
  } = useFormPageHook();

  return (
    <Container className="py-10">
      <div className="flex justify-center items-start flex-col sm:flex-row gap-10">
        <div className="w-full sm:max-w-1/3 space-y-4">
          {sidebar && <NavContainer navItems={sidebar} />}
        </div>
        <div className="w-full sm:max-w-2/3">
          {currentSessao?.campos && (
            <SessionContainer
              fields={currentSessao.campos.filter(
                (item) =>
                  item.type !== "titulo_subtitulo" && item.visual !== false
              )}
              error={fieldError}
              isInputType={currentSessao.isInputType}
              resumeSessions={sidebar}
              handleSelectSessao={handleSelectSessao}
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
            {currentSessao?.isInputType ? (
              <Button
                className="w-full cursor-pointer"
                onClick={() => handleNextSession()}
                disabled={!hasNextSession() || isPending}
              >
                Avançar
                {isPending && <LuLoaderCircle className="animate-spin ml-2" />}
              </Button>
            ) : (
              <Button onClick={() => handleGoToSuccessPage()}>Finalizar</Button>
            )}
          </div>
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
                setContinueFromLastSession((prev) => ({
                  ...prev,
                  userAccepted: true,
                }));
              }}
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
