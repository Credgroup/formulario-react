import { useEffect } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecommendationStore } from "../../stores/useRecommendationStore";

export default function RecommendationGetParamsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setRecommendationIds = useRecommendationStore((state) => state.setIds);

  useEffect(() => {
    const i = searchParams.get("i");
    const o = searchParams.get("o");

    window.history.replaceState({}, "", window.location.pathname);

    if (i && o) {
      setRecommendationIds(i, o);
      navigate("/risk/recom/welcome");
    } else {
      // Fallback or handle missing params
      navigate("/risk/recom/welcome");
    }
  }, [navigate, setRecommendationIds]);

  const version = import.meta.env.VITE_IMAGE_VERSION;

  return (
    <div className="w-screen h-screen grid place-items-center text-center gap-4">
      <LuLoaderCircle className="animate-spin text-4xl mx-auto" />
      <h1 className="text-3xl font-bold">Carregando...</h1>
      <footer className="text-sm text-gray-500">{version}</footer>
    </div>
  );
}
