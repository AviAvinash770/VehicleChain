import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, UserCheck } from "lucide-react";
import { NumberPlateBackground } from "../components/NumberPlateBackground";
import { useAuth } from "../contexts/AuthContext";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const user = await login(email, password);

      // Role-based routing
      if (user.role === "AUTHORITY") {
        navigate("/dashboard/authority");
      } else if (user.role === "OWNER") {
        navigate("/dashboard/owner");
      } else if (user.role === "BUYER") {
        navigate("/dashboard/buyer");
      } else {
        navigate("/verify");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password@123");
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-[#070a12] overflow-hidden">
      {/* Background Number Plate visual element */}
      <NumberPlateBackground
        registrationNumber="AP 39 AB 2026"
        opacity={0.16}
        variant="silver"
        className="pointer-events-none"
      />

      <div className="relative z-10 w-full max-w-md bg-[#0c121e]/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-3 shadow-glow">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white font-sans">Sign in to VehicleChain</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your role-specific dashboard and vehicle credentials
          </p>
        </div>

        {/* Quick Demo Fill Buttons for Presentation/Review */}
        <div className="mb-6 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            Quick Demo Accounts (1-Click Fill)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemo("authority@vehiclechain.gov.in")}
              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700 text-left transition-colors"
            >
              <span className="font-semibold block text-[11px] text-white">RTO Authority</span>
              <span className="text-[9px] text-slate-400 font-mono">authority@...</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("owner@vehiclechain.gov.in")}
              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700 text-left transition-colors"
            >
              <span className="font-semibold block text-[11px] text-white">Current Owner</span>
              <span className="text-[9px] text-slate-400 font-mono">owner@...</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("buyer@vehiclechain.gov.in")}
              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700 text-left transition-colors"
            >
              <span className="font-semibold block text-[11px] text-white">Prospective Buyer</span>
              <span className="text-[9px] text-slate-400 font-mono">buyer@...</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("verifier@vehiclechain.gov.in")}
              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700 text-left transition-colors"
            >
              <span className="font-semibold block text-[11px] text-white">Public Verifier</span>
              <span className="text-[9px] text-slate-400 font-mono">verifier@...</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Official Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@vehiclechain.gov.in"
                className="w-full bg-slate-950/90 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-slate-950/90 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs tracking-wider uppercase transition-all shadow-glow flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? "Authenticating..." : "Sign In"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-cyan-400 hover:underline font-semibold">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};
