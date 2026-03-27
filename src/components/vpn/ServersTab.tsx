import Icon from "@/components/ui/icon";
import { Server, ConnectionState } from "./types";

function ServerCard({
  server,
  selected,
  onSelect,
}: {
  server: Server;
  selected: boolean;
  onSelect: () => void;
}) {
  const loadColor = server.load < 40 ? "#00ff88" : server.load < 70 ? "#ffb800" : "#ff4444";
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
              <span className="font-mono-vpn text-[10px] text-green-400 tracking-wider">● ACTIVE</span>
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
          className={`transition-opacity ${selected ? "opacity-100 text-green-400" : "opacity-30 text-slate-400"}`}
        />
      </div>
    </button>
  );
}

interface ServersTabProps {
  servers: Server[];
  selectedServer: Server;
  filterRegion: string;
  regions: string[];
  connState: ConnectionState;
  onFilterChange: (region: string) => void;
  onSelectServer: (server: Server) => void;
}

export default function ServersTab({
  servers,
  selectedServer,
  filterRegion,
  regions,
  connState,
  onFilterChange,
  onSelectServer,
}: ServersTabProps) {
  const filtered = filterRegion === "Все" ? servers : servers.filter((s) => s.region === filterRegion);

  return (
    <div className="animate-fade-in-up">
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {regions.map((r) => (
          <button
            key={r}
            onClick={() => onFilterChange(r)}
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
              onSelect={() => onSelectServer(server)}
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
  );
}
