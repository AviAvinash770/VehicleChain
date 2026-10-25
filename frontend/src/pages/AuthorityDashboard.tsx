import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Car,
  Shield,
  FileCheck2,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Plus,
  RefreshCw,
} from "lucide-react";
import { NumberPlateBadge } from "../components/NumberPlateBadge";
import { StatusPill } from "../components/StatusPill";
import { api } from "../services/api";
import { Vehicle, TransferRequest } from "../types";

export const AuthorityDashboard: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pendingTransfers, setPendingTransfers] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Approval / Rejection Modal State
  const [selectedTransfer, setSelectedTransfer] = useState<TransferRequest | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Status Change Modal State
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [newVehicleStatus, setNewVehicleStatus] = useState<"ACTIVE" | "SUSPENDED" | "DEREGISTERED">("ACTIVE");
  const [statusReason, setStatusReason] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vehRes, transRes] = await Promise.all([
        api.get("/vehicles", { params: { status: statusFilter || undefined, search: search || undefined } }),
        api.get("/transfers", { params: { status: "PENDING_AUTHORITY" } }),
      ]);

      if (vehRes.data.success) setVehicles(vehRes.data.vehicles);
      if (transRes.data.success) setPendingTransfers(transRes.data.transfers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleTransferAction = async () => {
    if (!selectedTransfer || !actionType) return;
    try {
      setSubmitting(true);
      setActionError(null);
      const approve = actionType === "approve";

      const res = await api.post(`/transfers/${selectedTransfer._id}/authority-response`, {
        approve,
        rejectionReason: approve ? undefined : rejectionReason || "Rejected by RTO Authority",
      });

      if (res.data.success) {
        setSelectedTransfer(null);
        setActionType(null);
        setRejectionReason("");
        fetchData();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || "Action failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateVehicleStatus = async () => {
    if (!selectedVehicle) return;
    try {
      setUpdatingStatus(true);
      const res = await api.patch(`/vehicles/${selectedVehicle.vehicleId}/status`, {
        status: newVehicleStatus,
        reason: statusReason || "Administrative RTO update",
      });

      if (res.data.success) {
        setSelectedVehicle(null);
        setStatusReason("");
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to update vehicle status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const activeCount = vehicles.filter((v) => v.status === "ACTIVE").length;
  const suspendedCount = vehicles.filter((v) => v.status === "SUSPENDED").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with Compact Number Plate Graphic */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0c1322] via-[#090d18] to-[#0c1322] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <NumberPlateBadge registrationNumber="GOV IND 001" size="md" variant="silver" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-cyan-400" />
              Regional Transport Office (RTO) Authority Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Authorized Vehicular Registry, Cryptographic Issuance, and Ownership Transfer Adjudication
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            title="Refresh Registry"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          </button>
          <Link
            to="/vehicles/register"
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-glow flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Register New Vehicle
          </Link>
        </div>
      </div>

      {/* Metrics Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Registered</span>
            <Car className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2 font-mono">{vehicles.length}</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Active Vehicles</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2 font-mono">{activeCount}</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Suspended</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400 mt-2 font-mono">{suspendedCount}</p>
        </div>

        <div className="p-5 rounded-xl bg-purple-950/20 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300 uppercase">Pending Approvals</span>
            <FileCheck2 className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-purple-300 mt-2 font-mono">
            {pendingTransfers.length}
          </p>
        </div>
      </div>

      {/* Pending Transfers Awaiting Authority Adjudication */}
      {pendingTransfers.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-purple-500/40 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-purple-400" />
                Transfer Requests Awaiting RTO Authority Approval ({pendingTransfers.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                The buyer has verified vehicle documents and accepted the transfer. Final smart-contract approval required.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Vehicle Plate</th>
                  <th className="py-3 px-4">Current Owner (Seller)</th>
                  <th className="py-3 px-4">Prospective Buyer</th>
                  <th className="py-3 px-4">Sale Agreement Hash</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {pendingTransfers.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <NumberPlateBadge registrationNumber={req.registrationNumber} size="sm" />
                      <span className="block text-[10px] font-mono text-slate-500 mt-1">
                        {req.vehicleId}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white">{req.currentOwner?.name || "Owner"}</p>
                      <span className="font-mono text-[10px] text-slate-400">
                        {req.currentOwnerWallet.slice(0, 6)}...{req.currentOwnerWallet.slice(-4)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white">{req.buyer?.name || "Buyer"}</p>
                      <span className="font-mono text-[10px] text-slate-400">
                        {req.buyerWallet.slice(0, 6)}...{req.buyerWallet.slice(-4)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-cyan-400">
                      <span className="bg-black/40 px-2 py-1 rounded inline-block">
                        {req.transferDocHash.slice(0, 14)}...
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTransfer(req);
                          setActionType("approve");
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                      >
                        Approve & Record
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTransfer(req);
                          setActionType("reject");
                        }}
                        className="px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 font-semibold text-xs transition-colors"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Registered Vehicles Master Registry Table */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-cyan-400" />
              Registered Vehicles Master Registry
            </h2>
            <p className="text-xs text-slate-400">
              Complete vehicle records synchronized with blockchain smart contract state
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search plate / model / ID..."
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 pl-8 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </form>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="DEREGISTERED">Deregistered</option>
            </select>
          </div>
        </div>

        {/* Vehicle Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Registration Plate</th>
                <th className="py-3 px-4">Make & Model</th>
                <th className="py-3 px-4">Registered Owner</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Blockchain Tx</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No vehicles found matching current criteria
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <NumberPlateBadge registrationNumber={v.registrationNumber} size="sm" />
                      <span className="block text-[10px] font-mono text-slate-500 mt-1">
                        {v.vehicleId}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white">
                        {v.manufacturer} {v.model}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {v.year} • {v.vehicleType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <span className="text-slate-200">
                        {typeof v.currentOwner === "object" ? v.currentOwner.name : "Owner"}
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        {v.currentOwnerWallet.slice(0, 6)}...{v.currentOwnerWallet.slice(-4)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusPill status={v.status} />
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-cyan-400">
                      <span className="bg-black/40 px-2 py-1 rounded">
                        {v.registrationTxHash.slice(0, 10)}...
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedVehicle(v);
                          setNewVehicleStatus(v.status);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                      >
                        Status
                      </button>
                      <Link
                        to={`/vehicles/${v.vehicleId}`}
                        className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/60 text-cyan-300 text-[11px] transition-colors inline-block"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Authority Adjudication Modal */}
      {selectedTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0c121e] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-base">
              {actionType === "approve" ? "Approve Vehicle Ownership Transfer" : "Reject Transfer"}
            </h3>
            <p className="text-xs text-slate-400">
              Vehicle: <span className="font-bold text-white">{selectedTransfer.registrationNumber}</span>
            </p>

            {actionError && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-lg">
                {actionError}
              </div>
            )}

            {actionType === "approve" ? (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 space-y-2">
                <p>
                  Approving this request will execute an authorized transaction on the smart contract, permanently updating the on-chain ownership to:
                </p>
                <p className="font-mono font-bold break-all bg-black/40 p-2 rounded">
                  {selectedTransfer.buyerWallet}
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
                  placeholder="e.g., Unpaid fines, document discrepancy, incomplete signatures"
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-400"
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
                onClick={handleTransferAction}
                disabled={submitting}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  actionType === "approve"
                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-glow"
                    : "bg-red-600 hover:bg-red-500 text-white"
                }`}
              >
                {submitting
                  ? "Submitting to Blockchain..."
                  : actionType === "approve"
                  ? "Confirm & Mint Transfer"
                  : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Status Update Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0c121e] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-base">Update Vehicle Administrative Status</h3>
            <p className="text-xs text-slate-400 font-mono">
              Vehicle: {selectedVehicle.registrationNumber} ({selectedVehicle.vehicleId})
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Status</label>
              <select
                value={newVehicleStatus}
                onChange={(e) => setNewVehicleStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none"
              >
                <option value="ACTIVE">ACTIVE (Normal operational status)</option>
                <option value="SUSPENDED">SUSPENDED (Pending challans / investigations)</option>
                <option value="DEREGISTERED">DEREGISTERED (Scrapped / Stolen / Permanent Cancellation)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official Regulatory Reason
              </label>
              <textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="State the official grounds for status change..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedVehicle(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateVehicleStatus}
                disabled={updatingStatus}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-lg transition-all shadow-glow disabled:opacity-50"
              >
                {updatingStatus ? "Updating Blockchain..." : "Confirm Status Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
