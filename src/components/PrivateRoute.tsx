import { Navigate, Outlet } from "react-router-dom";
import { useIdProposalGroupStore } from "../stores/useIdProposalGroup";

export function PrivateRoute() {
  const id = useIdProposalGroupStore((state) => state.idProposalGroup);

  return id ? <Outlet /> : <Navigate to="/notfound" replace />;
}
