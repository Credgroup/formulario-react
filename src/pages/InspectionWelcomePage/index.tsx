import { LuArrowRight, LuLoaderCircle, LuX } from "react-icons/lu";
import Container from "../../components/Container";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  useInspectionStore, 
  setInspectionLayout, 
  setInspectionRawResponse 
} from "@/stores/useInspectionStore";
import useInspectionLayout from "@/hooks/useInspectionLayout";
import { generateInspectionLayout } from "@/lib/inspectionUtils";
import { dev_log } from "@/lib/utils";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CountryFlag, type CountryCode } from 'react-country-flags-lazyload';
import { useLanguageStore, type LanguagesType } from "@/stores/useLanguageStore";
import { useState } from "react";

export default function InspectionWelcomePage() {
  const navigate = useNavigate();
  const idInspecao = useInspectionStore((state) => state.idInspecao);

  const lngSelected = useLanguageStore((state) => state.lng);
  const setLng = useLanguageStore((state) => state.setLng);

  const [languageSelected, setLanguageSelected] = useState(identifyLanguage(lngSelected));

  const { mutate: fetchLayout, isPending, isError } = useInspectionLayout();

  function handleStartInspection() {
    if (!idInspecao) {
      toast.error("Identificador de inspeção não encontrado.");
      return;
    }

    fetchLayout(idInspecao, {
      onSuccess: (data) => {
        dev_log(() => console.log("Inspection layout fetched:", data));
        try {
          const generatedFields = generateInspectionLayout(data);
          setInspectionLayout(generatedFields);
          setInspectionRawResponse(data);
          toast.success("Layout carregado com sucesso!");
          navigate("/risk/inspection/forms");
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          dev_log(() => console.error("Error generating layout:", errMsg));
          toast.error("Erro ao processar estrutura do formulário.");
        }
      },
      onError: (err: Error) => {
        dev_log(() => console.error("Error fetching layout:", err));
        toast.error("Ocorreu um erro ao buscar o layout da inspeção", {
          description: String(err.message ?? "Erro desconhecido"),
        });
      }
    });
  }

  function changeLanguage(lng: string) {
    setLng(lng as LanguagesType);
    setLanguageSelected(identifyLanguage(lng));
  }

  function identifyLanguage(string: string | null) {
    switch (string) {
      case "pt":
        return "BR";
      case "en":
        return "US";
      case "es":
        return "ES";
      default:
        return "BR";
    }
  }

  return (
    <div className="w-full h-screen m-auto bg-[url('https://wkfkeepinsmarsh.blob.core.windows.net/themescss/marsh/bg-marsh-forms.png')] bg-center bg-cover bg-no-repeat text-white flex items-center justify-center">
      <Container>
        <h1 className="text-3xl font-bold mb-2">
          Bem-vindo à Inspeção
        </h1>
        <p className="text-lg mb-4 w-full max-w-2xl">
          Você está prestes a visualizar a inspeção de risco de número <span className="font-semibold">#{idInspecao}</span>. 
          Clique em responder para visualizar as recomendações e dados do local.
        </p>

        <div className="flex items-center gap-4">
          <Button
            className="rounded-full cursor-pointer flex items-center gap-2"
            variant="secondary"
            onClick={handleStartInspection}
            disabled={isPending}
          >
            {isPending ? (
              <>
                Carregando formulário
                <LuLoaderCircle className="animate-spin" />
              </>
            ) : isError ? (
              <>
                Tentar Novamente
                <LuX />
              </>
            ) : (
              <>
                Responder
                <LuArrowRight />
              </>
            )}
          </Button>
          <Select onValueChange={changeLanguage} defaultValue={languageSelected}>
            <SelectTrigger
              className="bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)]"
            >
              <SelectValue>
                <CountryFlag countryCode={languageSelected as CountryCode} />
                {languageSelected.toUpperCase()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">
                <CountryFlag countryCode="US" />
                US
              </SelectItem>
              <SelectItem value="pt">
                <CountryFlag countryCode="BR" />
                BR
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Container>
    </div>
  );
}
