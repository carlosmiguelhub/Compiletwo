import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Wait until Firebase finishes checking the auth state
  if (loading) return <div>Loading...</div>;

  // If no logged-in user exists, send them to login
  if (!user) return <Navigate to="/login" replace />;

  // If authenticated, allow access to the protected page
  return <>{children}</>;
}