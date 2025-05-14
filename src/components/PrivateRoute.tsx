import { Navigate, Outlet } from "react-router-dom";
import { useIdProposalGroup } from "../stores/useIdProposalGroup";

export function PrivateRoute() {
  const id = useIdProposalGroup((state) => state.idProposalGroup);

  return id ? <Outlet /> : <Navigate to="/notfound" replace />;
}
