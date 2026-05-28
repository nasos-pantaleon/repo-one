import { useState } from "react";
import { X, Info } from "lucide-react";

type StreamProtocol = "hls" | "flv" | "webrtc" | "raw";

interface StreamConfig {
  url: string;
  protocol: StreamProtocol;
  label: string;
}

interface Props {
  initial: StreamConfig;
  onApply: (config: StreamConfig) => void;
  onClose: () => void;
}

const PROTOCOL_HINTS: Record<StreamProtocol, string> = {
  hls: "http://your-srs-server:8080/live/stream.m3u8",
  flv: "http://your-srs-server:8080/live/stream.flv",
  webrtc: "webrtc://your-srs-server/live/stream",
  raw: "http://your-server/video.mp4",
};

const PROTOCOL_LABELS: Record<StreamProtocol, string> = {
  hls: "HLS (.m3u8)",
  flv: "HTTP-FLV",
  webrtc: "WebRTC (WHEP)",
  raw: "Direct URL",
};

export default function StreamConfigModal({ initial, onApply, onClose }: Props) {
  const [url, setUrl] = useState(initial.url);
  const [protocol, setProtocol] = useState<StreamProtocol>(initial.protocol);
  const [label, setLabel] = useState(initial.label);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply({ url: url.trim(), protocol, label: label.trim() || "CAM-001" });
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Stream Source Configuration</h2>
            <p className="text-xs text-gray-500 mt-0.5">Connect to an SRS or compatible media server</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded p-1 hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          {/* Label */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Camera Label</label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="CAM-001"
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Protocol selector */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Protocol</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(PROTOCOL_LABELS) as StreamProtocol[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProtocol(p)}
                  className={`text-xs px-3 py-2 rounded-md border font-medium transition-colors ${
                    protocol === p
                      ? "bg-blue-600 text-white border-blue-600"
                      : "text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {PROTOCOL_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Stream URL */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Stream URL</label>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder={PROTOCOL_HINTS[protocol]}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Info box */}
          <div className="flex gap-2 bg-blue-50 rounded-lg px-3 py-2.5">
            <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              For <strong>SRS</strong>: use HLS (<code className="font-mono">/live/stream.m3u8</code>) or HTTP-FLV (<code className="font-mono">/live/stream.flv</code>). Ensure CORS is enabled on the server.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Connect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
