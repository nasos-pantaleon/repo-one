import { useEffect, useRef } from "react";
import L, { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  onMapReady: (map: LeafletMap) => void;
}

export default function MapView({ onMapReady }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [37.9838, 23.7275],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Drone marker
    const droneIcon = L.divIcon({
      className: "",
      html: `
        <div style="position:relative;width:32px;height:32px;">
          <div style="
            position:absolute;inset:0;border-radius:50%;
            background:rgba(255,100,0,0.2);
            animation:ping-slow 2s cubic-bezier(0,0,0.2,1) infinite;
          "></div>
          <div style="
            position:absolute;inset:4px;border-radius:50%;
            background:rgba(255,100,0,0.35);
          "></div>
          <div style="
            position:absolute;inset:8px;border-radius:50%;
            background:#ff6400;display:flex;align-items:center;justify-content:center;
          ">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L6 8H9V16H6L12 22L18 16H15V8H18L12 2Z"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([37.986, 23.728], { icon: droneIcon })
      .addTo(map)
      .bindPopup("<b>UAV-001</b><br/>Active • 769m alt");

    mapRef.current = map;
    onMapReady(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onMapReady]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      style={{ paddingTop: "41px" }}
    />
  );
}
