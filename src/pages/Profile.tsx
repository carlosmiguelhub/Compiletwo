import {
  User,
  Mail,
  ShieldCheck,
  CalendarDays,
  KeyRound,
  LogOut,
  BadgeCheck,
  LockKeyhole,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";

export default function Profile() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isPasswordUser = useMemo(() => {
    return !!user?.providerData?.some((provider) => provider.providerId === "password");
  }, [user]);

  const providerLabel = useMemo(() => {
    const providerId = user?.providerData?.[0]?.providerId;

    if (providerId === "google.com") return "Google";
    if (providerId === "password") return "Email & Password";
    return providerId || "Unknown";
  }, [user]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!user?.email) {
      setResetError("No email address found for this account.");
      setResetMessage("");
      return;
    }

    try {
      setSendingReset(true);
      setResetError("");
      setResetMessage("");

      await sendPasswordResetEmail(auth, user.email);

      setResetMessage(`Password reset email sent to ${user.email}`);
    } catch (error: any) {
      if (error.code === "auth/missing-email") {
        setResetError("Email address is missing.");
      } else if (error.code === "auth/invalid-email") {
        setResetError("That email address is invalid.");
      } else if (error.code === "auth/too-many-requests") {
        setResetError("Too many attempts. Please try again later.");
      } else {
        setResetError("Failed to send password reset email.");
      }
    } finally {
      setSendingReset(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground px-3 py-6 md:px-5 md:py-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="font-mono text-sm text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground px-3 py-6 md:px-5 md:py-8">
        <div className="mx-auto max-w-[1100px]">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-muted">
              <User className="h-7 w-7 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">No user session found</h1>
            <p className="mt-2 text-muted-foreground">Please log in to view your profile.</p>
            <button
              onClick={() => navigate("/login")}
              className="mt-5 rounded-lg bg-primary px-4 py-2.5 font-mono text-sm text-primary-foreground transition hover:opacity-90"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const joinedDate = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : "N/A";

  const lastSignIn = user.metadata.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
    : "N/A";

  return (
    <div className="min-h-screen bg-background text-foreground px-3 py-6 md:px-5 md:py-8">
      <div className="mx-auto max-w-[1400px] space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              Account Center
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
              My Profile
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              View your account details, security information, and sign-in status.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {isPasswordUser && (
              <button
                onClick={handleForgotPassword}
                disabled={sendingReset}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 font-mono text-sm text-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LockKeyhole className="h-4 w-4" />
                {sendingReset ? "Sending..." : "Forgot Password"}
              </button>
            )}

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 font-mono text-sm text-destructive transition hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? "Signing out..." : "Logout"}
            </button>
          </div>
        </div>

        {(resetMessage || resetError) && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              resetError
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-primary/30 bg-primary/10 text-primary"
            }`}
          >
            {resetError || resetMessage}
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-col items-center text-center">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="h-24 w-24 rounded-full border-2 border-primary/20 object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary/20 bg-muted">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
              )}

              <h2 className="mt-4 text-2xl font-semibold leading-tight">
                {user.displayName || "Unnamed User"}
              </h2>

              <p className="mt-1 break-all text-sm text-muted-foreground">
                {user.email || "No email available"}
              </p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                <BadgeCheck className="h-4 w-4" />
                {user.emailVerified ? "Verified Account" : "Verification Needed"}
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-xl border border-border bg-background/60 p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  User ID
                </p>
                <p className="mt-1 break-all font-mono text-xs">{user.uid}</p>
              </div>

              <div className="rounded-xl border border-border bg-background/60 p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Provider
                </p>
                <p className="mt-1 font-medium">{providerLabel}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email Address</p>
                    <p className="mt-1 break-all font-medium">
                      {user.email || "Not available"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Verification</p>
                    <p className="mt-1 font-medium">
                      {user.emailVerified ? "Email verified" : "Not verified"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="mt-1 font-medium">{joinedDate}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Sign In</p>
                    <p className="mt-1 font-medium">{lastSignIn}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-xl font-semibold">Account Details</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Basic information connected to your authentication account.
              </p>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-background/50 p-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Display Name</p>
                      <p className="font-medium">{user.displayName || "Not set"}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background/50 p-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="break-all font-medium">{user.email || "Not set"}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background/50 p-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Provider</p>
                      <p className="font-medium">{providerLabel}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background/50 p-4">
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium">
                        {user.emailVerified ? "Active and verified" : "Pending verification"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isPasswordUser && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="text-xl font-semibold">Security</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage your password and account access.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={handleForgotPassword}
                    disabled={sendingReset}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-mono text-sm text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LockKeyhole className="h-4 w-4" />
                    {sendingReset ? "Sending reset email..." : "Send Password Reset Email"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}