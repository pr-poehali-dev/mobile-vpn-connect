import Icon from "@/components/ui/icon";
import { ConnectionState, Server } from "./types";

const ENCRYPT_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;':\",./<>?";

export function EncryptBG() {
  const chars = Array.from({ length: 300 }, () =>
    ENCRYPT_CHARS[Math.floor(Math.random() * ENCRYPT_CHARS.length)]
  );
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.035] select-none">
      <div className="animate-encrypt-scroll font-mono-vpn text-[10px] leading-4 text-green-400 whitespace-pre-wrap break-all p-4">
        {[...chars, ...chars].join(" ")}
      </div>
    </div>
  );
}

export function HexGrid() {
  return (
    <div className="fixed inset-0 pointer-events-none opacity-[0.05]">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hex" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
            <polygon points="28,4 52,16 52,40 28,52 4,40 4,16" fill="none" stroke="#00ff88" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex)"/>
      </svg>
    </div>
  );
}

function ConnectionOrb({ state, onToggle }: { state: ConnectionState; onToggle: () => void }) {
  const isConnected = state === "connected";
  const isConnecting = state === "connecting";

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        onClick={onToggle}
        className="relative w-44 h-44 rounded-full cursor-pointer group focus:outline-none"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {isConnected && (
          <>
            <div
              className="absolute inset-0 rounded-full animate-pulse-ring-outer"
              style={{ background: "radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 70%)" }}
            />
            <div
              className="absolute inset-4 rounded-full animate-pulse-ring"
              style={{ border: "1px solid rgba(0,255,136,0.3)" }}
            />
          </>
        )}
        {isConnecting && (
          <div
            className="absolute inset-0 rounded-full animate-spin-slow"
            style={{ border: "2px solid transparent", borderTopColor: "#00ff88", borderRightColor: "#00ff88" }}
          />
        )}
        <div
          className={`absolute inset-6 rounded-full flex items-center justify-center transition-all duration-700 ${
            isConnected
              ? "bg-gradient-to-br from-green-900/80 to-green-950/90 shadow-[0_0_60px_rgba(0,255,136,0.3),inset_0_0_30px_rgba(0,255,136,0.1)]"
              : isConnecting
              ? "bg-gradient-to-br from-yellow-900/60 to-slate-900/90"
              : "bg-gradient-to-br from-slate-800/80 to-slate-900/90 group-hover:from-slate-700/80"
          }`}
          style={{
            border: `1px solid ${
              isConnected ? "rgba(0,255,136,0.5)" : isConnecting ? "rgba(255,200,0,0.3)" : "rgba(255,255,255,0.08)"
            }`,
          }}
        >
          <div
            className={`transition-all duration-500 ${
              isConnected ? "text-green-400" : isConnecting ? "text-yellow-400" : "text-slate-400 group-hover:text-slate-300"
            }`}
          >
            <Icon
              name={isConnecting ? "Loader2" : isConnected ? "ShieldCheck" : "Shield"}
              size={48}
              className={isConnecting ? "animate-spin" : ""}
            />
          </div>
        </div>
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.04) 0%, transparent 60%)" }}
        />
      </button>

      <div className="text-center">
        <p
          className={`font-mono-vpn text-xs tracking-[0.3em] uppercase mb-1 transition-colors duration-500 ${
            isConnected ? "text-green-400 glow-text" : isConnecting ? "text-yellow-400" : "text-slate-500"
          }`}
        >
          {isConnected ? "● ЗАЩИЩЕНО" : isConnecting ? "◌ ПОДКЛЮЧЕНИЕ..." : "○ НЕ ЗАЩИЩЕНО"}
        </p>
        <p className="text-slate-400 text-sm font-mono-vpn">
          {isConnected ? "нажмите для отключения" : "нажмите для подключения"}
        </p>
      </div>
    </div>
  );
}

interface ConnectTabProps {
  connState: ConnectionState;
  selectedServer: Server;
  timer: number;
  ip: string;
  onToggle: () => void;
  formatTimer: (s: number) => string;
}

export default function ConnectTab({ connState, selectedServer, timer, ip, onToggle, formatTimer }: ConnectTabProps) {
  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in-up">
      <ConnectionOrb state={connState} onToggle={onToggle} />

      {/* Stats row */}
      <div className="w-full grid grid-cols-3 gap-2">
        {[
          {
            label: "ВРЕМЯ",
            value: connState === "connected" ? formatTimer(timer) : "--:--:--",
            icon: "Clock",
          },
          {
            label: "ПРОТОКОЛ",
            value: selectedServer.protocol === "WireGuard" ? "WG" : "OVPN",
            icon: "Lock",
          },
          {
            label: "ПИНГ",
            value: connState === "connected" ? `${selectedServer.ping}мс` : "---",
            icon: "Activity",
          },
        ].map((s, i) => (
          <div key={i} className="rounded-xl p-3 text-center border border-white/[0.05] bg-white/[0.02]">
            <Icon name={s.icon} size={14} className="text-slate-500 mx-auto mb-1.5" />
            <p className="font-mono-vpn text-white text-sm font-medium">{s.value}</p>
            <p className="font-mono-vpn text-[9px] text-slate-600 tracking-widest mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* IP Info */}
      <div className="w-full rounded-xl p-4 border border-white/[0.05] bg-white/[0.02]">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono-vpn text-[10px] text-slate-500 tracking-widest">СЕТЕВАЯ ИНФОРМАЦИЯ</span>
          <div
            className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
              connState === "connected" ? "bg-green-400" : connState === "connecting" ? "bg-yellow-400" : "bg-slate-600"
            }`}
            style={connState === "connected" ? { boxShadow: "0 0 6px rgba(0,255,136,0.8)" } : {}}
          />
        </div>
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-xs">IP-адрес</span>
            <span className="font-mono-vpn text-xs text-white">{ip}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-xs">Сервер</span>
            <span className="font-mono-vpn text-xs text-white">
              {selectedServer.flag} {selectedServer.city}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-xs">Шифрование</span>
            <span className="font-mono-vpn text-xs text-green-400">AES-256-GCM</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-xs">DNS-утечка</span>
            <span className={`font-mono-vpn text-xs ${connState === "connected" ? "text-green-400" : "text-slate-500"}`}>
              {connState === "connected" ? "ЗАЩИЩЕНО" : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
