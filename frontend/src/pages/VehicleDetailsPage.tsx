import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Car,
  ShieldCheck,
  QrCode,
  FileText,
  History,
  CheckCircle2,
  ExternalLink,
  Download,
  AlertTriangle,
} from "lucide-react";
import { NumberPlateBadge } from "../components/NumberPlateBadge";
import { StatusPill } from "../components/StatusPill";
import { OwnershipTimeline } from "../components/OwnershipTimeline";
import { DocumentVerifierModal } from "../components/DocumentVerifierModal";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import { Vehicle, OwnershipRecord } from "../types";

export const VehicleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [blockchainState, setBlockchainState] = useState<any>(null);
  const [ownershipHistory, setOwnershipHistory] = useState<OwnershipRecord[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVerifier, setShowVerifier] = useState(false);

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/vehicles/${id}`);
      if (res.data.success) {
        setVehicle(res.data.vehicle);
        setBlockchainState(res.data.blockchainState);
        setOwnershipHistory(res.data.ownershipHistory);
        setDocuments(res.data.documents || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load vehicle");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Loading vehicle registry...</div>;
  }

  if (error || !vehicle) {
    return (
      <div className="py-20 text-center text-red-400">
        <p>{error || "Vehicle not found"}</p>
        <Link to="/verify" className="text-cyan-400 hover:underline mt-2 inline-block text-xs">
          Return to Registry Search
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Prominent Vehicle Number Plate Header Card */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-[#0c1322] via-[#090d18] to-[#0c1322] border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <NumberPlateBadge registrationNumber={vehicle.registrationNumber} size="lg" variant="silver" />
            <StatusPill status={vehicle.status} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {vehicle.manufacturer} {vehicle.model}
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            System ID: {vehicle.vehicleId} • {vehicle.year} • {vehicle.vehicleType}
          </p>
        </div>

        {/* QR Code and Quick Actions */}
        <div className="flex flex-col items-center gap-3">
          {vehicle.qrCodeDataUrl && (
            <img
              src={vehicle.qrCodeDataUrl}
              alt="Verification QR"
              className="w-24 h-24 rounded-xl p-1 bg-white shadow-lg border border-slate-700"
            />
          )}
          <Link
            to={`/certificate/${vehicle.vehicleId}`}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-glow flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Digital Certificate
          </Link>
        </div>
      </div>

      {/* Specifications & Blockchain Integrity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Specification Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Car className="w-4 h-4 text-cyan-400" />
            Vehicle Specifications
          </h2>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2.5 bg-black/40 rounded-lg">
              <span className="text-slate-500">Chassis / VIN:</span>
              <span className="text-slate-200">{vehicle.vin}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-black/40 rounded-lg">
              <span className="text-slate-500">VIN Cryptographic Hash:</span>
              <span className="text-cyan-400 truncate max-w-[180px]">{vehicle.vinHash}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-black/40 rounded-lg">
              <span className="text-slate-500">Registered Owner:</span>
              <span className="text-slate-200">
                {typeof vehicle.currentOwner === "object" ? vehicle.currentOwner.name : "Registered Owner"}
              </span>
            </div>
            <div className="flex justify-between p-2.5 bg-black/40 rounded-lg">
              <span className="text-slate-500">Owner Wallet Address:</span>
              <span className="text-slate-300 truncate max-w-[180px]">
                {vehicle.currentOwnerWallet}
              </span>
            </div>
          </div>
        </div>

        {/* Blockchain Record Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              On-Chain Cryptographic State
            </h2>
            <button
              onClick={() => setShowVerifier(true)}
              className="px-3 py-1 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-semibold hover:bg-cyan-900 transition-colors"
            >
              Verify Document
            </button>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 bg-black/40 rounded-lg space-y-1">
              <span className="text-slate-500 block text-[11px]">Genesis Registration Tx:</span>
              <span className="text-emerald-400 break-all">{vehicle.registrationTxHash}</span>
            </div>
            <div className="p-2.5 bg-black/40 rounded-lg space-y-1">
              <span className="text-slate-500 block text-[11px]">Initial Document SHA-256:</span>
              <span className="text-cyan-300 break-all">{vehicle.initialDocHash}</span>
            </div>
            <div className="p-2.5 bg-black/40 rounded-lg space-y-1">
              <span className="text-slate-500 block text-[11px]">IPFS Storage CID:</span>
              <span className="text-slate-300 break-all">{vehicle.ipfsDocCID}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chronological Ownership Timeline */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            Immutable Ownership History Timeline
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically verified historical events recorded on the blockchain smart contract
          </p>
        </div>

        <OwnershipTimeline
          history={ownershipHistory}
          initialRegistrationDate={vehicle.createdAt}
        />
      </div>

      {/* Document Integrity Checker Modal */}
      {showVerifier && (
        <DocumentVerifierModal
          vehicleId={vehicle.vehicleId}
          expectedHash={vehicle.initialDocHash}
          isOpen={showVerifier}
          onClose={() => setShowVerifier(false)}
        />
      )}
    </div>
  );
};
