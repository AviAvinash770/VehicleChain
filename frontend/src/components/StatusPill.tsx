import React from "react";
import { CheckCircle, AlertTriangle, XCircle, Clock, ShieldAlert } from "lucide-react";

interface StatusPillProps {
  status: string;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, className = "" }) => {
  const normalized = status.toUpperCase();

  switch (normalized) {
    case "ACTIVE":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-sm ${className}`}
        >
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          ACTIVE
        </span>
      );

    case "SUSPENDED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-500/40 shadow-sm ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          SUSPENDED
        </span>
      );

    case "DEREGISTERED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950/80 text-red-400 border border-red-500/40 shadow-sm ${className}`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          DEREGISTERED
        </span>
      );

    case "PENDING_BUYER":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-400 border border-blue-500/40 shadow-sm ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          Awaiting Buyer
        </span>
      );

    case "PENDING_AUTHORITY":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950/80 text-purple-400 border border-purple-500/40 shadow-sm animate-pulse ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-purple-400" />
          Awaiting RTO Approval
        </span>
      );

    case "COMPLETED":
    case "APPROVED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-sm ${className}`}
        >
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          Completed
        </span>
      );

    case "REJECTED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950/80 text-red-400 border border-red-500/40 shadow-sm ${className}`}
        >
          <XCircle className="w-3.5 h-3.5 text-red-400" />
          Rejected
        </span>
      );

    case "CANCELLED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900 text-slate-400 border border-slate-700 shadow-sm ${className}`}
        >
          <XCircle className="w-3.5 h-3.5 text-slate-400" />
          Cancelled
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 ${className}`}
        >
          {status}
        </span>
      );
  }
};
