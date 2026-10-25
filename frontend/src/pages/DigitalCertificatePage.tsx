import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Shield,
  Printer,
  Download,
  ArrowLeft,
  CheckCircle2,
  Lock,
  QrCode,
  Car,
} from "lucide-react";
import { NumberPlateBadge } from "../components/NumberPlateBadge";
import { api } from "../services/api";
import { Vehicle } from "../types";

export const DigitalCertificatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/vehicles/${id}`);
        if (res.data.success) {
          setVehicle(res.data.vehicle);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Generating certificate...</div>;
  }

  if (!vehicle) {
    return (
      <div className="py-20 text-center text-red-400">
        <p>Vehicle record not found</p>
        <Link to="/verify" className="text-cyan-400 hover:underline mt-2 inline-block text-xs">
          Return to Registry
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Top Toolbar (Hidden during print) */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          to={`/vehicles/${vehicle.vehicleId}`}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vehicle
        </Link>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-glow flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Print / Save Digital Certificate
        </button>
      </div>

      {/* The Printable Digital Certificate Document */}
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-950 border-2 border-slate-700/80 shadow-2xl relative overflow-hidden print:border print:border-black print:bg-white print:text-black">
        {/* Subtle Watermark Emblem Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <Shield className="w-[450px] h-[450px]" />
        </div>

        {/* Certificate Header */}
        <div className="text-center pb-6 border-b-2 border-slate-800 print:border-slate-300 space-y-1">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full border border-blue-600 flex items-center justify-center p-1">
              <div className="w-3 h-3 rounded-full bg-blue-700" />
            </div>
            <span className="text-xs uppercase tracking-widest font-bold text-slate-300 print:text-slate-800 font-sans">
              GOVERNMENT OF INDIA • MINISTRY OF ROAD TRANSPORT & HIGHWAYS
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wide text-white print:text-black font-sans">
            Certificate of Vehicle Registration
          </h1>
          <p className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 print:text-blue-800">
            FORM 23 • HIGH SECURITY BLOCKCHAIN REGISTRATION
          </p>
        </div>

        {/* Central Vehicle Number Plate Display */}
        <div className="my-8 flex justify-center">
          <NumberPlateBadge
            registrationNumber={vehicle.registrationNumber}
            size="lg"
            variant="silver"
          />
        </div>

        {/* Specifications Matrix */}
        <div className="grid grid-cols-2 gap-4 text-xs font-mono mb-8">
          <div className="p-3 bg-slate-900/60 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300">
            <span className="text-slate-500 print:text-slate-600 block text-[10px]">
              Vehicle Registration ID:
            </span>
            <span className="font-bold text-slate-100 print:text-black">{vehicle.vehicleId}</span>
          </div>

          <div className="p-3 bg-slate-900/60 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300">
            <span className="text-slate-500 print:text-slate-600 block text-[10px]">
              Registration Status:
            </span>
            <span className="font-bold text-emerald-400 print:text-emerald-700">
              {vehicle.status} (IMMUTABLE)
            </span>
          </div>

          <div className="p-3 bg-slate-900/60 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300">
            <span className="text-slate-500 print:text-slate-600 block text-[10px]">
              Make & Model:
            </span>
            <span className="font-bold text-slate-100 print:text-black">
              {vehicle.manufacturer} {vehicle.model}
            </span>
          </div>

          <div className="p-3 bg-slate-900/60 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300">
            <span className="text-slate-500 print:text-slate-600 block text-[10px]">
              Year & Category:
            </span>
            <span className="font-bold text-slate-100 print:text-black">
              {vehicle.year} • {vehicle.vehicleType}
            </span>
          </div>

          <div className="col-span-2 p-3 bg-slate-900/60 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300">
            <span className="text-slate-500 print:text-slate-600 block text-[10px]">
              Chassis / Vehicle Identification Number (VIN):
            </span>
            <span className="font-bold text-slate-100 print:text-black">{vehicle.vin}</span>
          </div>

          <div className="col-span-2 p-3 bg-slate-900/60 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300">
            <span className="text-slate-500 print:text-slate-600 block text-[10px]">
              Current Authorized Owner Ethereum Wallet:
            </span>
            <span className="font-bold text-cyan-300 print:text-blue-900 break-all">
              {vehicle.currentOwnerWallet}
            </span>
          </div>
        </div>

        {/* Cryptographic Verification Anchors */}
        <div className="p-4 bg-slate-900 print:bg-slate-100 rounded-2xl border border-slate-800 print:border-slate-300 space-y-2 text-[10px] font-mono mb-8">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800 print:border-slate-300">
            <span className="font-bold uppercase tracking-wider text-slate-300 print:text-black flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              Cryptographic Integrity Verification
            </span>
            <span className="text-emerald-400 print:text-emerald-700 font-semibold">
              EVM Smart Contract Verified
            </span>
          </div>
          <div>
            <span className="text-slate-500">Genesis Blockchain Tx:</span>
            <p className="text-slate-300 print:text-black break-all">{vehicle.registrationTxHash}</p>
          </div>
          <div>
            <span className="text-slate-500">Registration Document SHA-256 Hash:</span>
            <p className="text-cyan-400 print:text-blue-900 break-all">{vehicle.initialDocHash}</p>
          </div>
          <div>
            <span className="text-slate-500">IPFS Storage CID:</span>
            <p className="text-slate-400 print:text-slate-700 break-all">{vehicle.ipfsDocCID}</p>
          </div>
        </div>

        {/* Footer with QR Code and Authority Sign-off */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-slate-800 print:border-slate-300">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-300 print:text-black">
              Issued by Regional Transport Authority (RTO)
            </p>
            <p className="text-[10px] text-slate-500 print:text-slate-600">
              Generated via VehicleChain Autonomous EVM Protocol
            </p>
            <p className="text-[10px] font-mono text-slate-400 print:text-slate-700">
              Date: {new Date(vehicle.createdAt).toLocaleDateString()}
            </p>
          </div>

          {vehicle.qrCodeDataUrl && (
            <div className="flex flex-col items-center">
              <img
                src={vehicle.qrCodeDataUrl}
                alt="Verification QR"
                className="w-20 h-20 p-1 bg-white rounded-lg shadow-md"
              />
              <span className="text-[8px] font-mono text-slate-500 mt-1 uppercase">
                Scan to Verify
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
