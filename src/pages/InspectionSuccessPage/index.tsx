import { Button } from "@/components/ui/button";
import { LuArrowRight, LuCheck } from "react-icons/lu";

export default function InspectionSuccessPage() {
  const handleClosePage = () => {
    window.location.href = "https://www.google.com.br";
  };
  return (
    <div className="w-full flex justify-center items-center m-auto px-4 py-20">
      <div className="flex flex-col items-center w-full max-w-xl gap-4 text-center">
        <div className="w-26 h-26 rounded-full flex items-center justify-center bg-green-500 shadow-md">
          <LuCheck className="w-20 h-20 text-white mx-auto" />
        </div>
        <h1 className="text-2xl font-semibold">
          Inspeção Concluída!
        </h1>
        <p className="text-gray-600">
          A visualização das recomendações de segurança e dados da inspeção foi confirmada com sucesso.
          Agradecemos sua colaboração com a análise de risco.
        </p>
        <Button
          onClick={handleClosePage}
          className="w-full max-w-sm rounded-full cursor-pointer group mt-4"
        >
          Fechar esta página
          <LuArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </Button>
      </div>
    </div>
  );
}
