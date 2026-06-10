import { Navigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { getRolePrefix } from "@/lib/utils";
import Loading from "@/pages/loading";

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (user) {
    const rolePrefix = getRolePrefix(user.role);
    return <Navigate to={`/${rolePrefix}/dashboards`} replace />;
  }

  return <Navigate to="/auth/sign-in" replace />;
}
