import { LuArrowRight, LuLoaderCircle } from "react-icons/lu";
import Container from "../../components/Container";
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";
import useProposalLayout from "@/hooks/useProposalLayout";
import { useIdProposalGroupStore } from "@/stores/useIdProposalGroup";
import { setLayout } from "@/stores/useLayoutStore";
import { useUsuarioStore } from "@/stores/useUsuarioStore";

export default function WelcomePage() {
  const idGrupoProposta = useIdProposalGroupStore(
    (state) => state.idProposalGroup
  );

  const userInfo = useUsuarioStore((state) => state.usuario);

  const { isLoading } = useProposalLayout({
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
    },
  });

  return (
    <div className="w-full h-screen bg-zinc-500 flex items-center justify-center">
      <Container>
        <h1 className="text-3xl font-bold mb-2 !capitalize">
          Olá, {String(userInfo?.nmUsuario).toLowerCase()}
        </h1>
        <p className="text-lg mb-4 w-full max-w-2xl">
          Vemos que você tem interesse em seguros de{" "}
          {userInfo &&
            userInfo.produtos?.map((item) => (
              <span className="mr-1 font-semibold" key={item}>
                {item}
              </span>
            ))}{" "}
          de alguns parceiros nossos, que tal fazermos uma cotação?
        </p>

        <Button
          asChild
          className="rounded-full cursor-pointer"
          variant="secondary"
        >
          <Link to="/forms" className="flex items-center gap-2">
            Desejo fazer um orçamento
            {isLoading ? (
              <LuLoaderCircle className="animate-spin" />
            ) : (
              <LuArrowRight />
            )}
          </Link>
        </Button>
      </Container>
    </div>
  );
}
