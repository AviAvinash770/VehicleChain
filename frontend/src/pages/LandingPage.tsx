import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  Search,
  ArrowRight,
  Car,
  FileCheck2,
  Lock,
  Layers,
  QrCode,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { NumberPlateBackground } from "../components/NumberPlateBackground";
import { NumberPlateBadge } from "../components/NumberPlateBadge";
import { useWallet } from "../contexts/WalletContext";
import { api } from "../services/api";

export const LandingPage: React.FC = () => {
  const { account, connectWallet } = useWallet();
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    totalVehicles: 1,
    activeVehicles: 1,
    suspendedVehicles: 0,
    completedTransfers: 0,
    blockchainNetwork: "Hardhat Local / Ethereum Sepolia",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/public/stats");
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch {}
    };
    fetchStats();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#070a12] text-slate-100 flex flex-col justify-between overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-28 flex flex-col items-center justify-center text-center px-4">
        {/* Number Plate Background Visual Motif */}
        <NumberPlateBackground
          registrationNumber="AP 39 AB 2026"
          opacity={0.95}
          variant="silver"
          className="top-8 sm:top-10"
        />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          {/* Top Project Tag */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-semibold tracking-wide shadow-glow"
          >
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Academic Final-Year Prototype • EVM Smart Contracts</span>
          </motion.div>

          {/* Project Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight font-sans text-white"
          >
            VEHICLE<span className="text-cyan-400">CHAIN</span>
          </motion.h1>

          {/* Dedicated clearance spacer so the central number plate is completely unobstructed */}
          <div className="h-24 sm:h-32 md:h-44 w-full pointer-events-none" />

          {/* Primary Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm tracking-wide shadow-glow transition-all active:scale-95 flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/verify"
              className="px-6 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm tracking-wide transition-all active:scale-95 flex items-center gap-2 hover:border-cyan-500/50"
            >
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Verify Vehicle</span>
            </Link>

            {!account ? (
              <button
                onClick={connectWallet}
                className="px-6 py-3 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-cyan-300 border border-cyan-800/80 font-mono text-xs font-semibold tracking-wide transition-all active:scale-95 flex items-center gap-2 shadow-sm"
              >
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>Connect MetaMask</span>
              </button>
            ) : (
              <div className="px-5 py-3 rounded-xl bg-slate-950 border border-emerald-500/50 text-emerald-300 font-mono text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
              </div>
            )}
          </motion.div>

          {/* Quick Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="pt-6 max-w-md mx-auto w-full"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/verify/${encodeURIComponent(searchQuery.trim())}`;
                }
              }}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Registration No (e.g., AP 39 AB 2026)"
                className="w-full bg-[#0c1322]/90 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-4 py-3 pl-11 text-xs text-white placeholder-slate-500 focus:outline-none shadow-lg"
              />
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-2 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-lg transition-colors"
              >
                Search
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Live Blockchain Metrics Bar */}
      <section className="border-y border-slate-800/80 bg-[#090d17]/80 backdrop-blur-md py-6 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">
              {stats.totalVehicles}
            </p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">
              Registered Vehicles
            </p>
          </div>
          <div className="p-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
              {stats.activeVehicles}
            </p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">
              Active on Chain
            </p>
          </div>
          <div className="p-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono">
              {stats.completedTransfers}
            </p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">
              Completed Transfers
            </p>
          </div>
          <div className="p-3">
            <p className="text-xs sm:text-sm font-bold text-slate-200 font-mono truncate">
              {stats.blockchainNetwork}
            </p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">
              EVM Consensus Network
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Core Workflow Cards */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-bold">
            Tamper-Proof Architecture
          </h2>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Complete Registration to Transfer Lifecycle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Authority Registration */}
          <div className="relative p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-cyan-500/40 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-105 transition-transform">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">1. Authority Registration</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Authorized RTO officials verify vehicle documents, compute SHA-256 integrity hashes, upload to IPFS, and mint the vehicle into the smart contract with unique VIN cryptography.
            </p>
          </div>

          {/* Card 2: 3-Way Transfer State Machine */}
          <div className="relative p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-cyan-500/40 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">2. Mutual Transfer Agreement</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The current owner initiates transfer to the buyer wallet. The buyer verifies vehicle specifications and signs acceptance. RTO Authority grants final approval before on-chain ownership updates.
            </p>
          </div>

          {/* Card 3: Cryptographic QR Verification */}
          <div className="relative p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-cyan-500/40 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-105 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">3. Instant Public Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Anyone can scan the vehicle QR code or enter registration number to verify active status, ownership timeline, and test document hashes against the blockchain record without privacy leaks.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Vehicle Plate Showcase */}
      <section className="py-12 px-4 max-w-4xl mx-auto text-center">
        <div className="p-8 rounded-2xl bg-gradient-to-b from-[#0c1220] to-[#080d16] border border-slate-800 shadow-2xl">
          <p className="text-xs uppercase font-mono text-cyan-400 mb-4 tracking-wider">
            Verified Specimen Vehicle
          </p>
          <div className="flex justify-center mb-6">
            <NumberPlateBadge registrationNumber="AP 39 AB 2026" size="lg" variant="silver" />
          </div>
          <p className="text-sm text-slate-300 font-semibold">
            Tata Nexon EV Empowered Plus (2024)
          </p>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            ID: VEH-2026-000001 • Status: ACTIVE • Confirmed On-Chain
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/verify/AP 39 AB 2026"
              className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-glow"
            >
              Inspect Public Verification Record
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
