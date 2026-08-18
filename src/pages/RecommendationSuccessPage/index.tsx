import { LuCheck } from "react-icons/lu";
import Container from "../../components/Container";
import { Button } from "../../components/ui/button";

export default function RecommendationSuccessPage() {
  const handleClose = () => {
    // In a real flow, this could close a webview or navigate to an external URL.
    window.location.href = "https://www.google.com";
  };

  return (
    <div className="w-full h-screen m-auto bg-[url('https://wkfkeepinsmarsh.blob.core.windows.net/themescss/marsh/bg-marsh-forms.png')] bg-center bg-cover bg-no-repeat text-white flex items-center justify-center">
      <Container>
        <div className="flex flex-col items-center justify-center text-center">
          <LuCheck className="text-6xl text-green-500 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Recomendações Enviadas!</h1>
          <p className="text-lg mb-8 max-w-lg">
            Sujas recomendações foram submetidas com sucesso. Elas já estão sendo processadas pelo sistema.
          </p>
          <Button onClick={handleClose} variant="secondary" className="px-8">
            Voltar ao Início
          </Button>
        </div>
      </Container>
    </div>
  );
}
