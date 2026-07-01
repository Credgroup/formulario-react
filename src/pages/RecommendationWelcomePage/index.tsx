import { LuArrowRight } from "react-icons/lu";
import Container from "../../components/Container";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { setLayout } from "@/stores/useLayoutStore";
import { useRecommendationStore } from "@/stores/useRecommendationStore";
import mockLayout from "../../../mock-clone-layout";

export default function RecommendationWelcomePage() {
  const { idInspecao, idOperacao } = useRecommendationStore();
  const navigate = useNavigate();

  const handleCreate = () => {
    // In the future this will fetch the layout using idOperacao.
    // For now, we use the mock.
    const layout = JSON.parse(JSON.stringify(mockLayout)); // Deep clone to avoid mutating the original mock
    setLayout(layout);
    navigate("/risk/recom/forms");
  };

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
            onClick={handleCreate}
          >
            Adicionar recomendações
            <LuArrowRight className="ml-2" />
          </Button>
        </div>
      </Container>
    </div>
  );
}
