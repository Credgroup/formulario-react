import { Button } from "@/components/ui/button";
import { productsToString } from "@/lib/utils";
import { useUsuarioStore } from "@/stores/useUsuarioStore";
import { LuArrowRight, LuCheck } from "react-icons/lu";

export default function FormsSuccessPage() {
  const userInfo = useUsuarioStore((state) => state.usuario);
  const handleClosePage = () => {
    window.location.href = "https://www.google.com.br";
  };
  return (
    <div className="w-full flex justify-center items-center m-auto px-4">
      <div className="flex flex-col items-center w-full max-w-xl gap-4 text-center">
        <div className="w-26 h-26 rounded-full flex items-center justify-center bg-blue-500 shadow-md">
          <LuCheck className="w-20 h-20 text-white mx-auto" />
        </div>
        <h1 className="text-2xl font-semibold">
          Formulário enviado com sucesso!
        </h1>
        <p>
          Recebemos suas respostas e estamos processando as informações. Em
          breve, nossa equipe entrará em contato com você para apresentar as
          opções de{" "}
          <span className="font-semibold">
            {productsToString(userInfo?.produtos ?? [])}
          </span>{" "}
          que melhor atendem às suas necessidades.
        </p>
        <Button
          onClick={() => handleClosePage()}
          className="w-full max-w-sm rounded-full cursor-pointer group"
        >
          Fechar esta página
          <LuArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </Button>
      </div>
    </div>
  );
}
