import { LuArrowRight, LuLoaderCircle, LuX } from "react-icons/lu";
import Container from "../../components/Container";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import useProposalLayout from "@/hooks/useProposalLayout";
import { useIdProposalGroupStore } from "@/stores/useIdProposalGroup";
import { setLayout } from "@/stores/useLayoutStore";
import { useUsuarioStore } from "@/stores/useUsuarioStore";
import { productsToString } from "@/lib/utils";
import { toast } from "sonner";

export default function WelcomePage() {
  const idGrupoProposta = useIdProposalGroupStore(
    (state) => state.idProposalGroup
  );

  const navigate = useNavigate();

  const userInfo = useUsuarioStore((state) => state.usuario);

  const { isLoading, isError } = useProposalLayout({
    idGrupoProposta: idGrupoProposta ?? "",
    successFn: (data) => {
      console.log("success", data);
      if (data) {
        const layout = data;
        setLayout(layout);
      }
    },
    errorFn: (error) => {
      console.log("error", error);
      toast.error("Ocorreu um erro ao buscar o layout da proposta", {
        description: String(error?.message ?? "Erro desconhecido"),
      });
    },
  });

  return (
    <div className="w-full h-screen m-auto bg-[url('https://wkfkeepinsmarsh.blob.core.windows.net/themescss/marsh/bg-marsh-forms.png')] bg-center bg-cover bg-no-repeat text-white flex items-center justify-center">
      <Container>
        <h1 className="text-3xl font-bold mb-2 !capitalize">
          Olá, {String(userInfo?.nmUsuario).toLowerCase()}
        </h1>
        <p className="text-lg mb-4 w-full max-w-2xl">
          Vemos que você tem interesse em seguros de{" "}
          <span className="font-semibold">
            {productsToString(userInfo?.produtos ?? [])}
          </span>{" "}
          de alguns parceiros nossos, que tal fazermos uma cotação?
        </p>

        <Button
          className="rounded-full cursor-pointer flex items-center gap-"
          variant="secondary"
          onClick={() => navigate("/forms")}
          disabled={isLoading || isError}
        >
          {!isLoading && !isError && (
            <>
              Responder formulário
              <LuArrowRight />
            </>
          )}
          {isLoading && (
            <>
              Responder formulário
              <LuLoaderCircle className="animate-spin" />
            </>
          )}
          {isError && !isLoading && (
            <>
              Algum erro aconteceu
              <LuX />
            </>
          )}
        </Button>
      </Container>
    </div>
  );
}
