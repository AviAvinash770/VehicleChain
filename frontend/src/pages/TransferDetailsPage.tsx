import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FileCheck2,
  Car,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Shield,
  FileText,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { NumberPlateBadge } from "../components/NumberPlateBadge";
import { StatusPill } from "../components/StatusPill";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import { TransferRequest } from "../types";

export const TransferDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [transfer, setTransfer] = useState<TransferRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTransfer();
  }, [id]);

  const fetchTransfer = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/transfers/${id}`);
      if (res.data.success) {
        setTransfer(res.data.transfer);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load transfer");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyerAction = async (accept: boolean) => {
    try {
      setActionLoading(true);
      const reason = !accept ? prompt("Please enter rejection reason:") || "Rejected by buyer" : undefined;
      const res = await api.post(`/transfers/${id}/buyer-response`, { accept, rejectionReason: reason });
      if (res.data.success) {
        fetchTransfer();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAuthorityAction = async (approve: boolean) => {
    try {
      setActionLoading(true);
      const reason = !approve ? prompt("Please enter rejection reason:") || "Rejected by RTO" : undefined;
      const res = await api.post(`/transfers/${id}/authority-response`, { approve, rejectionReason: reason });
      if (res.data.success) {
        fetchTransfer();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">Loading transfer request details...</div>
    );
  }

  if (error || !transfer) {
    return (
      <div className="py-20 text-center text-red-400">
        <p>{error || "Transfer request not found"}</p>
        <Link to="/transfers" className="text-cyan-400 hover:underline mt-2 inline-block text-xs">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isBuyer =
    user?.role === "BUYER" ||
    (user?.walletAddress && transfer.buyerWallet.toLowerCase() === user.walletAddress.toLowerCase());

  const isAuthority = user?.role === "AUTHORITY";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0c1322] via-[#090d18] to-[#0c1322] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <NumberPlateBadge registrationNumber={transfer.registrationNumber} size="md" />
          <div>
            <h1 className="text-xl font-bold text-white">Ownership Transfer Request</h1>
            <p className="text-xs text-slate-400 font-mono">
              Vehicle: {transfer.vehicleId} • Req ID: {transfer._id}
            </p>
          </div>
        </div>

        <StatusPill status={transfer.status} />
      </div>

      {/* 3-Step Lifecycle Visual Tracker */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
        <h2 className="text-xs uppercase font-mono tracking-widest text-slate-400">
          Transfer State Machine Progression
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1: Owner Initiation */}
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-300 space-y-1">
            <div className="flex items-center gap-2 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>1. Initiated by Owner</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {new Date(transfer.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Step 2: Buyer Acceptance */}
          <div
            className={`p-4 rounded-xl border text-xs space-y-1 ${
              transfer.status === "PENDING_BUYER"
                ? "bg-amber-950/40 border-amber-500 text-amber-300 animate-pulse"
                : transfer.status === "REJECTED" && !transfer.authorityTxHash
                ? "bg-red-950/40 border-red-500 text-red-300"
                : "bg-slate-950 border-emerald-500/40 text-emerald-300"
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {transfer.status === "PENDING_BUYER" ? (
                <Clock className="w-4 h-4 text-amber-400" />
              ) : transfer.status === "REJECTED" && !transfer.authorityTxHash ? (
                <XCircle className="w-4 h-4 text-red-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
              <span>2. Buyer Review</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {transfer.status === "PENDING_BUYER"
                ? "Waiting for Buyer response"
                : transfer.status === "REJECTED"
                ? "Rejected"
                : "Accepted by Buyer"}
            </p>
          </div>

          {/* Step 3: RTO Approval */}
          <div
            className={`p-4 rounded-xl border text-xs space-y-1 ${
              transfer.status === "PENDING_AUTHORITY"
                ? "bg-purple-950/40 border-purple-500 text-purple-300 animate-pulse"
                : transfer.status === "COMPLETED"
                ? "bg-slate-950 border-emerald-500 text-emerald-300"
                : transfer.status === "REJECTED" && transfer.authorityTxHash
                ? "bg-red-950 border-red-500 text-red-300"
                : "bg-slate-950 border-slate-800 text-slate-500"
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {transfer.status === "COMPLETED" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : transfer.status === "REJECTED" && transfer.authorityTxHash ? (
                <XCircle className="w-4 h-4 text-red-400" />
              ) : (
                <Shield className="w-4 h-4 text-slate-400" />
              )}
              <span>3. RTO Approval & Mint</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {transfer.status === "COMPLETED"
                ? "Smart Contract Transferred"
                : transfer.status === "PENDING_AUTHORITY"
                ? "Awaiting RTO approval"
                : "Pending previous steps"}
            </p>
          </div>
        </div>
      </div>

      {/* Transfer Parties & Cryptographic Proof Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h3 className="text-xs uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            Current Owner (Transferor)
          </h3>
          <p className="font-bold text-white text-base">
            {transfer.currentOwner?.name || "Vehicle Owner"}
          </p>
          <div className="p-2.5 bg-black/40 rounded-xl font-mono text-[11px] text-slate-300 break-all">
            {transfer.currentOwnerWallet}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h3 className="text-xs uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            Target Transferee (Buyer)
          </h3>
          <p className="font-bold text-white text-base">
            {transfer.buyer?.name || transfer.buyerName || "Prospective Buyer"}
          </p>
          <div className="p-2.5 bg-black/40 rounded-xl font-mono text-[11px] text-emerald-300/90 break-all">
            {transfer.buyerWallet}
          </div>
        </div>
      </div>

      {/* Sale Deed & Hashes Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          Cryptographic Agreement Anchors
        </h3>

        <div className="space-y-2 font-mono text-xs">
          <div className="p-3 bg-black/40 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[11px]">Sale Agreement SHA-256 Hash:</span>
            <span className="text-cyan-300 break-all">{transfer.transferDocHash}</span>
          </div>

          <div className="p-3 bg-black/40 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[11px]">IPFS Document CID:</span>
            <span className="text-slate-300 break-all">{transfer.ipfsDocCID}</span>
          </div>

          {transfer.authorityTxHash && (
            <div className="p-3 bg-black/40 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[11px]">
                Blockchain Confirmation Transaction:
              </span>
              <span className="text-emerald-400 break-all">{transfer.authorityTxHash}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Banners */}
      {transfer.status === "PENDING_BUYER" && isBuyer && (
        <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-500/50 space-y-4">
          <h3 className="font-bold text-white text-base">Action Required from Buyer</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Please examine the sale terms and vehicle specifications. When you accept, the transfer will be forwarded to the RTO Authority for final blockchain recording.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleBuyerAction(true)}
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-glow transition-all active:scale-95 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Accept Transfer Request
            </button>
            <button
              onClick={() => handleBuyerAction(false)}
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 font-semibold text-xs transition-colors"
            >
              Reject Request
            </button>
          </div>
        </div>
      )}

      {transfer.status === "PENDING_AUTHORITY" && isAuthority && (
        <div className="p-6 rounded-2xl bg-purple-950/30 border border-purple-500/50 space-y-4">
          <h3 className="font-bold text-white text-base">
            Administrative Adjudication Required (RTO Officer)
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Both parties have consented and documents are signed. Confirm approval to permanently transfer ownership on the smart contract.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleAuthorityAction(true)}
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-glow transition-all active:scale-95 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve & Update Blockchain Registry
            </button>
            <button
              onClick={() => handleAuthorityAction(false)}
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 font-semibold text-xs transition-colors"
            >
              Reject Transfer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
