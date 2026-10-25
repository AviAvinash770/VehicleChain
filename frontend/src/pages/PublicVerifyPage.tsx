import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  Car,
  QrCode,
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Upload,
} from "lucide-react";
import { NumberPlateBadge } from "../components/NumberPlateBadge";
import { StatusPill } from "../components/StatusPill";
import { api } from "../services/api";

export const PublicVerifyPage: React.FC = () => {
  const { query: urlQuery } = useParams<{ query?: string }>();
  const [query, setQuery] = useState(urlQuery || "AP 39 AB 2026");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Document verification within public page
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docVerifying, setDocVerifying] = useState(false);
  const [docResult, setDocResult] = useState<any | null>(null);

  useEffect(() => {
    if (urlQuery) {
      handleSearch(urlQuery);
    } else {
      handleSearch("AP 39 AB 2026");
    }
  }, [urlQuery]);

  const handleSearch = async (searchTarget?: string) => {
    const q = searchTarget || query;
    if (!q.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setDocResult(null);
      const res = await api.get(`/public/verify/${encodeURIComponent(q.trim())}`);
      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Vehicle not found in registry.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDocument = async () => {
    if (!docFile || !result) return;
    try {
      setDocVerifying(true);
      const formData = new FormData();
      formData.append("vehicleId", result.vehicleId);
      formData.append("document", docFile);

      const res = await api.post("/public/verify-hash", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setDocResult(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Document verification failed");
    } finally {
      setDocVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Search Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Public National Vehicle Blockchain Verification Portal</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Verify Vehicle Authenticity</h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Instant cryptographic validation of vehicle status, ownership history, and document integrity hashes without privacy leaks.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="max-w-md mx-auto flex items-center gap-2 pt-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. AP 39 AB 2026 or DL 1C A 6207"
              className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-3 pl-10 text-xs font-bold text-white uppercase focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-xl shadow-glow transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Verify"}
          </button>
        </form>

        {/* Quick Sample Search Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
          <span>Try sample records:</span>
          <button
            onClick={() => {
              setQuery("AP 39 AB 2026");
              handleSearch("AP 39 AB 2026");
            }}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono"
          >
            AP 39 AB 2026
          </button>
          <button
            onClick={() => {
              setQuery("VEH-2026-000001");
              handleSearch("VEH-2026-000001");
            }}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono"
          >
            VEH-2026-000001
          </button>
          <Link
            to="/scan"
            className="px-2.5 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 flex items-center gap-1 font-semibold"
          >
            <QrCode className="w-3 h-3" />
            Scan QR
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-6 rounded-2xl bg-red-950/40 border border-red-800/80 text-center space-y-2">
          <ShieldAlert className="w-8 h-8 text-red-400 mx-auto" />
          <h3 className="font-bold text-red-300 text-base">Unverified Record</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">{error}</p>
        </div>
      )}

      {/* Verified Record Display */}
      {result && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0c121e] border border-cyan-500/40 shadow-2xl space-y-6">
          {/* Top Banner with Plate */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <NumberPlateBadge registrationNumber={result.registrationNumber} size="lg" variant="silver" />
              <div>
                <h2 className="text-xl font-bold text-white">
                  {result.manufacturer} {result.model}
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Vehicle ID: {result.vehicleId} • {result.year} • {result.vehicleType}
                </p>
              </div>
            </div>

            <StatusPill status={result.status} />
          </div>

          {/* Privacy Protection Notice */}
          <div className="p-3 bg-cyan-950/30 border border-cyan-800/50 rounded-xl text-[11px] text-cyan-300/90 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>
              Public Privacy Protected: Confidential personal identity, contact numbers, and home addresses are cryptographically withheld from public query responses.
            </span>
          </div>

          {/* Verification Details Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[11px]">Authorized Current Owner:</span>
              <span className="text-slate-200 font-bold">{result.currentOwnerMasked}</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[11px]">Genesis Registration Date:</span>
              <span className="text-slate-200">
                {new Date(result.registrationDate).toLocaleDateString()}
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[11px]">Blockchain Transaction Hash:</span>
              <span className="text-emerald-400 break-all">{result.registrationTxHash}</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[11px]">Initial Registration Doc SHA-256:</span>
              <span className="text-cyan-300 break-all">{result.initialDocHash}</span>
            </div>
          </div>

          {/* Ownership History Events */}
          {result.ownershipHistory && result.ownershipHistory.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h3 className="text-xs uppercase font-mono tracking-wider text-slate-400">
                Public Ownership Transfer Chain ({result.ownershipHistory.length} Record/s)
              </h3>
              <div className="space-y-2">
                {result.ownershipHistory.map((h: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase text-cyan-400">
                        {idx === 0 ? "Initial Owner" : `Transfer #${idx}`}
                      </span>
                      <p className="font-mono text-slate-300 mt-0.5">Wallet: {h.owner}</p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      {new Date(h.transferTimestamp * 1000).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Public Document Integrity Test Tool */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h3 className="text-xs uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
              Verify a Physical Document Copy (Tamper Detection)
            </h3>
            <p className="text-xs text-slate-400">
              Upload a scanned copy of your RC or transfer deed to verify if its content matches the registered hash on the blockchain.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className="flex-1 w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center gap-2 cursor-pointer hover:border-slate-700">
                <Upload className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span className="truncate">{docFile ? docFile.name : "Select document file"}</span>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setDocFile(e.target.files[0]);
                      setDocResult(null);
                    }
                  }}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={handleVerifyDocument}
                disabled={!docFile || docVerifying}
                className="w-full sm:w-auto px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {docVerifying ? "Verifying..." : "Check Hash"}
              </button>
            </div>

            {docResult && (
              <div
                className={`p-4 rounded-xl border text-xs ${
                  docResult.verified
                    ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                    : "bg-red-950/40 border-red-500/50 text-red-300"
                }`}
              >
                <p className="font-bold flex items-center gap-1.5">
                  {docResult.verified ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  {docResult.message}
                </p>
                <p className="font-mono text-[10px] text-slate-400 mt-1 break-all">
                  Computed SHA-256: {docResult.calculatedHash}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
