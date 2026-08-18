import { useEffect } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecommendationStore } from "../../stores/useRecommendationStore";

export default function RecommendationGetParamsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setRecommendationIds = useRecommendationStore((state) => state.setIds);

  useEffect(() => {
    let search = window.location.search;
    if (!search && window.location.hash.includes("?")) {
      search = window.location.hash.substring(window.location.hash.indexOf("?"));
    }
    const params = new URLSearchParams(search);
    
    // Tenta pegar pelo fallback manual primeiro, depois pelo useSearchParams do React Router
    const i = params.get("i") || searchParams.get("i");
    const o = params.get("o") || searchParams.get("o");

    if (i && o) {
      setRecommendationIds(i, o);
      navigate("/risk/recom/welcome");
    } else {
      // Se não encontrou, o RecommendationPrivateRoute irá barrar o acesso na /welcome
      // e redirecionar para o /notfound, o que é o comportamento esperado.
      navigate("/risk/recom/welcome");
    }
  }, [navigate, setRecommendationIds, searchParams]);

  const version = import.meta.env.VITE_IMAGE_VERSION;

  return (
    <div className="w-screen h-screen grid place-items-center text-center gap-4">
      <LuLoaderCircle className="animate-spin text-4xl mx-auto" />
      <h1 className="text-3xl font-bold">Carregando...</h1>
      <footer className="text-sm text-gray-500">{version}</footer>
    </div>
  );
}
