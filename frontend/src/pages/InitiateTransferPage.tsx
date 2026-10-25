import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FileCheck2,
  Car,
  Upload,
  FileText,
  AlertCircle,
  ArrowRight,
  Shield,
  Wallet,
  CheckCircle2,
} from "lucide-react";
import { NumberPlateBadge } from "../components/NumberPlateBadge";
import { StatusPill } from "../components/StatusPill";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import { Vehicle } from "../types";

export const InitiateTransferPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get("vehicleId");

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(preselectedId || "");
  const [buyerWallet, setBuyerWallet] = useState("0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc"); // Default demo buyer #2
  const [buyerEmail, setBuyerEmail] = useState("buyer@vehiclechain.gov.in");
  const [buyerName, setBuyerName] = useState("Pooja Verma");
  const [salePrice, setSalePrice] = useState("950000");
  const [agreementDate, setAgreementDate] = useState(new Date().toISOString().split("T")[0]);
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOwnerVehicles();
  }, []);

  const fetchOwnerVehicles = async () => {
    try {
      const res = await api.get("/vehicles");
      if (res.data.success) {
        setVehicles(res.data.vehicles);
        if (!selectedVehicleId && res.data.vehicles.length > 0) {
          setSelectedVehicleId(res.data.vehicles[0].vehicleId);
        }
      }
    } catch {}
  };

  const selectedVehicle = vehicles.find((v) => v.vehicleId === selectedVehicleId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId || !buyerWallet) {
      setError("Please select a vehicle and enter the buyer wallet address");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("vehicleId", selectedVehicleId.trim().toUpperCase());
      formData.append("buyerWallet", buyerWallet.trim().toLowerCase());
      if (buyerEmail) formData.append("buyerEmail", buyerEmail.trim().toLowerCase());
      if (buyerName) formData.append("buyerName", buyerName.trim());
      if (salePrice) formData.append("salePrice", salePrice);
      if (agreementDate) formData.append("agreementDate", agreementDate);
      if (file) formData.append("agreement", file);

      const res = await api.post("/transfers/initiate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        navigate(`/transfers/${res.data.transferRequest._id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to initiate transfer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0c1322] via-[#090d18] to-[#0c1322] border border-slate-800 shadow-xl">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileCheck2 className="w-6 h-6 text-amber-400" />
          Initiate Vehicle Ownership Transfer
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Begin cryptographic ownership handover. Requires buyer acceptance followed by RTO Authority verification.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vehicle Selection */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <label className="block text-xs font-semibold text-slate-300">
            Select Vehicle to Transfer
          </label>

          {vehicles.length === 0 ? (
            <p className="text-xs text-slate-500">No active vehicles available in your garage to transfer.</p>
          ) : (
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
            >
              {vehicles.map((v) => (
                <option key={v.vehicleId} value={v.vehicleId}>
                  {v.registrationNumber} — {v.manufacturer} {v.model} ({v.vehicleId})
                </option>
              ))}
            </select>
          )}

          {selectedVehicle && (
            <div className="p-4 rounded-xl bg-black/40 border border-slate-800 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">
                  {selectedVehicle.manufacturer} {selectedVehicle.model} ({selectedVehicle.year})
                </p>
                <p className="text-xs text-slate-400 font-mono">VIN: {selectedVehicle.vin}</p>
              </div>
              <div className="flex items-center gap-3">
                <NumberPlateBadge
                  registrationNumber={selectedVehicle.registrationNumber}
                  size="sm"
                />
                <StatusPill status={selectedVehicle.status} />
              </div>
            </div>
          )}
        </div>

        {/* Buyer Information */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Wallet className="w-4 h-4 text-cyan-400" />
            Designated Buyer Information
          </h2>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Buyer Ethereum Wallet Address (Mandatory)
              </label>
              <button
                type="button"
                onClick={() => setBuyerWallet("0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc")}
                className="text-[11px] text-cyan-400 hover:underline font-mono"
              >
                Use Demo Buyer Account
              </button>
            </div>
            <input
              type="text"
              value={buyerWallet}
              onChange={(e) => setBuyerWallet(e.target.value)}
              required
              placeholder="0x..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Buyer Name</label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="e.g. Pooja Verma"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Buyer Email</label>
              <input
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                placeholder="buyer@domain.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Agreed Sale Price (₹ INR)
              </label>
              <input
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="e.g. 950000"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Agreement Date
              </label>
              <input
                type="date"
                value={agreementDate}
                onChange={(e) => setAgreementDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Transfer Document Upload */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            Upload Sale Deed / Transfer Agreement (SHA-256 Cryptographic Lock)
          </label>
          <label className="border-2 border-dashed border-slate-700 hover:border-amber-400 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/60">
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
              }}
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
            />
            <Upload className="w-6 h-6 text-amber-400 mb-2" />
            <p className="text-xs font-medium text-slate-200">
              {file ? file.name : "Attach Signed Transfer Agreement / Form 29 & 30"}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              The SHA-256 hash will be permanently recorded in the transfer transaction
            </p>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !selectedVehicleId}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Initiating On-Chain Request..." : "Submit Transfer Request to Buyer"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
