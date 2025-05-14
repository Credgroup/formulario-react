import { useEffect } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import {
  setIdProposalGroup,
  useIdProposalGroup,
} from "../../stores/useIdProposalGroup";

export default function GetParamsPage() {
  const navigate = useNavigate();
  const idProposalGroup = useIdProposalGroup((state) => state.idProposalGroup);

  useEffect(() => {
    console.log("teste");
    if (!idProposalGroup) {
      console.log("teste2");
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      console.log(id);
      console.log(params);

      if (id?.trim()) {
        setIdProposalGroup(id);
        navigate("/welcome");
      } else {
        console.log("vish");
        navigate("/notfound");
      }
    }
  }, []);

  const version = import.meta.env.VITE_IMAGE_VERSION;

  return (
    <div className="w-screen h-screen grid place-items-center text-center gap-4">
      <LuLoaderCircle className="animate-spin text-4xl mx-auto" />
      <h1 className="text-3xl font-bold">Carregando...</h1>
      <footer className="text-sm text-gray-500">{version}</footer>
    </div>
  );
}
