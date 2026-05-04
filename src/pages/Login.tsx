import { useState, FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Bike, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || "/dashboard";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    const result = await login(email.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || "Login failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 relative">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-kolkata-yellow/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-kolkata-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="glass-card rounded-[2.5rem] overflow-hidden">
          {/* Yellow top bar */}
          <div className="h-2 bg-kolkata-yellow w-full" />

          <div className="p-10">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 mb-10 group w-fit">
              <div className="bg-kolkata-yellow p-2 rounded-lg group-hover:rotate-12 transition-transform">
                <Bike className="w-5 h-5 text-kolkata-black" />
              </div>
              <span className="font-display text-xl font-bold tracking-tighter">
                RIDE<span className="text-kolkata-yellow">KOLKATA</span>
              </span>
            </Link>

            <h1 className="text-3xl font-display font-black mb-2 tracking-tight">Welcome back.</h1>
            <p className="text-gray-500 mb-10">Sign in to continue your ride.</p>

            {/* Error banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={cn(
                      "w-full bg-gray-50 border rounded-2xl py-4 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kolkata-yellow/50 focus:border-kolkata-yellow transition-all",
                      error ? "border-red-300" : "border-gray-200"
                    )}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={cn(
                      "w-full bg-gray-50 border rounded-2xl py-4 pl-11 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kolkata-yellow/50 focus:border-kolkata-yellow transition-all",
                      error ? "border-red-300" : "border-gray-200"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-kolkata-black" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Demo credentials hint */}
            <div className="mt-6 p-4 bg-kolkata-yellow/10 rounded-2xl border border-kolkata-yellow/20">
              <p className="text-xs font-bold text-kolkata-black/60 uppercase tracking-widest mb-1">Demo Account</p>
              <p className="text-sm font-medium text-kolkata-black/80">
                Email: <span className="font-bold">demo@ridekolkata.in</span><br />
                Password: <span className="font-bold">demo1234</span>
              </p>
            </div>

            <p className="text-center text-sm text-gray-500 mt-8">
              Don't have an account?{" "}
              <Link to="/register" className="text-kolkata-black font-bold hover:text-kolkata-accent transition-colors underline underline-offset-4">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
