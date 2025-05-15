import { useEffect } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { useIdProposalGroupStore } from "../../stores/useIdProposalGroup";
import { setUsuario } from "@/stores/useUsuarioStore";

export default function GetParamsPage() {
  const navigate = useNavigate();
  const idProposalGroup = useIdProposalGroupStore(
    (state) => state.idProposalGroup
  );
  const setIdProposalGroup = useIdProposalGroupStore(
    (state) => state.setIdProposalGroup
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("grupoProposta");
    const nome = params.get("nmSegurado");
    const produtos = params.get("produtos");

    window.history.replaceState({}, "", window.location.pathname);
    console.log(id, nome, produtos);

    if (id && nome && produtos) {
      console.log(id, nome, produtos);
      setIdProposalGroup(id);
      let userProdutos: any = decodeURIComponent(produtos);
      userProdutos = JSON.parse(userProdutos);

      const userObj = {
        nmUsuario: nome,
        idGrupoProposta: id,
        produtos: userProdutos,
      };

      console.log(userObj);
      setUsuario(userObj);

      navigate("/welcome");
    } else if (idProposalGroup) {
      navigate("/welcome");
    }
  }, [idProposalGroup]);

  const version = import.meta.env.VITE_IMAGE_VERSION;

  return (
    <div className="w-screen h-screen grid place-items-center text-center gap-4">
      <LuLoaderCircle className="animate-spin text-4xl mx-auto" />
      <h1 className="text-3xl font-bold">Carregando...</h1>
      <footer className="text-sm text-gray-500">{version}</footer>
    </div>
  );
}
