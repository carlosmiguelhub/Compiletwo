import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";

type AdminRouteProps = {
  children: ReactNode;
};

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();

  // Wait until both Firebase Auth and Firestore profile data are ready
  if (loading || profileLoading) {
    return <div>Loading admin access...</div>;
  }

  // If no user is logged in, send them to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin pages require a verified email
  if (!user.emailVerified) {
    return <Navigate to="/login" replace />;
  }

  // Only users with role = "admin" can continue
  if (!profile || profile.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // If all checks pass, render the protected admin page
  return <>{children}</>;
}