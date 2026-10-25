import React from "react";
import { motion } from "framer-motion";

interface NumberPlateBackgroundProps {
  registrationNumber?: string;
  variant?: "silver" | "dark";
  opacity?: number;
  className?: string;
  showSubtitle?: boolean;
}

export const NumberPlateBackground: React.FC<NumberPlateBackgroundProps> = ({
  registrationNumber = "AP 39 AB 2026",
  variant = "silver",
  opacity = 0.22,
  className = "",
  showSubtitle = true,
}) => {
  const isDark = variant === "dark";

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      {/* Ambient Blue Backlight */}
      <div className="absolute w-[800px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] -z-10" />

      {/* Very faint blockchain node & circuit grid */}
      <div className="absolute inset-0 blockchain-grid opacity-60" />

      {/* Central Realistic Indian HSRP Number Plate */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{ opacity }}
        className="relative flex flex-col items-center"
      >
        <div
          className={`relative w-[340px] sm:w-[540px] md:w-[720px] lg:w-[820px] h-[75px] sm:h-[110px] md:h-[145px] lg:h-[160px] rounded-xl sm:rounded-2xl p-[6px] sm:p-[10px] transition-all duration-700 ${
            isDark
              ? "bg-[#0c121e] plate-border-bevel-dark border border-cyan-500/30"
              : "bg-gradient-to-b from-[#ffffff] via-[#f1f5f9] to-[#e2e8f0] plate-border-bevel border border-slate-400/80"
          }`}
        >
          {/* Inner Plate Inset Surface */}
          <div
            className={`relative w-full h-full rounded-lg sm:rounded-xl flex items-center px-3 sm:px-6 shadow-inner ${
              isDark ? "bg-[#090d16]" : "bg-gradient-to-r from-[#f8fafc] via-[#ffffff] to-[#f1f5f9]"
            }`}
          >
            {/* Metallic light sheen animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] animate-[shimmer_8s_infinite] pointer-events-none" />

            {/* Left Fastener / Rivet Screw */}
            <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 shadow-md border border-slate-400 flex items-center justify-center">
              <div className="w-1.5 h-0.5 bg-slate-700 rotate-45" />
            </div>

            {/* Left Blue HSRP Emblem Section */}
            <div className="flex flex-col items-center justify-center pl-4 sm:pl-8 pr-2 sm:pr-4 border-r border-slate-300/40">
              {/* Ashok Chakra Emblem Stamp */}
              <div className="w-4 sm:w-7 h-4 sm:h-7 rounded-full border border-blue-800/80 flex items-center justify-center p-0.5 shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1e3a8a"
                  strokeWidth="1.8"
                  className="w-full h-full animate-spin-slow"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
                </svg>
              </div>
              <span className="text-[9px] sm:text-[13px] font-black tracking-widest text-blue-900 leading-tight mt-0.5 font-sans">
                IND
              </span>
            </div>

            {/* Bold Embossed Registration Number Typography */}
            <div className="flex-1 flex items-center justify-center px-2">
              <span
                className={`hsrp-font text-2xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[0.14em] font-extrabold select-none ${
                  isDark ? "hsrp-emboss-dark" : "hsrp-emboss-black"
                }`}
              >
                {registrationNumber}
              </span>
            </div>

            {/* Right Fastener Screw & Laser Engraved Serial Code */}
            <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex flex-col items-center justify-between h-[80%]">
              <div className="w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 shadow-md border border-slate-400 flex items-center justify-center">
                <div className="w-1.5 h-0.5 bg-slate-700 -rotate-45" />
              </div>
              <span className="text-[7px] sm:text-[10px] font-mono tracking-wider text-slate-500 font-semibold select-none">
                000453
              </span>
            </div>
          </div>
        </div>

        {/* Fictional Specimen Disclaimer Label */}
        {showSubtitle && (
          <div className="mt-3 text-[10px] sm:text-xs tracking-wider uppercase text-slate-400/80 font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Fictional Plate Design Model • VehicleChain Academic Prototype
          </div>
        )}
      </motion.div>
    </div>
  );
};
