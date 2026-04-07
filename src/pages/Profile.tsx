import {
  User,
  Mail,
  ShieldCheck,
  CalendarDays,
  KeyRound,
  LogOut,
  BadgeCheck,
  LockKeyhole,
  ArrowLeft,
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

  const googleProvider = useMemo(() => {
    return (
      user?.providerData?.find(
        (provider) => provider.providerId === "google.com"
      ) || null
    );
  }, [user]);

  const isPasswordUser = useMemo(() => {
    return !!user?.providerData?.some(
      (provider) => provider.providerId === "password"
    );
  }, [user]);

  const providerLabel = useMemo(() => {
    const providerIds = user?.providerData?.map((provider) => provider.providerId) || [];

    if (providerIds.includes("google.com")) return "Google";
    if (providerIds.includes("password")) return "Email & Password";
    return providerIds[0] || "Unknown";
  }, [user]);

  const profilePhoto = useMemo(() => {
    return googleProvider?.photoURL || user?.photoURL || null;
  }, [googleProvider, user]);

  const displayNameValue = useMemo(() => {
    return googleProvider?.displayName || user?.displayName || "Unnamed User";
  }, [googleProvider, user]);

  const emailValue = useMemo(() => {
    return googleProvider?.email || user?.email || "No email available";
  }, [googleProvider, user]);

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
      <div className="min-h-screen bg-background px-3 py-6 text-foreground md:px-5 md:py-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="font-mono text-sm text-muted-foreground">
              Loading profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background px-3 py-6 text-foreground md:px-5 md:py-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-muted">
              <User className="h-7 w-7 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">No user session found</h1>
            <p className="mt-2 text-muted-foreground">
              Please log in to view your profile.
            </p>
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
    <div className="min-h-screen bg-background px-3 py-6 text-foreground md:px-5 md:py-8">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-primary">
              Account Center
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
              My Profile
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              View your account details, security information, and sign-in
              status.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/Dashboard")}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Compiler
            </button>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-60"
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

        <div className="grid gap-4 xl:grid-cols-[300px_1fr]">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-col items-center text-center">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  className="h-20 w-20 rounded-full border-2 border-primary/20 object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/20 bg-muted">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              <h2 className="mt-3 text-lg font-semibold leading-tight">
                {displayNameValue}
              </h2>

              <p className="mt-1 break-all text-xs text-muted-foreground">
                {emailValue}
              </p>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
                <BadgeCheck className="h-3.5 w-3.5" />
                {user.emailVerified ? "Verified Account" : "Verification Needed"}
              </div>
            </div>

            <div className="mt-4 grid gap-2.5">
              <div className="rounded-xl border border-border bg-background/60 p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  User ID
                </p>
                <p className="mt-1 break-all font-mono text-[11px]">
                  {user.uid}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background/60 p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Provider
                </p>
                <p className="mt-1 text-sm font-medium">{providerLabel}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Email Address</p>
                    <p className="mt-1 break-all text-sm font-medium">
                      {emailValue}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Verification</p>
                    <p className="mt-1 text-sm font-medium">
                      {user.emailVerified ? "Email verified" : "Not verified"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="mt-1 text-sm font-medium">{joinedDate}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Sign In</p>
                    <p className="mt-1 text-sm font-medium">{lastSignIn}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <h3 className="text-base font-semibold">Account Details</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Basic information connected to your authentication account.
              </p>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-background/50 p-3.5">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Display Name
                      </p>
                      <p className="text-sm font-medium">{displayNameValue}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background/50 p-3.5">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="break-all text-sm font-medium">
                        {emailValue}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background/50 p-3.5">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Provider</p>
                      <p className="text-sm font-medium">{providerLabel}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background/50 p-3.5">
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-sm font-medium">
                        {user.emailVerified
                          ? "Active and verified"
                          : "Pending verification"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isPasswordUser && (
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <h3 className="text-base font-semibold">Security</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage your password and account access.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={handleForgotPassword}
                    disabled={sendingReset}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LockKeyhole className="h-4 w-4" />
                    {sendingReset
                      ? "Sending reset email..."
                      : "Send Password Reset Email"}
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