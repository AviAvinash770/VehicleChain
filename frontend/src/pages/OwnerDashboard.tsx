import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Car,
  FileCheck2,
  Plus,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  QrCode,
  AlertCircle,
  XCircle,
  Clock,
  Download,
} from "lucide-react";
import { NumberPlateBadge } from "../components/NumberPlateBadge";
import { StatusPill } from "../components/StatusPill";
import { DocumentVerifierModal } from "../components/DocumentVerifierModal";
import { useAuth } from "../contexts/AuthContext";
import { useWallet } from "../contexts/WalletContext";
import { api } from "../services/api";
import { Vehicle, TransferRequest } from "../types";

export const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { account } = useWallet();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Document verification modal state
  const [verifyingVehicleId, setVerifyingVehicleId] = useState<string | null>(null);

  useEffect(() => {
    fetchOwnerData();
  }, [user, account]);

  const fetchOwnerData = async () => {
    try {
      setLoading(true);
      const [vehRes, transRes] = await Promise.all([
        api.get("/vehicles"),
        api.get("/transfers"),
      ]);

      if (vehRes.data.success) setVehicles(vehRes.data.vehicles);
      if (transRes.data.success) setTransfers(transRes.data.transfers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTransfer = async (transferId: string) => {
    if (!window.confirm("Are you sure you want to cancel this transfer request?")) return;
    try {
      const res = await api.post(`/transfers/${transferId}/cancel`);
      if (res.data.success) {
        fetchOwnerData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to cancel transfer");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0c1322] via-[#090d18] to-[#0c1322] border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Car className="w-6 h-6 text-cyan-400" />
            Vehicle Owner Garage
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your registered vehicular assets, transfer requests, and digital certificates
          </p>
        </div>

        <Link
          to="/transfers/initiate"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black text-xs font-bold transition-all shadow-glow flex items-center gap-2 self-start sm:self-auto"
        >
          <FileCheck2 className="w-4 h-4" />
          Initiate Ownership Transfer
        </Link>
      </div>

      {/* Owned Vehicles Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Car className="w-5 h-5 text-cyan-400" />
          My Registered Vehicles ({vehicles.length})
        </h2>

        {vehicles.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
            <p className="text-sm text-slate-400">No vehicles currently registered under your account.</p>
            <p className="text-xs text-slate-500">
              When an authorized RTO officer registers a vehicle with your wallet address ({user?.walletAddress || "not linked"}), it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => (
              <div
                key={v._id}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-lg flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <NumberPlateBadge registrationNumber={v.registrationNumber} size="sm" />
                    <StatusPill status={v.status} />
                  </div>

                  <h3 className="font-bold text-white text-base">
                    {v.manufacturer} {v.model}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {v.year} • {v.vehicleType}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-1.5 font-mono text-[11px] text-slate-400">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vehicle ID:</span>
                      <span className="text-slate-200">{v.vehicleId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">VIN:</span>
                      <span className="text-slate-200">{v.vin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Registered:</span>
                      <span className="text-slate-200">
                        {new Date(v.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                  <Link
                    to={`/vehicles/${v.vehicleId}`}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center transition-colors"
                  >
                    View Details
                  </Link>

                  <Link
                    to={`/certificate/${v.vehicleId}`}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-cyan-950 text-cyan-400 border border-slate-700 hover:border-cyan-800 transition-colors"
                    title="Digital Certificate & QR"
                  >
                    <QrCode className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => setVerifyingVehicleId(v.vehicleId)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-emerald-950 text-emerald-400 border border-slate-700 hover:border-emerald-800 transition-colors"
                    title="Verify Document Hash"
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </button>

                  <Link
                    to={`/transfers/initiate?vehicleId=${v.vehicleId}`}
                    className="py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors"
                  >
                    Transfer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transfer Requests Initiated */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-amber-400" />
          Transfer Requests Initiated ({transfers.length})
        </h2>

        {transfers.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No transfer requests created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Vehicle Plate</th>
                  <th className="py-3 px-4">Target Buyer</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Date Initiated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transfers.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <NumberPlateBadge registrationNumber={t.registrationNumber} size="sm" />
                      <span className="block text-[10px] font-mono text-slate-500 mt-1">
                        {t.vehicleId}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white">{t.buyer?.name || t.buyerName || "Buyer"}</p>
                      <span className="font-mono text-[10px] text-slate-400">
                        {t.buyerWallet.slice(0, 6)}...{t.buyerWallet.slice(-4)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusPill status={t.status} />
                      {t.rejectionReason && (
                        <p className="text-[10px] text-red-400 mt-1">
                          Reason: {t.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {t.status === "PENDING_BUYER" && (
                        <button
                          onClick={() => handleCancelTransfer(t._id)}
                          className="px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-red-300 text-[11px] transition-colors"
                        >
                          Cancel Request
                        </button>
                      )}
                      <Link
                        to={`/transfers/${t._id}`}
                        className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/60 text-cyan-300 text-[11px] transition-colors inline-block"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {verifyingVehicleId && (
        <DocumentVerifierModal
          vehicleId={verifyingVehicleId}
          isOpen={!!verifyingVehicleId}
          onClose={() => setVerifyingVehicleId(null)}
        />
      )}
    </div>
  );
};
