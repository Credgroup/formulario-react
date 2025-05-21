import Container from "@/components/Container";
import { Button } from "@/components/ui/button";

import SessionContainer from "./components/SessionContainer";
import NavContainer from "./NavContainer";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

import { LuLoaderCircle } from "react-icons/lu";
import { useFormPageHook } from "./useFormPageHook";

export default function FormsPage() {
  const {
    siderbar,
    currentSessao,
    fieldError,
    postApiError,
    dialogOpen,
    setDialogOpen,
    handleBackSession,
    handleNextSession,
    handleGoToSession,
    hasBackSession,
    hasNextSession,
    isPending,
    isError,
    error,
    handleGoToSuccessPage,
  } = useFormPageHook();

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
                (item) =>
                  item.type !== "titulo_subtitulo" && item.visual !== false
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
            {currentSessao && currentSessao.isInputType ? (
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
            {postApiError &&
              postApiError.map((item, index) => {
                return (
                  <div
                    key={index}
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
    </Container>
  );
}
