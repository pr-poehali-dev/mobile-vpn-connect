import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Tab, ConnectionState, SERVERS, HISTORY } from "@/components/vpn/types";
import ConnectTab, { EncryptBG, HexGrid } from "@/components/vpn/ConnectTab";
import ServersTab from "@/components/vpn/ServersTab";
import HistoryTab from "@/components/vpn/HistoryTab";
import SettingsTab from "@/components/vpn/SettingsTab";

export default function Index() {
  const [tab, setTab] = useState<Tab>("connect");
  const [connState, setConnState] = useState<ConnectionState>("disconnected");
  const [selectedServer, setSelectedServer] = useState(SERVERS[0]);
  const [filterRegion, setFilterRegion] = useState<string>("Все");
  const [timer, setTimer] = useState(0);
  const [ip, setIp] = useState("—");
  const [protocol, setProtocol] = useState<"WireGuard" | "OpenVPN" | "Auto">("Auto");
  const [killSwitch, setKillSwitch] = useState(false);
  const [autoConnect, setAutoConnect] = useState(true);
  const [dnsLeak, setDnsLeak] = useState(true);
  const [splitTunnel, setSplitTunnel] = useState(false);

  const regions = ["Все", ...Array.from(new Set(SERVERS.map((s) => s.region)))];

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

  const handleSelectServer = (server: typeof SERVERS[0]) => {
    setSelectedServer(server);
    if (connState === "connected") {
      setConnState("connecting");
      setTimeout(() => setConnState("connected"), 1500);
    }
    setTab("connect");
  };

  const navItems = [
    { id: "connect", label: "Главная", icon: "Zap" },
    { id: "servers", label: "Серверы", icon: "Globe" },
    { id: "history", label: "История", icon: "Activity" },
    { id: "settings", label: "Настройки", icon: "Settings" },
  ] as const;

  return (
    <div className="mobile-app scanline" style={{ background: "var(--vpn-dark)" }}>
      <EncryptBG />
      <HexGrid />

      <div className="relative z-10 flex flex-col h-full">
        {/* Status bar spacer */}
        <div className="safe-top" />

        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://cdn.poehali.dev/projects/a460c5c5-e480-402f-8479-c60092ef636c/files/8e831d8c-0e7b-4b6f-92f8-a898e5e80c6f.jpg"
                alt="I VPN"
                className="w-10 h-10 rounded-xl object-cover"
                style={{ boxShadow: "0 0 16px rgba(0,255,136,0.25)" }}
              />
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: connState === "connected" ? "#00ff88" : connState === "connecting" ? "#fbbf24" : "#64748b",
                      boxShadow: connState === "connected" ? "0 0 8px rgba(0,255,136,0.8)" : "none",
                    }}
                  />
                  <span className="font-mono-vpn text-[10px] tracking-[0.3em] text-green-400 uppercase">I VPN</span>
                </div>
                <h1 className="text-white text-base font-semibold tracking-tight leading-none">
                  {tab === "connect" && "Подключение"}
                  {tab === "servers" && "Серверы"}
                  {tab === "history" && "История"}
                  {tab === "settings" && "Настройки"}
                </h1>
              </div>
            </div>

            {/* Connection status badge */}
            <div
              className="px-3 py-1 rounded-full text-xs font-mono-vpn"
              style={{
                background: connState === "connected" ? "rgba(0,255,136,0.12)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${connState === "connected" ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.06)"}`,
                color: connState === "connected" ? "#00ff88" : connState === "connecting" ? "#fbbf24" : "#64748b",
              }}
            >
              {connState === "connected" ? "ONLINE" : connState === "connecting" ? "..." : "OFF"}
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-2">
          {tab === "connect" && (
            <ConnectTab
              connState={connState}
              selectedServer={selectedServer}
              timer={timer}
              ip={ip}
              onToggle={handleToggle}
              formatTimer={formatTimer}
            />
          )}
          {tab === "servers" && (
            <ServersTab
              servers={SERVERS}
              selectedServer={selectedServer}
              filterRegion={filterRegion}
              regions={regions}
              connState={connState}
              onFilterChange={setFilterRegion}
              onSelectServer={handleSelectServer}
            />
          )}
          {tab === "history" && (
            <HistoryTab history={HISTORY} />
          )}
          {tab === "settings" && (
            <SettingsTab
              protocol={protocol}
              killSwitch={killSwitch}
              autoConnect={autoConnect}
              dnsLeak={dnsLeak}
              splitTunnel={splitTunnel}
              onProtocolChange={setProtocol}
              onKillSwitchChange={setKillSwitch}
              onAutoConnectChange={setAutoConnect}
              onDnsLeakChange={setDnsLeak}
              onSplitTunnelChange={setSplitTunnel}
            />
          )}
        </div>

        {/* Bottom Tab Bar */}
        <div
          className="flex-shrink-0 px-2 pt-2 pb-safe"
          style={{
            background: "linear-gradient(to top, var(--vpn-dark) 80%, transparent)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex">
            {navItems.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className="flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all duration-200 touch-target"
                  style={{
                    background: active ? "rgba(0,255,136,0.08)" : "transparent",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <div
                    style={{
                      color: active ? "#00ff88" : "#4a5568",
                      filter: active ? "drop-shadow(0 0 6px rgba(0,255,136,0.6))" : "none",
                    }}
                  >
                    <Icon name={item.icon} size={20} />
                  </div>
                  <span
                    className="text-[10px] font-medium tracking-wide"
                    style={{ color: active ? "#00ff88" : "#4a5568" }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
