import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileCheck2,
  Car,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  FileText,
  QrCode,
} from "lucide-react";
import { NumberPlateBadge } from "../components/NumberPlateBadge";
import { StatusPill } from "../components/StatusPill";
import { useAuth } from "../contexts/AuthContext";
import { useWallet } from "../contexts/WalletContext";
import { api } from "../services/api";
import { TransferRequest, Vehicle } from "../types";

export const BuyerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { account } = useWallet();

  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [acquiredVehicles, setAcquiredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Response Modal State
  const [selectedTransfer, setSelectedTransfer] = useState<TransferRequest | null>(null);
  const [actionType, setActionType] = useState<"accept" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBuyerData();
  }, [user, account]);

  const fetchBuyerData = async () => {
    try {
      setLoading(true);
      const [transRes, vehRes] = await Promise.all([
        api.get("/transfers"),
        api.get("/vehicles"),
      ]);

      if (transRes.data.success) {
        setTransfers(transRes.data.transfers);
      }
      if (vehRes.data.success) {
        setAcquiredVehicles(vehRes.data.vehicles);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyerAction = async () => {
    if (!selectedTransfer || !actionType) return;
    try {
      setSubmitting(true);
      const accept = actionType === "accept";
      const res = await api.post(`/transfers/${selectedTransfer._id}/buyer-response`, {
        accept,
        rejectionReason: accept ? undefined : rejectionReason || "Rejected by buyer",
      });

      if (res.data.success) {
        setSelectedTransfer(null);
        setActionType(null);
        setRejectionReason("");
        fetchBuyerData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to process response");
    } finally {
      setSubmitting(false);
    }
  };

  const pendingIncoming = transfers.filter((t) => t.status === "PENDING_BUYER");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0c1322] via-[#090d18] to-[#0c1322] border border-slate-800 shadow-xl">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileCheck2 className="w-6 h-6 text-cyan-400" />
          Buyer & Transferee Portal
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Inspect vehicle specifications, examine cryptographic sale agreements, and accept incoming transfer requests
        </p>
      </div>

      {/* Pending Incoming Transfer Requests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Incoming Transfer Requests Requiring Your Action ({pendingIncoming.length})
          </h2>
        </div>

        {pendingIncoming.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
            <p className="text-sm text-slate-400">No pending transfer requests waiting for your review.</p>
            <p className="text-xs text-slate-500 mt-1">
              When a vehicle owner initiates a sale/transfer to your wallet address ({user?.walletAddress || "not linked"}), it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingIncoming.map((t) => (
              <div
                key={t._id}
                className="p-6 rounded-2xl bg-slate-900/80 border border-amber-500/40 shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between">
                  <NumberPlateBadge registrationNumber={t.registrationNumber} size="md" />
                  <StatusPill status={t.status} />
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Current Registered Owner (Seller):</p>
                  <p className="text-sm font-semibold text-white">
                    {t.currentOwner?.name || "Vehicle Owner"}
                  </p>
                  <p className="font-mono text-[10px] text-slate-400">
                    Wallet: {t.currentOwnerWallet}
                  </p>
                </div>

                {t.salePrice && (
                  <div className="p-3 bg-black/40 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Agreed Sale Consideration:</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      ₹{t.salePrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      Sale Agreement Hash:
                    </span>
                    <span className="font-mono text-cyan-300 text-[10px] truncate max-w-[150px]">
                      {t.transferDocHash}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedTransfer(t);
                      setActionType("accept");
                    }}
                    className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-bold text-xs shadow-glow transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Accept Transfer
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTransfer(t);
                      setActionType("reject");
                    }}
                    className="py-2 px-4 rounded-xl bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-semibold transition-colors"
                  >
                    Reject
                  </button>
                  <Link
                    to={`/vehicles/${t.vehicleId}`}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                    title="Inspect Vehicle Record"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Successfully Acquired Vehicles */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Car className="w-5 h-5 text-emerald-400" />
          Acquired Vehicles ({acquiredVehicles.length})
        </h2>

        {acquiredVehicles.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            No acquired vehicles yet. Accepted transfers approved by RTO will appear here.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {acquiredVehicles.map((v) => (
              <div
                key={v._id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <NumberPlateBadge registrationNumber={v.registrationNumber} size="sm" />
                  <StatusPill status={v.status} />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">
                    {v.manufacturer} {v.model}
                  </p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{v.vehicleId}</p>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <Link
                    to={`/vehicles/${v.vehicleId}`}
                    className="text-cyan-400 hover:underline font-semibold"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/certificate/${v.vehicleId}`}
                    className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    RC Certificate
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Buyer Action Modal */}
      {selectedTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0c121e] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-base">
              {actionType === "accept"
                ? "Accept Ownership Transfer Request"
                : "Reject Transfer Request"}
            </h3>

            <p className="text-xs text-slate-400 font-mono">
              Vehicle: {selectedTransfer.registrationNumber} ({selectedTransfer.vehicleId})
            </p>

            {actionType === "accept" ? (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 space-y-2">
                <p>
                  By accepting this transfer, you acknowledge receipt and verification of vehicle specifications and the cryptographic transfer agreement.
                </p>
                <p>
                  Upon acceptance, the request is permanently forwarded to the RTO Authority for final blockchain validation.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason for Rejection
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Terms not matched, condition discrepancy..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedTransfer(null);
                  setActionType(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBuyerAction}
                disabled={submitting}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  actionType === "accept"
                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-glow"
                    : "bg-red-600 hover:bg-red-500 text-white"
                }`}
              >
                {submitting
                  ? "Processing..."
                  : actionType === "accept"
                  ? "Confirm & Forward to RTO"
                  : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
