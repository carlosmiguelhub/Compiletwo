import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginWithGoogle, registerUser } from "../firebase/auth";
import { createUserProfile } from "../lib/userService";
import { sendEmailVerification } from "firebase/auth";

type RegisterForm = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * Updates the form state whenever the user types
   * into one of the input fields.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /**
   * Validates the registration form before submission.
   * Returns an error message if invalid, otherwise an empty string.
   */
  const validate = () => {
    if (
      !form.username.trim() ||
      !form.email.trim() ||
      !form.password.trim() ||
      !form.confirmPassword.trim()
    ) {
      return "All fields are required.";
    }

    if (form.username.trim().length < 3) {
      return "Username must be at least 3 characters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return "Please enter a valid email address.";
    }

    if (form.password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (form.password !== form.confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  };

  /**
   * Handles email/password registration.
   *
   * Flow:
   * 1. Validate form
   * 2. Create Firebase Auth account
   * 3. Send verification email
   * 4. Create Firestore user profile
   * 5. Redirect user to login
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      /**
       * registerUser must return the full userCredential
       * so we can access userCredential.user here.
       */
      const userCredential = await registerUser(
        form.username,
        form.email,
        form.password
      );

      /**
       * Send verification email to the newly created user.
       */
      await sendEmailVerification(userCredential.user);

      /**
       * Create the Firestore user profile.
       * New users start with role: "user".
       */
      await createUserProfile(
        userCredential.user.uid,
        userCredential.user.email || "",
        form.username
      );

      setSuccess(
        "Account created successfully. Please check your email and verify your account before logging in."
      );

      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setError("That email is already in use.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles Google sign-up flow.
   * The Google auth helper should create a Firestore profile
   * for first-time Google users.
   */
  const handleGoogleRegister = async () => {
    try {
      setError("");
      setSuccess("");
      setGoogleLoading(true);

      await loginWithGoogle();
      navigate("/dashboard");
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        setError("Google sign-up was closed before completion.");
      } else if (error.code === "auth/popup-blocked") {
        setError("Popup was blocked. Please allow popups and try again.");
      } else if (error.code === "auth/cancelled-popup-request") {
        setError("Google sign-up was cancelled. Please try again.");
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
              secure-auth --register
            </div>

            <h1 className="font-mono text-6xl font-bold leading-tight">
              Create
              <span className="block text-pink-500 drop-shadow-[0_0_18px_rgba(255,45,85,0.8)]">
                Account.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-lg text-gray-400">
              Start your CyberCompile journey with secure authentication and a
              coding-first interface.
            </p>

            <div className="mt-10 rounded-2xl border border-red-900/40 bg-[#221013]/80 shadow-[0_0_40px_rgba(0,0,0,0.25)]">
              <div className="flex items-center gap-2 border-b border-red-900/30 px-5 py-4">
                <span className="h-3 w-3 rounded-full bg-red-500/70" />
                <span className="h-3 w-3 rounded-full bg-orange-400/70" />
                <span className="h-3 w-3 rounded-full bg-pink-500/70" />
                <span className="ml-4 font-mono text-sm text-gray-400">
                  auth/register.tsx
                </span>
              </div>

              <div className="px-5 py-6 font-mono text-sm leading-8 text-gray-300">
                <p>
                  <span className="text-orange-400">const</span>{" "}
                  <span className="text-pink-500">status</span> ={" "}
                  <span className="text-white">"creating_account"</span>;
                </p>
                <p>
                  <span className="text-orange-400">const</span>{" "}
                  <span className="text-pink-500">provider</span> ={" "}
                  <span className="text-white">"email | google"</span>;
                </p>
                <p className="text-gray-500">
                  {"// verify email after registration"}
                </p>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-2xl border border-red-900/40 bg-[#221013]/90 p-8 shadow-[0_0_35px_rgba(255,45,85,0.08)]">
              <div className="mb-6">
                <div className="mb-3 inline-block rounded-md border border-pink-500/30 bg-pink-500/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-pink-400">
                  new developer
                </div>
                <h2 className="font-mono text-3xl font-bold text-white">
                  Register
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  Create your account with email/password or Google.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleRegister}
                disabled={googleLoading}
                className="mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-red-900/40 bg-[#16090b] px-4 py-3 text-sm font-medium text-white transition hover:border-pink-500/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="text-base">G</span>
                {googleLoading
                  ? "Signing up with Google..."
                  : "Continue with Google"}
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
                    Username
                  </label>
                  <input
                    name="username"
                    type="text"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="your_username"
                    className="w-full rounded-xl border border-red-900/40 bg-[#16090b] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-pink-500 focus:shadow-[0_0_0_3px_rgba(255,45,85,0.12)]"
                  />
                </div>

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

                <div>
                  <label className="mb-2 block font-mono text-sm text-gray-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-red-900/40 bg-[#16090b] px-4 py-3 pr-12 text-white outline-none transition placeholder:text-gray-500 focus:border-pink-500 focus:shadow-[0_0_0_3px_rgba(255,45,85,0.12)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center px-4 text-sm text-gray-400 hover:text-pink-400"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-pink-500 px-4 py-3 font-mono text-lg font-semibold text-white transition hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(255,45,85,0.4)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-pink-400 hover:text-pink-300"
                >
                  Login
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