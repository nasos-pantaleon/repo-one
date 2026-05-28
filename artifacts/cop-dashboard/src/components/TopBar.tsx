import { Globe, Menu } from "lucide-react";
import { useState } from "react";

export default function TopBar() {
  const [lang, setLang] = useState<"EN" | "FN">("FN");

  return (
    <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-4 py-2 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col leading-none">
          <span className="text-[#1a3a6b] font-black text-sm tracking-tight">QUALCO</span>
          <span className="text-[#1a3a6b] font-semibold text-[10px] tracking-wider">Group</span>
        </div>
      </div>

      {/* Title */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <h1 className="text-sm font-semibold tracking-[0.25em] text-gray-700 uppercase">
          Common Operational Picture
        </h1>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setLang(l => l === "EN" ? "FN" : "EN")}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Globe size={15} className="text-gray-500" />
          <span>{lang}</span>
        </button>
        <button className="text-gray-500 hover:text-gray-800 transition-colors">
          <Menu size={18} />
        </button>
      </div>
    </div>
  );
}
