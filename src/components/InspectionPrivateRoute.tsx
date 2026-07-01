import { Navigate, Outlet } from "react-router-dom";
import { useInspectionStore } from "../stores/useInspectionStore";

export default function InspectionPrivateRoute() {
  const id = useInspectionStore((state) => state.idInspecao);

  return id ? <Outlet /> : <Navigate to="/notfound" replace />;
}
