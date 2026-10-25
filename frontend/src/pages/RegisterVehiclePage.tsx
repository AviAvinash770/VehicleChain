import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  Car,
  Shield,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Hash,
} from "lucide-react";
import { NumberPlateBadge } from "../components/NumberPlateBadge";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";

export const RegisterVehiclePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [vehicleId, setVehicleId] = useState(`VEH-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`);
  const [registrationNumber, setRegistrationNumber] = useState("DL 1C A 6207");
  const [vin, setVin] = useState("MA3EFA123RK998877");
  const [manufacturer, setManufacturer] = useState("Tata Motors");
  const [model, setModel] = useState("Nexon EV Empowered");
  const [year, setYear] = useState(2024);
  const [vehicleType, setVehicleType] = useState("Electric Compact SUV");
  const [initialOwnerWallet, setInitialOwnerWallet] = useState("0x70997970c51812dc3a010c7d01b50e0d17dc79c8");
  const [initialOwnerEmail, setInitialOwnerEmail] = useState("owner@vehiclechain.gov.in");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !registrationNumber || !vin || !initialOwnerWallet) {
      setError("Please fill in all mandatory fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("vehicleId", vehicleId.trim().toUpperCase());
      formData.append("registrationNumber", registrationNumber.trim().toUpperCase());
      formData.append("vin", vin.trim());
      formData.append("manufacturer", manufacturer.trim());
      formData.append("model", model.trim());
      formData.append("year", String(year));
      formData.append("vehicleType", vehicleType.trim());
      formData.append("initialOwnerWallet", initialOwnerWallet.trim().toLowerCase());
      if (initialOwnerEmail) formData.append("initialOwnerEmail", initialOwnerEmail.trim().toLowerCase());
      if (file) formData.append("document", file);

      const res = await api.post("/vehicles/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        navigate(`/vehicles/${vehicleId}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to register vehicle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0c1322] via-[#090d18] to-[#0c1322] border border-slate-800 shadow-xl">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Car className="w-6 h-6 text-cyan-400" />
          RTO Vehicle Registration & Blockchain Minting
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Perform administrative cryptographic registration, mint smart-contract token record, and store RC document hashes
        </p>
      </div>

      {/* Live Registration Number Plate Visualizer */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center space-y-3">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
          Live Plate Typography Preview
        </span>
        <NumberPlateBadge
          registrationNumber={registrationNumber || "AP 39 AB 2026"}
          size="lg"
          variant="silver"
        />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Unique Vehicle System ID
            </label>
            <input
              type="text"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
              placeholder="VEH-2026-000001"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Registration Plate Number
            </label>
            <input
              type="text"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              required
              placeholder="e.g. DL 1C A 6207 or AP 39 AB 2026"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-400 uppercase"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Chassis Number / VIN
            </label>
            <input
              type="text"
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              required
              placeholder="17-digit VIN / Chassis"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Vehicle Type / Category
            </label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="Electric Compact SUV">Electric Compact SUV (EV)</option>
              <option value="Electric Sedan">Electric Sedan</option>
              <option value="Sedan">Sedan (Petrol/Diesel)</option>
              <option value="SUV">SUV</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Commercial Truck">Commercial Truck</option>
              <option value="Motorcycle / Two-Wheeler">Motorcycle / Two-Wheeler</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Manufacturer / Make
            </label>
            <input
              type="text"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              required
              placeholder="e.g. Tata Motors, Mahindra, Hyundai"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Model Name & Variant
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
              placeholder="e.g. Nexon EV Empowered"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Manufacturing Year
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              required
              min={1950}
              max={new Date().getFullYear() + 2}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Initial Owner Ethereum Wallet Address
            </label>
            <input
              type="text"
              value={initialOwnerWallet}
              onChange={(e) => setInitialOwnerWallet(e.target.value)}
              required
              placeholder="0x..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Owner Email (Optional for Notification)
            </label>
            <input
              type="email"
              value={initialOwnerEmail}
              onChange={(e) => setInitialOwnerEmail(e.target.value)}
              placeholder="owner@vehiclechain.gov.in"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* File Upload for RC / Insurance */}
        <div className="pt-2 border-t border-slate-800">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Upload Official Registration Certificate / Invoice (SHA-256 Hashed & IPFS Pinned)
          </label>
          <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/60">
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
              }}
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
            />
            <Upload className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-xs font-medium text-slate-200">
              {file ? file.name : "Select Registration Document (PDF/JPG)"}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Cryptographic hash will be anchored to the smart contract
            </p>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Submitting to Blockchain & IPFS..." : "Register Vehicle & Anchor On-Chain"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
