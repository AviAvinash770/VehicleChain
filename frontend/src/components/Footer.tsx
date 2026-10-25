import React from "react";
import { Shield, Lock, FileCode, CheckCircle2 } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-900 bg-[#04060a] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Shield className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="font-bold text-white text-lg font-sans">
              VEHICLE<span className="text-cyan-400">CHAIN</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Blockchain-Based Vehicle Ownership Transfer and Registration System. An academic final-year project demonstration for secure, decentralized vehicular registry.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
            System Pillars
          </h4>
          <ul className="text-xs space-y-2">
            <li className="flex items-center gap-2 text-slate-400">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              Immutable Smart Contracts
            </li>
            <li className="flex items-center gap-2 text-slate-400">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              Cryptographic SHA-256 Hashing
            </li>
            <li className="flex items-center gap-2 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              Decentralized IPFS Storage
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
            Quick Verification
          </h4>
          <ul className="text-xs space-y-2">
            <li>
              <a href="/verify" className="hover:text-cyan-400 transition-colors">
                Public Vehicle Registry Search
              </a>
            </li>
            <li>
              <a href="/verify?demo=AP 39 AB 2026" className="hover:text-cyan-400 transition-colors">
                Verify Sample Plate AP 39 AB 2026
              </a>
            </li>
            <li>
              <a href="/scan" className="hover:text-cyan-400 transition-colors">
                Scan Vehicle QR Code
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
            Compliance Note
          </h4>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
            <p>
              Academic Research Prototype. Not an official replacement for government Vahan / Sarathi RTO registries. Designed for final-year engineering defense.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
        <p>© 2026 VehicleChain Project. Built with Solidity, React, Node.js & Ethers.js.</p>
        <p className="mt-2 sm:mt-0 font-mono text-cyan-500/80">EVM Network: Hardhat (31337) / Sepolia</p>
      </div>
    </footer>
  );
};
