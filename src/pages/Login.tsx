// src/pages/Login.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, loginWithGoogle, logoutUser } from "../firebase/auth";
import { getUserProfile } from "../lib/userService";

type LoginForm = {
  email: string;
  password: string;
};

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Updates form values when the user types.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /**
   * Validates login input before submitting.
   */
  const validate = () => {
    if (!form.email.trim() || !form.password.trim()) {
      return "Email and password are required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return "Please enter a valid email address.";
    }

    if (form.password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    return "";
  };

  /**
   * Redirect user after login based on Firestore role.
   * - admin -> /admin
   * - user  -> /dashboard
   */
  const redirectByRole = async (uid: string) => {
    const profile = await getUserProfile(uid);

    if (profile?.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  /**
   * Handles email/password login.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    setError(validationError);

    if (validationError) return;

    try {
      setLoading(true);

      const user = await loginUser(form.email, form.password);

      // Block login until the email has been verified
      if (!user.emailVerified) {
        await logoutUser();
        setError("Please verify your email before logging in.");
        return;
      }

      await redirectByRole(user.uid);
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setError("That email is already in use.");
      } else if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (error.code === "auth/user-not-found") {
        setError("No account found with that email.");
      } else if (error.code === "auth/wrong-password") {
        setError("Invalid email or password.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles Google login.
   * Google users are redirected based on their Firestore role too.
   */
  const handleGoogleLogin = async () => {
    try {
      setError("");
      setGoogleLoading(true);

      const user = await loginWithGoogle();
      await redirectByRole(user.uid);
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        setError("Google sign-in was closed before completion.");
      } else if (error.code === "auth/popup-blocked") {
        setError("Popup was blocked. Please allow popups and try again.");
      } else if (error.code === "auth/cancelled-popup-request") {
        setError("Google sign-in was cancelled. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#140406] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,85,0.12),transparent_35%)]" />
      <div className="absolute top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-pink-600/10 blur-[120px]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 py-12">
        <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-2">
          <section className="hidden lg:flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center rounded-xl border border-red-900/40 bg-white/5 px-4 py-2 font-mono text-sm text-gray-300">
              <span className="mr-2 text-pink-500">$</span>
              secure-auth --login
            </div>

            <h1 className="font-mono text-6xl font-bold leading-tight">
              Welcome
              <span className="block text-pink-500 drop-shadow-[0_0_18px_rgba(255,45,85,0.8)]">
                Back.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-lg text-gray-400">
              Sign in to access your dashboard, coding workspace, and future
              CyberCompile features.
            </p>

            <div className="mt-10 rounded-2xl border border-red-900/40 bg-[#221013]/80 shadow-[0_0_40px_rgba(0,0,0,0.25)]">
              <div className="flex items-center gap-2 border-b border-red-900/30 px-5 py-4">
                <span className="h-3 w-3 rounded-full bg-red-500/70" />
                <span className="h-3 w-3 rounded-full bg-orange-400/70" />
                <span className="h-3 w-3 rounded-full bg-pink-500/70" />
                <span className="ml-4 font-mono text-sm text-gray-400">
                  auth/login.tsx
                </span>
              </div>

              <div className="px-5 py-6 font-mono text-sm leading-8 text-gray-300">
                <p>
                  <span className="text-orange-400">const</span>{" "}
                  <span className="text-pink-500">status</span> ={" "}
                  <span className="text-white">"awaiting_login"</span>;
                </p>
                <p>
                  <span className="text-orange-400">const</span>{" "}
                  <span className="text-pink-500">provider</span> ={" "}
                  <span className="text-white">"email | google"</span>;
                </p>
                <p className="text-gray-500">
                  {"// enter credentials to continue"}
                </p>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-2xl border border-red-900/40 bg-[#221013]/90 p-8 shadow-[0_0_35px_rgba(255,45,85,0.08)]">
              <div className="mb-6">
                <div className="mb-3 inline-block rounded-md border border-pink-500/30 bg-pink-500/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-pink-400">
                  secure access
                </div>
                <h2 className="font-mono text-3xl font-bold text-white">
                  Login
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  Continue with email/password or Google.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-red-900/40 bg-[#16090b] px-4 py-3 text-sm font-medium text-white transition hover:border-pink-500/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="text-base">G</span>
                {googleLoading ? "Signing in with Google..." : "Continue with Google"}
              </button>

              <div className="mb-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-red-900/30" />
                <span className="text-xs uppercase tracking-wider text-gray-500">
                  or
                </span>
                <div className="h-px flex-1 bg-red-900/30" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block font-mono text-sm text-gray-300">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-red-900/40 bg-[#16090b] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-pink-500 focus:shadow-[0_0_0_3px_rgba(255,45,85,0.12)]"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-mono text-sm text-gray-300">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-red-900/40 bg-[#16090b] px-4 py-3 pr-12 text-white outline-none transition placeholder:text-gray-500 focus:border-pink-500 focus:shadow-[0_0_0_3px_rgba(255,45,85,0.12)]"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center px-4 text-sm text-gray-400 hover:text-pink-400"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-pink-500 px-4 py-3 font-mono text-lg font-semibold text-white transition hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(255,45,85,0.4)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Signing In..." : "Login"}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-400">
                Don’t have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-pink-400 hover:text-pink-300"
                >
                  Register
                </Link>
              </div>

              <div className="mt-4 text-center text-sm">
                <Link to="/" className="text-gray-500 hover:text-gray-300">
                  Back to Home
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}