import { Suspense, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { getRolePrefix } from "@/lib/utils";
import Loading from "@/pages/loading";

export default function AuthLayout() {
  const { pathname, search } = useLocation();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      const rolePrefix = getRolePrefix(user.role);
      navigate(`/${rolePrefix}/dashboards`, { replace: true });
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return (
    <Suspense fallback={<Loading />}>
      <Outlet />
    </Suspense>
  );
}
