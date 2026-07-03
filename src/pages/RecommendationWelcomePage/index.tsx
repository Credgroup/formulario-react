import { LuArrowRight } from "react-icons/lu";
import Container from "../../components/Container";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { setLayout } from "@/stores/useLayoutStore";
import { useRecommendationStore } from "@/stores/useRecommendationStore";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { getDynamicToken } from "@/lib/utils";

export default function RecommendationWelcomePage() {
  const { idInspecao, idOperacao } = useRecommendationStore();
  const navigate = useNavigate();

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["layout-recomendacao", idInspecao, idOperacao],
    mutationFn: async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_URL_DOTCORE}api/crm/risk/recommendation/generate/unified/layout/${idOperacao}`,
        {
          headers: {
            "x-token": `${getDynamicToken()}`,
          },
        }
      ).then((res) => res)
      console.log(res)
      if (res.status !== 200) {
        throw new Error("Não foi possível buscar formulário de cadastro da recomendação")
      }
      return res.data;
    },
    onSuccess: (data) => {
      setLayout(data);
      navigate("/risk/recom/forms");
    },
    onError: () => {
      toast.error("Erro ao buscar layout, tente novamente mais tarde");
    }
  })

  return (
    <div className="w-full h-screen m-auto bg-[url('https://wkfkeepinsmarsh.blob.core.windows.net/themescss/marsh/bg-marsh-forms.png')] bg-center bg-cover bg-no-repeat text-white flex items-center justify-center">
      <Container>
        <h1 className="text-3xl font-bold mb-2">Criação de Recomendações</h1>
        <p className="text-lg mb-4 w-full max-w-2xl">
          Você está prestes a criar novas recomendações para a inspeção {idInspecao}.
        </p>

        <div className="flex items-center gap-4">
          <Button
            className="rounded-full cursor-pointer flex items-center"
            variant="secondary"
            onClick={() => mutateAsync()}
            disabled={isPending}
          >
            {isPending ? "Carregando..." : "Adicionar recomendações"}
            <LuArrowRight className="ml-2" />
          </Button>
        </div>
      </Container>
    </div>
  );
}
