import { LuArrowRight, LuLoaderCircle, LuX } from "react-icons/lu";
import Container from "../../components/Container";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import useProposalLayout from "@/hooks/useProposalLayout";
import { useIdProposalGroupStore } from "@/stores/useIdProposalGroup";
import { setLayout } from "@/stores/useLayoutStore";
import { useUsuarioStore } from "@/stores/useUsuarioStore";
import { dev_log, productsToString } from "@/lib/utils";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CountryFlag, type CountryCode } from 'react-country-flags-lazyload';
import { useLanguageStore, type LanguagesType } from "@/stores/useLanguageStore";
import { useState } from "react";

export default function WelcomePage() {
  const idGrupoProposta = useIdProposalGroupStore(
    (state) => state.idProposalGroup
  );

  const lngSelected = useLanguageStore(state => state.lng)
  const setLng = useLanguageStore(state => state.setLng)

  const [languageSelected, setLanguageSelected] = useState(identifyLanguage(lngSelected))

  const navigate = useNavigate();

  const userInfo = useUsuarioStore((state) => state.usuario);

  const { isLoading, isError } = useProposalLayout({
    idGrupoProposta: idGrupoProposta ?? "",
    successFn: (data) => {
      dev_log(() => console.log("success", data));
      if (data) {
        const layout = data;
        setLayout(layout);
      }
    },
    errorFn: (error) => {
      dev_log(() => console.log("error", error));
      toast.error("Ocorreu um erro ao buscar o layout da proposta", {
        description: String(error?.message ?? "Erro desconhecido"),
      });
    },
  });

  function changeLinguage(lng: string){
    setLng(lng as LanguagesType)
    setLanguageSelected(identifyLanguage(lng))

  }

  function identifyLanguage(string:string | null){
    switch(string){
      case "pt": 
        return "BR"
      break
      case "en": 
        return "US"
      break
      case "es": 
        return "ES"
      default:
      return "BR"
    }
  }

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

        <div className="flex items-center gap-4">
          <Button
            className="rounded-full cursor-pointer flex items-center"
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
          <Select onValueChange={changeLinguage} defaultValue={languageSelected}>
            <SelectTrigger
              className="bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)]"
            >
              <SelectValue>
                <CountryFlag countryCode={languageSelected as CountryCode} />
                {languageSelected.toUpperCase()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="">
              <SelectItem value="en">
                <CountryFlag countryCode="US"/>
                US
              </SelectItem>
              <SelectItem value="pt">
                <CountryFlag countryCode="BR"/>
                BR
              </SelectItem>
              <SelectItem value="es">
                <CountryFlag countryCode="ES"/>
                ES
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Container>
    </div>
  );
}
