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

  return (
    <div className="min-h-screen scanline" style={{ background: "var(--vpn-dark)" }}>
      <EncryptBG />
      <HexGrid />

      <div className="relative z-10 max-w-sm mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <div className="px-5 pt-10 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://cdn.poehali.dev/projects/a460c5c5-e480-402f-8479-c60092ef636c/files/8e831d8c-0e7b-4b6f-92f8-a898e5e80c6f.jpg"
                alt="I VPN"
                className="w-12 h-12 rounded-xl object-cover"
                style={{ boxShadow: "0 0 16px rgba(0,255,136,0.25)" }}
              />
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div
                    className="w-2 h-2 rounded-full bg-green-400"
                    style={{ boxShadow: "0 0 8px rgba(0,255,136,0.8)" }}
                  />
                  <span className="font-mono-vpn text-[10px] tracking-[0.4em] text-green-400 uppercase">
                    I VPN
                  </span>
                </div>
                <h1 className="text-white text-xl font-semibold tracking-tight">Панель управления</h1>
              </div>
            </div>
            <button
              onClick={() => setTab("settings")}
              className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
                tab === "settings"
                  ? "bg-green-500/20 border-green-500/40 text-green-400"
                  : "bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.08] text-slate-400"
              }`}
            >
              <Icon name="Settings" size={16} />
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
      </div>
    </div>
  );
}
