import { useRef, useState, useEffect, useCallback } from "react";
import { Settings, Maximize2, Minimize2, X, Play, Square, AlertCircle, Wifi, WifiOff } from "lucide-react";
import StreamConfigModal from "@/components/StreamConfigModal";

type StreamProtocol = "hls" | "flv" | "webrtc" | "raw";

interface StreamConfig {
  url: string;
  protocol: StreamProtocol;
  label: string;
}

const DEFAULT_CONFIG: StreamConfig = {
  url: "",
  protocol: "hls",
  label: "CAM-001",
};

type ConnState = "idle" | "connecting" | "connected" | "error";

export default function VideoPanel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<import("hls.js").default | null>(null);
  const flvPlayerRef = useRef<import("flv.js").Player | null>(null);

  const [config, setConfig] = useState<StreamConfig>(DEFAULT_CONFIG);
  const [connState, setConnState] = useState<ConnState>("idle");
  const [showConfig, setShowConfig] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [timestamp, setTimestamp] = useState(new Date());
  const [coords] = useState({ lat: 37.9838, lng: 23.7275 });

  // Tick timestamp every second
  useEffect(() => {
    const t = setInterval(() => setTimestamp(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const destroyPlayer = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (flvPlayerRef.current) {
      flvPlayerRef.current.destroy();
      flvPlayerRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.src = "";
      videoRef.current.load();
    }
  }, []);

  const startStream = useCallback(async (cfg: StreamConfig) => {
    destroyPlayer();
    if (!cfg.url || !videoRef.current) return;

    setConnState("connecting");

    try {
      if (cfg.protocol === "hls") {
        const Hls = (await import("hls.js")).default;
        if (Hls.isSupported()) {
          const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hlsRef.current = hls;
          hls.loadSource(cfg.url);
          hls.attachMedia(videoRef.current);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoRef.current?.play().catch(() => {});
            setConnState("connected");
          });
          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) setConnState("error");
          });
        } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
          videoRef.current.src = cfg.url;
          videoRef.current.play().catch(() => {});
          setConnState("connected");
        } else {
          setConnState("error");
        }
      } else if (cfg.protocol === "flv") {
        const flvjs = (await import("flv.js")).default;
        if (flvjs.isSupported()) {
          const player = flvjs.createPlayer({
            type: "flv",
            url: cfg.url,
            isLive: true,
          });
          flvPlayerRef.current = player;
          player.attachMediaElement(videoRef.current);
          player.load();
          player.play();
          player.on(flvjs.Events.ERROR, () => setConnState("error"));
          setConnState("connected");
        } else {
          setConnState("error");
        }
      } else if (cfg.protocol === "raw") {
        videoRef.current.src = cfg.url;
        videoRef.current.play().catch(() => {});
        setConnState("connected");
      } else if (cfg.protocol === "webrtc") {
        // WebRTC via SRS whep
        videoRef.current.src = "";
        setConnState("error"); // placeholder — full WebRTC WHEP would go here
      }
    } catch {
      setConnState("error");
    }
  }, [destroyPlayer]);

  const stopStream = useCallback(() => {
    destroyPlayer();
    setConnState("idle");
  }, [destroyPlayer]);

  const handleApply = (cfg: StreamConfig) => {
    setConfig(cfg);
    setShowConfig(false);
    startStream(cfg);
  };

  const panelW = expanded ? "w-[520px]" : "w-[260px]";
  const panelH = expanded ? "h-[292px]" : "h-[146px]";

  const fmtTs = (d: Date) => d.toISOString().replace("T", " ").slice(0, 19);

  return (
    <>
      <div
        className={`video-panel ${panelW} ${panelH} rounded-lg overflow-hidden bg-black border border-white/10 transition-all duration-200 flex flex-col`}
      >
        {/* Video */}
        <div className="relative flex-1 bg-black overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
          />

          {/* Overlay: timestamp + coords */}
          <div className="absolute top-1.5 left-2 text-[9px] font-mono text-white/80 leading-tight pointer-events-none">
            <div>{fmtTs(timestamp)}</div>
            <div>{coords.lat.toFixed(4)}°N {coords.lng.toFixed(4)}°E</div>
          </div>

          {/* Status badge */}
          <div className="absolute top-1.5 right-2">
            <ConnBadge state={connState} />
          </div>

          {/* Label */}
          <div className="absolute bottom-1.5 left-2 text-[9px] font-mono text-white/70 pointer-events-none">
            {config.label}
          </div>

          {/* Idle / error overlay */}
          {(connState === "idle" || connState === "error") && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
              {connState === "error" ? (
                <AlertCircle className="text-red-400 mb-1" size={20} />
              ) : (
                <WifiOff className="text-white/30 mb-1" size={20} />
              )}
              <p className="text-white/50 text-[10px] text-center px-4">
                {connState === "error"
                  ? "Stream error. Check the URL."
                  : 'Configure a stream source\nto begin viewing.'}
              </p>
            </div>
          )}

          {connState === "connecting" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Control bar */}
        <div className="flex items-center justify-between px-2 py-1 bg-gray-900 border-t border-white/10">
          <div className="flex items-center gap-1">
            {connState === "idle" || connState === "error" ? (
              <BarButton onClick={() => config.url ? startStream(config) : setShowConfig(true)} title="Play">
                <Play size={11} />
              </BarButton>
            ) : (
              <BarButton onClick={stopStream} title="Stop">
                <Square size={11} />
              </BarButton>
            )}
            <span className="text-[10px] text-white/50 font-mono truncate max-w-[100px]">
              {config.url ? config.url.slice(0, 22) + (config.url.length > 22 ? "…" : "") : "No source"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <BarButton onClick={() => setShowConfig(true)} title="Settings">
              <Settings size={11} />
            </BarButton>
            <BarButton onClick={() => setExpanded(e => !e)} title={expanded ? "Shrink" : "Expand"}>
              {expanded ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
            </BarButton>
          </div>
        </div>
      </div>

      {showConfig && (
        <StreamConfigModal
          initial={config}
          onApply={handleApply}
          onClose={() => setShowConfig(false)}
        />
      )}
    </>
  );
}

function BarButton({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="text-white/60 hover:text-white p-0.5 rounded transition-colors"
    >
      {children}
    </button>
  );
}

function ConnBadge({ state }: { state: ConnState }) {
  if (state === "connected") {
    return (
      <span className="flex items-center gap-1 bg-black/50 rounded px-1.5 py-0.5 text-[9px] text-green-400 font-medium">
        <Wifi size={8} /> LIVE
      </span>
    );
  }
  if (state === "connecting") {
    return (
      <span className="flex items-center gap-1 bg-black/50 rounded px-1.5 py-0.5 text-[9px] text-yellow-400 font-medium">
        CONNECTING
      </span>
    );
  }
  if (state === "error") {
    return (
      <span className="flex items-center gap-1 bg-black/50 rounded px-1.5 py-0.5 text-[9px] text-red-400 font-medium">
        ERROR
      </span>
    );
  }
  return null;
}
