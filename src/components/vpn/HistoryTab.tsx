import Icon from "@/components/ui/icon";
import { LogEntry } from "./types";

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
                entry.status === "success" ? "text-green-400 bg-green-950/50" : "text-red-400 bg-red-950/50"
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

interface HistoryTabProps {
  history: LogEntry[];
}

export default function HistoryTab({ history }: HistoryTabProps) {
  return (
    <div className="animate-fade-in-up">
      <div className="grid grid-cols-2 gap-2 mb-5">
        {[
          { label: "Сессий", value: "47", sub: "за месяц" },
          { label: "Передано", value: "128 ГБ", sub: "всего" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl p-4 border border-white/[0.05] bg-white/[0.02]">
            <p className="text-white text-2xl font-semibold">{s.value}</p>
            <p className="text-slate-400 text-sm">{s.label}</p>
            <p className="font-mono-vpn text-[10px] text-slate-600 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="font-mono-vpn text-[10px] text-slate-500 tracking-widest">ПОСЛЕДНИЕ СЕССИИ</span>
        <button className="font-mono-vpn text-[10px] text-slate-600 hover:text-red-400 transition-colors">
          ОЧИСТИТЬ
        </button>
      </div>

      <div className="space-y-2">
        {history.map((entry, i) => (
          <HistoryRow key={entry.id} entry={entry} delay={i * 80} />
        ))}
      </div>
    </div>
  );
}
