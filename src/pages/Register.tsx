import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Bike, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
  const labels = ["", "Weak", "Fair", "Strong"];

  if (!password) return null;

  return (
    <div className="flex flex-col gap-2 mt-1">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all duration-300", i < score ? colors[score] : "bg-gray-200")} />
        ))}
        <span className="text-xs font-bold text-gray-500 ml-1 w-12">{labels[score]}</span>
      </div>
      <div className="flex gap-3 flex-wrap">
        {checks.map((c) => (
          <span key={c.label} className={cn("text-xs font-medium flex items-center gap-1", c.ok ? "text-green-600" : "text-gray-400")}>
            <CheckCircle2 className={cn("w-3 h-3", c.ok ? "opacity-100" : "opacity-30")} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    if (!name.trim()) return "Please enter your full name.";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return "Please enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirm) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError("");
    setIsSubmitting(true);
    const result = await register(name.trim(), email.trim(), password, phone.trim() || undefined);
    setIsSubmitting(false);
    if (result.success) {
      navigate("/dashboard", { replace: true });
    } else {
      setError(result.error || "Registration failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 relative">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-kolkata-yellow/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-kolkata-accent/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card rounded-[2.5rem] overflow-hidden">
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

            <h1 className="text-3xl font-display font-black mb-2 tracking-tight">Join the ride.</h1>
            <p className="text-gray-500 mb-10">Create your free account in seconds.</p>

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
              {/* Name */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sanju Ghorai"
                    autoComplete="name"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kolkata-yellow/50 focus:border-kolkata-yellow transition-all"
                  />
                </div>
              </div>

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
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kolkata-yellow/50 focus:border-kolkata-yellow transition-all"
                  />
                </div>
              </div>

              {/* Phone (optional) */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Phone <span className="text-gray-300 normal-case font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kolkata-yellow/50 focus:border-kolkata-yellow transition-all"
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
                    autoComplete="new-password"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-11 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kolkata-yellow/50 focus:border-kolkata-yellow transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={cn(
                      "w-full bg-gray-50 border rounded-2xl py-4 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kolkata-yellow/50 focus:border-kolkata-yellow transition-all",
                      confirm && confirm !== password ? "border-red-300" : "border-gray-200"
                    )}
                  />
                </div>
                {confirm && confirm !== password && (
                  <p className="text-xs text-red-500 font-medium">Passwords don't match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-kolkata-black" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-8">
              Already have an account?{" "}
              <Link to="/login" className="text-kolkata-black font-bold hover:text-kolkata-accent transition-colors underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
