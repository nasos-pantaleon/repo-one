import { Plus, Minus, MapPin } from "lucide-react";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate: () => void;
}

export default function MapControls({ onZoomIn, onZoomOut, onLocate }: MapControlsProps) {
  return (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-1">
      <ControlButton onClick={onZoomIn} title="Zoom in">
        <Plus size={16} strokeWidth={2.5} />
      </ControlButton>
      <ControlButton onClick={onZoomOut} title="Zoom out">
        <Minus size={16} strokeWidth={2.5} />
      </ControlButton>
      <div className="my-1 border-t border-gray-200" />
      <ControlButton onClick={onLocate} title="Go to location">
        <MapPin size={15} />
      </ControlButton>
    </div>
  );
}

function ControlButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors border border-gray-200"
    >
      {children}
    </button>
  );
}
