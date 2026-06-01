import { useEffect } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { useInspectionStore } from "../../stores/useInspectionStore";
import { dev_log } from "@/lib/utils";

export default function InspectionGetParamsPage() {
  const navigate = useNavigate();
  const idInspecao = useInspectionStore((state) => state.idInspecao);
  const setIdInspecao = useInspectionStore((state) => state.setIdInspecao);

  useEffect(() => {
    let search = window.location.search;
    if (!search && window.location.hash.includes("?")) {
      search = window.location.hash.substring(window.location.hash.indexOf("?"));
    }
    const params = new URLSearchParams(search);

    // Check if '?id=1234' format
    let id = params.get("id");

    // If not found, check if '?1234' format (where key is the ID, and value is empty)
    if (!id) {
      const keys = Array.from(params.keys());
      if (keys.length > 0) {
        const firstKey = keys[0];
        if (firstKey && !params.get(firstKey)) {
          id = firstKey;
        }
      }
    }

    // Clean URL query parameters
    // window.history.replaceState({}, "", window.location.pathname);
    dev_log(() => console.log("Fetched inspection id:", id));

    if (id) {
      setIdInspecao(id);
      navigate("/risk/inspection/welcome");
    } else if (idInspecao) {
      navigate("/risk/inspection/welcome");
    } else {
      // If there is no inspection id stored or provided, redirect to notfound
      navigate("/notfound");
    }
  }, [idInspecao, navigate, setIdInspecao]);

  const version = import.meta.env.VITE_IMAGE_VERSION;

  return (
    <div className="w-screen h-screen grid place-items-center text-center gap-4">
      <LuLoaderCircle className="animate-spin text-4xl mx-auto" />
      <h1 className="text-3xl font-bold">Carregando Inspeção...</h1>
      <footer className="text-sm text-gray-500">{version}</footer>
    </div>
  );
}
