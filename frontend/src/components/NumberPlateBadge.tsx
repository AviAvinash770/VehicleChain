import React from "react";

interface NumberPlateBadgeProps {
  registrationNumber: string;
  size?: "sm" | "md" | "lg";
  variant?: "silver" | "dark" | "electric";
  className?: string;
}

export const NumberPlateBadge: React.FC<NumberPlateBadgeProps> = ({
  registrationNumber,
  size = "md",
  variant = "silver",
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-8 px-2 text-xs rounded-md border",
    md: "h-11 px-3 text-base sm:text-lg rounded-lg border-[1.5px]",
    lg: "h-16 px-5 text-2xl sm:text-3xl rounded-xl border-2",
  };

  const fontSizes = {
    sm: "text-sm tracking-wider",
    md: "text-base sm:text-xl tracking-wider",
    lg: "text-2xl sm:text-4xl tracking-widest",
  };

  return (
    <div
      className={`inline-flex items-center select-none font-bold transition-all shadow-md ${
        sizeClasses[size]
      } ${
        variant === "silver"
          ? "bg-gradient-to-r from-slate-100 via-white to-slate-200 border-slate-400 text-slate-900 shadow-slate-950/40"
          : variant === "electric"
          ? "bg-gradient-to-r from-[#0b1329] via-[#0f1d3d] to-[#0b1329] border-cyan-400 text-cyan-300 shadow-cyan-500/20"
          : "bg-slate-900 border-slate-700 text-slate-100 shadow-black/60"
      } ${className}`}
    >
      {/* Left IND Blue Badge */}
      <div className="flex flex-col items-center pr-2 mr-2 border-r border-slate-300/50">
        <div className="w-2.5 h-2.5 rounded-full border border-blue-800 flex items-center justify-center p-[1px]">
          <div className="w-1 h-1 rounded-full bg-blue-700" />
        </div>
        <span className="text-[7px] font-black text-blue-900 leading-none mt-0.5">IND</span>
      </div>

      {/* Reg Number Typography with 3D stamp effect */}
      <span
        className={`hsrp-font ${fontSizes[size]} ${
          variant === "silver" ? "hsrp-emboss-black" : "hsrp-emboss-dark"
        }`}
      >
        {registrationNumber}
      </span>
    </div>
  );
};
