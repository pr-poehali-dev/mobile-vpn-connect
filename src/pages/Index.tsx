import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

type Tab = "connect" | "servers" | "history";
type ConnectionState = "disconnected" | "connecting" | "connected";

interface Server {
  id: string;
  country: string;
  city: string;
  flag: string;
  ping: number;
  load: number;
  region: string;
  protocol: string;
}

interface LogEntry {
  id: string;
  server: string;
  flag: string;
  start: string;
  duration: string;
  dataIn: string;
  dataOut: string;
  status: "success" | "interrupted";
}

const SERVERS: Server[] = [
  { id: "1", country: "Нидерланды", city: "Амстердам", flag: "🇳🇱", ping: 28, load: 34, region: "Европа", protocol: "WireGuard" },
  { id: "2", country: "Нидерланды", city: "Роттердам", flag: "🇳🇱", ping: 31, load: 24, region: "Европа", protocol: "WireGuard" },
  { id: "3", country: "Германия", city: "Франкфурт", flag: "🇩🇪", ping: 35, load: 61, region: "Европа", protocol: "OpenVPN" },
  { id: "4", country: "США", city: "Нью-Йорк", flag: "🇺🇸", ping: 112, load: 78, region: "Америка", protocol: "OpenVPN" },
  { id: "5", country: "Япония", city: "Токио", flag: "🇯🇵", ping: 198, load: 30, region: "Азия", protocol: "WireGuard" },
];

const HISTORY: LogEntry[] = [
  { id: "1", server: "Амстердам, Нидерланды", flag: "🇳🇱", start: "Сегодня, 14:23", duration: "2ч 41м", dataIn: "1.2 ГБ", dataOut: "340 МБ", status: "success" },
  { id: "2", server: "Франкфурт, Германия", flag: "🇩🇪", start: "Сегодня, 09:10", duration: "47м", dataIn: "230 МБ", dataOut: "89 МБ", status: "success" },
  { id: "3", server: "Токио, Япония", flag: "🇯🇵", start: "Вчера, 22:55", duration: "1ч 18м", dataIn: "870 МБ", dataOut: "210 МБ", status: "interrupted" },
  { id: "4", server: "Нью-Йорк, США", flag: "🇺🇸", start: "Вчера, 18:30", duration: "3ч 02м", dataIn: "2.1 ГБ", dataOut: "540 МБ", status: "success" },
  { id: "5", server: "Хельсинки, Финляндия", flag: "🇫🇮", start: "26 марта, 12:15", duration: "55м", dataIn: "410 МБ", dataOut: "120 МБ", status: "success" },
];

const ENCRYPT_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;':\",./<>?";

function EncryptBG() {
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

function HexGrid() {
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
              isConnected
                ? "rgba(0,255,136,0.5)"
                : isConnecting
                ? "rgba(255,200,0,0.3)"
                : "rgba(255,255,255,0.08)"
            }`,
          }}
        >
          <div
            className={`transition-all duration-500 ${
              isConnected
                ? "text-green-400"
                : isConnecting
                ? "text-yellow-400"
                : "text-slate-400 group-hover:text-slate-300"
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

function ServerCard({
  server,
  selected,
  onSelect,
}: {
  server: Server;
  selected: boolean;
  onSelect: () => void;
}) {
  const loadColor =
    server.load < 40 ? "#00ff88" : server.load < 70 ? "#ffb800" : "#ff4444";
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 border ${
        selected
          ? "border-green-500/50 bg-green-950/30"
          : "border-transparent bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{server.flag}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white text-sm font-medium">{server.city}</span>
            <span className="text-slate-500 text-xs">{server.country}</span>
            {selected && (
              <span className="font-mono-vpn text-[10px] text-green-400 tracking-wider">
                ● ACTIVE
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono-vpn text-xs text-slate-400">{server.ping} мс</span>
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${server.load}%`, backgroundColor: loadColor }}
                />
              </div>
              <span className="font-mono-vpn text-[10px]" style={{ color: loadColor }}>
                {server.load}%
              </span>
            </div>
            <span className="text-[10px] text-slate-600 font-mono-vpn">{server.protocol}</span>
          </div>
        </div>
        <Icon
          name="ChevronRight"
          size={14}
          className={`transition-opacity ${
            selected ? "opacity-100 text-green-400" : "opacity-30 text-slate-400"
          }`}
        />
      </div>
    </button>
  );
}

function HistoryRow({ entry, delay }: { entry: LogEntry; delay: number }) {
  return (
    <div
      className="px-4 py-3 rounded-lg bg-white/[0.02] border border-white/[0.04] animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">{entry.flag}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-white text-sm font-medium">{entry.server}</span>
            <span
              className={`font-mono-vpn text-[10px] tracking-wider px-1.5 py-0.5 rounded ${
                entry.status === "success"
                  ? "text-green-400 bg-green-950/50"
                  : "text-red-400 bg-red-950/50"
              }`}
            >
              {entry.status === "success" ? "✓ УСПЕШНО" : "✗ ПРЕРВАНО"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div className="flex items-center gap-1.5">
              <Icon name="Clock" size={11} className="text-slate-600" />
              <span className="font-mono-vpn text-xs text-slate-400">{entry.start}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon name="Timer" size={11} className="text-slate-600" />
              <span className="font-mono-vpn text-xs text-slate-400">{entry.duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon name="ArrowDown" size={11} className="text-green-600" />
              <span className="font-mono-vpn text-xs text-slate-400">{entry.dataIn}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon name="ArrowUp" size={11} className="text-cyan-600" />
              <span className="font-mono-vpn text-xs text-slate-400">{entry.dataOut}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const [tab, setTab] = useState<Tab>("connect");
  const [connState, setConnState] = useState<ConnectionState>("disconnected");
  const [selectedServer, setSelectedServer] = useState<Server>(SERVERS[0]);
  const [filterRegion, setFilterRegion] = useState<string>("Все");
  const [timer, setTimer] = useState(0);
  const [ip, setIp] = useState("—");

  const regions = ["Все", ...Array.from(new Set(SERVERS.map((s) => s.region)))];
  const filtered =
    filterRegion === "Все" ? SERVERS : SERVERS.filter((s) => s.region === filterRegion);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (connState === "connected") {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [connState]);

  const formatTimer = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const handleToggle = () => {
    if (connState === "disconnected") {
      setConnState("connecting");
      setTimeout(() => {
        setConnState("connected");
        setIp(
          `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        );
      }, 2000);
    } else {
      setConnState("disconnected");
      setIp("—");
    }
  };

  return (
    <div className="min-h-screen scanline" style={{ background: "var(--vpn-dark)" }}>
      <EncryptBG />
      <HexGrid />

      <div className="relative z-10 max-w-sm mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <div className="px-5 pt-10 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div
                  className="w-2 h-2 rounded-full bg-green-400"
                  style={{ boxShadow: "0 0 8px rgba(0,255,136,0.8)" }}
                />
                <span className="font-mono-vpn text-[10px] tracking-[0.4em] text-green-400 uppercase">
                  SecureVPN
                </span>
              </div>
              <h1 className="text-white text-xl font-semibold tracking-tight">Панель управления</h1>
            </div>
            <button className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors">
              <Icon name="Settings" size={16} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 mb-6">
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            {(
              [
                { id: "connect", label: "Подключение", icon: "Zap" },
                { id: "servers", label: "Серверы", icon: "Globe" },
                { id: "history", label: "История", icon: "Activity" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  tab === t.id
                    ? "bg-green-500/20 text-green-400 shadow-[inset_0_0_20px_rgba(0,255,136,0.1)]"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Icon name={t.icon} size={12} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-5 pb-8 overflow-y-auto">
          {/* CONNECT TAB */}
          {tab === "connect" && (
            <div className="flex flex-col items-center gap-6 animate-fade-in-up">
              <ConnectionOrb state={connState} onToggle={handleToggle} />

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
                  <div
                    key={i}
                    className="rounded-xl p-3 text-center border border-white/[0.05] bg-white/[0.02]"
                  >
                    <Icon name={s.icon} size={14} className="text-slate-500 mx-auto mb-1.5" />
                    <p className="font-mono-vpn text-white text-sm font-medium">{s.value}</p>
                    <p className="font-mono-vpn text-[9px] text-slate-600 tracking-widest mt-0.5">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* IP Info */}
              <div className="w-full rounded-xl p-4 border border-white/[0.05] bg-white/[0.02]">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono-vpn text-[10px] text-slate-500 tracking-widest">
                    СЕТЕВАЯ ИНФОРМАЦИЯ
                  </span>
                  <div
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                      connState === "connected"
                        ? "bg-green-400"
                        : connState === "connecting"
                        ? "bg-yellow-400"
                        : "bg-slate-600"
                    }`}
                    style={
                      connState === "connected"
                        ? { boxShadow: "0 0 6px rgba(0,255,136,0.8)" }
                        : {}
                    }
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
                    <span
                      className={`font-mono-vpn text-xs ${
                        connState === "connected" ? "text-green-400" : "text-slate-500"
                      }`}
                    >
                      {connState === "connected" ? "ЗАЩИЩЕНО" : "—"}
                    </span>
                  </div>
                </div>
              </div>


            </div>
          )}

          {/* SERVERS TAB */}
          {tab === "servers" && (
            <div className="animate-fade-in-up">
              <div className="flex gap-1.5 mb-4 flex-wrap">
                {regions.map((r) => (
                  <button
                    key={r}
                    onClick={() => setFilterRegion(r)}
                    className={`px-3 py-1 rounded-full font-mono-vpn text-xs transition-all duration-200 border ${
                      filterRegion === r
                        ? "bg-green-500/20 text-green-400 border-green-500/40"
                        : "bg-white/[0.03] text-slate-500 border-white/[0.06] hover:text-slate-300"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                {filtered.map((server, i) => (
                  <div
                    key={server.id}
                    className="animate-slide-in"
                    style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}
                  >
                    <ServerCard
                      server={server}
                      selected={selectedServer.id === server.id}
                      onSelect={() => {
                        setSelectedServer(server);
                        if (connState === "connected") {
                          setConnState("connecting");
                          setTimeout(() => setConnState("connected"), 1500);
                        }
                        setTab("connect");
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-xl border border-white/[0.04] bg-white/[0.02]">
                <p className="font-mono-vpn text-[10px] text-slate-600 text-center tracking-wider">
                  {filtered.length} СЕРВЕРОВ · ОБНОВЛЕНО ТОЛЬКО ЧТО
                </p>
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {tab === "history" && (
            <div className="animate-fade-in-up">
              <div className="grid grid-cols-2 gap-2 mb-5">
                {[
                  { label: "Сессий", value: "47", sub: "за месяц" },
                  { label: "Передано", value: "128 ГБ", sub: "всего" },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-4 border border-white/[0.05] bg-white/[0.02]"
                  >
                    <p className="text-white text-2xl font-semibold">{s.value}</p>
                    <p className="text-slate-400 text-sm">{s.label}</p>
                    <p className="font-mono-vpn text-[10px] text-slate-600 mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="font-mono-vpn text-[10px] text-slate-500 tracking-widest">
                  ПОСЛЕДНИЕ СЕССИИ
                </span>
                <button className="font-mono-vpn text-[10px] text-slate-600 hover:text-red-400 transition-colors">
                  ОЧИСТИТЬ
                </button>
              </div>

              <div className="space-y-2">
                {HISTORY.map((entry, i) => (
                  <HistoryRow key={entry.id} entry={entry} delay={i * 80} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}