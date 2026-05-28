import { useState } from "react";
import MapView from "@/components/MapView";
import VideoPanel from "@/components/VideoPanel";
import TopBar from "@/components/TopBar";
import MapControls from "@/components/MapControls";
import { Map as LeafletMap } from "leaflet";

export default function CopDashboard() {
  const [mapRef, setMapRef] = useState<LeafletMap | null>(null);

  const handleZoomIn = () => mapRef?.zoomIn();
  const handleZoomOut = () => mapRef?.zoomOut();
  const handleLocate = () => {
    if (mapRef) {
      mapRef.setView([37.9838, 23.7275], 14);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#e8edf2] select-none">
      {/* Map fills entire screen */}
      <MapView onMapReady={setMapRef} />

      {/* Top bar overlay */}
      <TopBar />

      {/* Left map controls */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onLocate={handleLocate}
      />

      {/* Bottom-left video panel */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <VideoPanel />
      </div>

      {/* Top-right action buttons */}
      <div className="absolute top-14 right-3 z-[1000] flex flex-col gap-2">
        <ActionButton icon="⚡" title="Alerts" />
        <ActionButton icon="📊" title="Analytics" />
        <ActionButton icon="📡" title="Signals" />
      </div>
    </div>
  );
}

function ActionButton({ icon, title }: { icon: string; title: string }) {
  return (
    <button
      title={title}
      className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-sm hover:bg-gray-50 transition-colors border border-gray-200"
    >
      {icon}
    </button>
  );
}
