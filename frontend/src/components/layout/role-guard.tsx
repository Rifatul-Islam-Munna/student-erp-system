import React from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getRolePrefix } from "@/lib/utils";
import Loading from "@/pages/loading";

interface RoleGuardProps {
  children: React.ReactNode;
}

export default function RoleGuard({ children }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const { role } = useParams<{ role: string }>();
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  if (role && getRolePrefix(user.role) !== role) {
    // Ensure we have a valid role before redirecting, otherwise fallback to mapped prefix
    const targetPrefix = getRolePrefix(user.role);
    const newPath = location.pathname.replace(`/${role}`, `/${targetPrefix}`);
    
    // Only redirect if it's actually different to avoid infinite loops
    if (newPath !== location.pathname) {
      return <Navigate to={newPath} replace />;
    }
  }

  return <>{children}</>;
}
