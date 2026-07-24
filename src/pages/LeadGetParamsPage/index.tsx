import { useEffect } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { useIdProposalGroupStore } from "../../stores/useIdProposalGroup";
import { setLeadParams } from "../../stores/useLeadStore";
import { dev_log } from "@/lib/utils";

export default function LeadGetParamsPage() {
  const navigate = useNavigate();
  const idProposalGroup = useIdProposalGroupStore(
    (state) => state.idProposalGroup
  );
  const setIdProposalGroup = useIdProposalGroupStore(
    (state) => state.setIdProposalGroup
  );

  useEffect(() => {
    let search = window.location.search;
    if (!search && window.location.hash.includes("?")) {
      search = window.location.hash.substring(window.location.hash.indexOf("?"));
    }
    const params = new URLSearchParams(search);
    const id = params.get("idGrupoProposta") || params.get("grupoProposta");
    const idOperacao = params.get("idOperacao");
    const idProduto = params.get("idProduto");

    window.history.replaceState({}, "", window.location.pathname);
    dev_log(() => console.log("LeadGetParamsPage id:", id, "op:", idOperacao, "prod:", idProduto));

    if (id) {
      setIdProposalGroup(id);
      if (idOperacao && idProduto) {
        setLeadParams(idOperacao, idProduto);
      }
      navigate("/lead/proposal/welcome");
    } else if (idProposalGroup) {
      navigate("/lead/proposal/welcome");
    } else {
      navigate("/notfound");
    }
  }, [idProposalGroup, navigate, setIdProposalGroup]);

  const version = import.meta.env.VITE_IMAGE_VERSION;

  return (
    <div className="w-screen h-screen grid place-items-center text-center gap-4">
      <LuLoaderCircle className="animate-spin text-4xl mx-auto" />
      <h1 className="text-3xl font-bold">Carregando Proposta do Lead...</h1>
      <footer className="text-sm text-gray-500">{version}</footer>
    </div>
  );
}
