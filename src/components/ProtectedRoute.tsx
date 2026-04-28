import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";

type ProtectedRouteProps = {
  children: ReactNode;
};

/**
 * ProtectedRoute
 *
 * Purpose:
 * Protects regular authenticated pages.
 * Also blocks users disabled by the admin.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();

  if (loading || profileLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.status === "disabled") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="max-w-md rounded-2xl border border-red-500/20 bg-slate-900 p-8 text-center shadow-2xl shadow-red-500/10">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-400">
            Account Disabled
          </p>
          <h1 className="mt-3 text-2xl font-black">
            Your account has been disabled.
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Please contact the administrator if you believe this is a mistake.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}