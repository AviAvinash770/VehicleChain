import React, { useState } from "react";
import { Upload, CheckCircle2, XCircle, AlertCircle, X, ShieldCheck, FileText } from "lucide-react";
import { api } from "../services/api";

interface DocumentVerifierModalProps {
  vehicleId: string;
  expectedHash?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentVerifierModal: React.FC<DocumentVerifierModalProps> = ({
  vehicleId,
  expectedHash,
  isOpen,
  onClose,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<{
    verified: boolean;
    calculatedHash: string;
    registeredHash: string;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleVerify = async () => {
    if (!file) return;

    try {
      setVerifying(true);
      setError(null);
      const formData = new FormData();
      formData.append("document", file);

      const res = await api.post(`/vehicles/${vehicleId}/verify-document`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setResult(res.data);
      } else {
        setError(res.data.message || "Verification failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to verify document");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0c121e] border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Cryptographic Document Integrity Check</h3>
              <p className="text-xs text-slate-400 font-mono">Vehicle: {vehicleId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 text-xs text-slate-300">
            <p>
              Upload any copy of the Registration Certificate (RC), Insurance, or Transfer Deed. The system will compute its SHA-256 hash in real time and match it against the immutable blockchain hash.
            </p>
          </div>

          {/* File Dropzone */}
          <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/40 hover:bg-slate-900/40">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
            />
            <Upload className="w-8 h-8 text-cyan-400 mb-2" />
            <p className="text-sm font-medium text-slate-200">
              {file ? file.name : "Click or drag document to verify"}
            </p>
            <p className="text-xs text-slate-500 mt-1">PDF, PNG, JPG (Max 10MB)</p>
          </label>

          {file && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="truncate max-w-[200px]">{file.name}</span>
                <span className="text-slate-500 font-mono">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                onClick={handleVerify}
                disabled={verifying}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all disabled:opacity-50"
              >
                {verifying ? "Hashing & Checking..." : "Verify Hash"}
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div
              className={`p-4 rounded-xl border ${
                result.verified
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                  : "bg-red-950/40 border-red-500/40 text-red-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-2 font-bold text-sm">
                {result.verified ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Cryptographic Match Confirmed!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-400" />
                    <span>Integrity Mismatch Detected!</span>
                  </>
                )}
              </div>
              <p className="text-xs leading-relaxed mb-3">{result.message}</p>

              <div className="space-y-1.5 font-mono text-[10px] bg-black/40 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Computed File SHA-256:</span>
                  <span className="text-cyan-300 break-all">{result.calculatedHash}</span>
                </div>
                <div className="pt-1 border-t border-slate-800">
                  <span className="text-slate-500 block">Registered Blockchain Hash:</span>
                  <span className="text-slate-300 break-all">{result.registeredHash}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
