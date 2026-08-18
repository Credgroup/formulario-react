import { Navigate, Outlet } from "react-router-dom";
import { useRecommendationStore } from "../stores/useRecommendationStore";

export default function RecommendationPrivateRoute() {
  const id = useRecommendationStore((state) => state.idInspecao);

  return id ? <Outlet /> : <Navigate to="/notfound" replace />;
}
