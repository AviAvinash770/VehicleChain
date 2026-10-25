import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, User, Mail, Lock, Phone, Wallet, AlertCircle, ArrowRight } from "lucide-react";
import { NumberPlateBackground } from "../components/NumberPlateBackground";
import { useAuth } from "../contexts/AuthContext";
import { useWallet } from "../contexts/WalletContext";

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { account, connectWallet } = useWallet();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("OWNER");
  const [phone, setPhone] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAutoFillWallet = async () => {
    if (account) {
      setWalletAddress(account);
    } else {
      const connected = await connectWallet();
      if (connected) setWalletAddress(connected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in required fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const user = await register({
        name,
        email,
        password,
        role,
        phone,
        walletAddress: walletAddress || account || undefined,
        department: role === "AUTHORITY" ? department : undefined,
      });

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
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-[#070a12] overflow-hidden">
      <NumberPlateBackground
        registrationNumber="AP 39 AB 2026"
        opacity={0.16}
        variant="silver"
        className="pointer-events-none"
      />

      <div className="relative z-10 w-full max-w-lg bg-[#0c121e]/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-3 shadow-glow">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white font-sans">Create an Account</h2>
          <p className="text-xs text-slate-400 mt-1">
            Register your cryptographic identity on VehicleChain
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Your Role
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setRole("OWNER")}
                className={`py-1.5 rounded-lg transition-all ${
                  role === "OWNER"
                    ? "bg-cyan-500 text-black shadow-glow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Owner
              </button>
              <button
                type="button"
                onClick={() => setRole("BUYER")}
                className={`py-1.5 rounded-lg transition-all ${
                  role === "BUYER"
                    ? "bg-cyan-500 text-black shadow-glow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Buyer
              </button>
              <button
                type="button"
                onClick={() => setRole("AUTHORITY")}
                className={`py-1.5 rounded-lg transition-all ${
                  role === "AUTHORITY"
                    ? "bg-cyan-500 text-black shadow-glow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                RTO
              </button>
              <button
                type="button"
                onClick={() => setRole("VERIFIER")}
                className={`py-1.5 rounded-lg transition-all ${
                  role === "VERIFIER"
                    ? "bg-cyan-500 text-black shadow-glow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Verifier
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full bg-slate-950/90 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <User className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@domain.com"
                  className="w-full bg-slate-950/90 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <Mail className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-950/90 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <Lock className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-950/90 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <Phone className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
              </div>
            </div>
          </div>

          {role === "AUTHORITY" && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                RTO Division / Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. RTO North Zone, New Delhi"
                className="w-full bg-slate-950/90 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          )}

          {/* Wallet Address Input with MetaMask auto-fill */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Ethereum Wallet Address (Optional)
              </label>
              <button
                type="button"
                onClick={handleAutoFillWallet}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
              >
                <Wallet className="w-3 h-3" />
                Auto-fill from MetaMask
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={walletAddress || account || ""}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-slate-950/90 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 pl-9 font-mono text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <Wallet className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs tracking-wider uppercase transition-all shadow-glow flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {loading ? "Registering..." : "Create Account"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Already registered?{" "}
          <Link to="/login" className="text-cyan-400 hover:underline font-semibold">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};
