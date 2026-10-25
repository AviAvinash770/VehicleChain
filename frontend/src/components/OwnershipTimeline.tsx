import React from "react";
import { CheckCircle2, History, ArrowRight, ShieldCheck, FileText } from "lucide-react";
import { OwnershipRecord } from "../types";

interface OwnershipTimelineProps {
  history: OwnershipRecord[];
  initialRegistrationDate?: string;
}

export const OwnershipTimeline: React.FC<OwnershipTimelineProps> = ({
  history,
  initialRegistrationDate,
}) => {
  if (!history || history.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-900">
        No recorded ownership transitions yet. Initial registration active.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-blue-500 before:to-slate-800">
      {history.map((record, index) => {
        const isInitial = index === 0 && record.transferRequestId === 0;
        const formattedDate = record.transferTimestamp
          ? new Date(record.transferTimestamp * 1000).toLocaleString()
          : initialRegistrationDate
          ? new Date(initialRegistrationDate).toLocaleString()
          : "Confirmed on Genesis";

        return (
          <div key={index} className="relative group">
            {/* Timeline node icon */}
            <div
              className={`absolute -left-[30px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110 ${
                isInitial
                  ? "bg-cyan-950 border-cyan-400 text-cyan-400 shadow-glow"
                  : "bg-blue-950 border-blue-400 text-blue-400"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>

            {/* Timeline item card */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isInitial
                        ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                        : "bg-blue-950 text-blue-300 border border-blue-800"
                    }`}
                  >
                    {isInitial ? "Owner #1 (Initial Registration)" : `Owner #${index + 1}`}
                  </span>
                  {!isInitial && (
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <History className="w-3 h-3 text-slate-500" />
                      Transfer Req #{record.transferRequestId}
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono text-slate-400">{formattedDate}</span>
              </div>

              {/* Owner Address */}
              <div className="mt-2 text-xs">
                <span className="text-slate-500 block text-[11px]">Registered Owner Wallet:</span>
                <span className="font-mono text-slate-200 font-semibold break-all bg-black/40 px-2 py-1 rounded inline-block mt-0.5">
                  {record.owner}
                </span>
              </div>

              {/* Cryptographic Document Hash Anchor */}
              {record.documentHash && (
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span className="font-mono text-[10px] truncate text-slate-400">
                    Doc Hash: <span className="text-cyan-300/80">{record.documentHash}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
