import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { QrCode, ShieldCheck, ArrowLeft, Camera, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const QrScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        // Extracted URL or vehicle ID:
        if (decodedText.includes("/verify/")) {
          const parts = decodedText.split("/verify/");
          navigate(`/verify/${parts[1]}`);
        } else {
          navigate(`/verify/${encodeURIComponent(decodedText)}`);
        }
      },
      (errorMessage) => {
        // Ignored routine frame errors
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [navigate]);

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/verify" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            Scan Vehicle Verification QR
          </h1>
          <p className="text-xs text-slate-400">
            Hold vehicle QR code in front of camera or upload QR image
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 shadow-xl overflow-hidden">
        <div id="qr-reader" className="w-full text-slate-200" />
      </div>

      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 text-center">
        <p>
          QR codes encode the public vehicle verification endpoint. Upon scanning, you will be redirected to the verified blockchain record.
        </p>
      </div>
    </div>
  );
};
