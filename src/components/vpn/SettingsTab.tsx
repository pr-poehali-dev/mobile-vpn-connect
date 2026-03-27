import { useState, useRef, useEffect, useCallback } from "react";
import jsQR from "jsqr";
import Icon from "@/components/ui/icon";
import { VlessConfig } from "./types";

function parseVlessName(raw: string): string {
  try {
    const hashIdx = raw.lastIndexOf("#");
    if (hashIdx !== -1) return decodeURIComponent(raw.slice(hashIdx + 1));
    const url = new URL(raw);
    return url.hostname || "VLESS сервер";
  } catch {
    return "VLESS сервер";
  }
}

interface QrScannerProps {
  onDetected: (text: string) => void;
  onClose: () => void;
}

function QrScanner({ onDetected, onClose }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const [status, setStatus] = useState<"loading" | "scanning" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const scan = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scan);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code?.data) {
      onDetected(code.data);
      return;
    }
    rafRef.current = requestAnimationFrame(scan);
  }, [onDetected]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setStatus("scanning");
        rafRef.current = requestAnimationFrame(scan);
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("Нет доступа к камере. Разрешите доступ в настройках браузера.");
      });
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [scan]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-4">
        <span className="font-mono-vpn text-[10px] tracking-[0.3em] text-green-400 uppercase">
          СКАНИРОВАНИЕ QR
        </span>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <Icon name="X" size={20} />
        </button>
      </div>

      {/* Viewfinder */}
      <div className="flex-1 relative flex items-center justify-center px-6">
        {status === "error" ? (
          <div className="text-center">
            <Icon name="CameraOff" size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">{errorMsg}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full max-w-xs rounded-2xl object-cover"
              style={{ maxHeight: "60vh" }}
              muted
              playsInline
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Corner frame overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-56 h-56">
                {[
                  "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
                  "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
                  "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
                  "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
                ].map((cls, i) => (
                  <div key={i} className={`absolute w-8 h-8 border-green-400 ${cls}`} />
                ))}
                {status === "scanning" && (
                  <div
                    className="absolute left-2 right-2 h-px bg-green-400 opacity-70"
                    style={{
                      top: "50%",
                      boxShadow: "0 0 8px rgba(0,255,136,0.8)",
                      animation: "scan-line 2s ease-in-out infinite",
                    }}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <p className="text-center font-mono-vpn text-[11px] text-slate-500 pb-10 pt-4 px-8">
        {status === "loading" && "Запуск камеры..."}
        {status === "scanning" && "Наведите камеру на QR-код с VLESS-ссылкой"}
        {status === "error" && "Используйте ручной ввод ссылки"}
      </p>

      <style>{`
        @keyframes scan-line {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>
  );
}

interface VlessSectionProps {
  configs: VlessConfig[];
  onAdd: (config: VlessConfig) => void;
  onRemove: (id: string) => void;
}

function VlessSection({ configs, onAdd, onRemove }: VlessSectionProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const saveConfig = (raw: string) => {
    if (!raw.startsWith("vless://")) {
      setError("Ссылка должна начинаться с vless://");
      return false;
    }
    const config: VlessConfig = {
      id: Date.now().toString(),
      name: parseVlessName(raw),
      raw,
      addedAt: new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long" }),
    };
    onAdd(config);
    return true;
  };

  const handleAdd = () => {
    if (saveConfig(input.trim())) {
      setInput("");
      setError("");
      setShowInput(false);
    }
  };

  const handleQRDetected = (text: string) => {
    setShowScanner(false);
    if (saveConfig(text)) {
      setError("");
    } else {
      setShowInput(true);
      setInput(text);
      setError("QR не содержит VLESS-ссылку. Проверьте данные.");
    }
  };

  const handleImageQR = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.src = ev.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code?.data) {
          handleQRDetected(code.data);
        } else {
          setShowInput(true);
          setError("QR-код не распознан. Попробуйте ввести ссылку вручную.");
        }
      };
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <>
      {showScanner && (
        <QrScanner onDetected={handleQRDetected} onClose={() => setShowScanner(false)} />
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono-vpn text-[10px] text-slate-500 tracking-widest">VLESS КОНФИГУРАЦИИ</p>
          <button
            onClick={() => { setShowInput(!showInput); setError(""); }}
            className="font-mono-vpn text-[10px] text-green-400 hover:text-green-300 transition-colors"
          >
            + ДОБАВИТЬ
          </button>
        </div>

        {showInput && (
          <div className="mb-3 rounded-xl border border-green-500/20 bg-green-950/10 p-3 space-y-2 animate-fade-in-up">
            <p className="font-mono-vpn text-[10px] text-slate-500 tracking-widest mb-1">ВСТАВЬТЕ VLESS-ССЫЛКУ</p>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(""); }}
              placeholder="vless://uuid@host:port?..."
              rows={3}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs font-mono-vpn placeholder-slate-600 focus:outline-none focus:border-green-500/40 resize-none"
            />
            {error && <p className="font-mono-vpn text-[10px] text-red-400">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 py-2 rounded-lg bg-green-500/20 border border-green-500/40 text-green-400 font-mono-vpn text-xs hover:bg-green-500/30 transition-colors"
              >
                СОХРАНИТЬ
              </button>
              <button
                onClick={() => setShowScanner(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-green-400 font-mono-vpn text-xs hover:bg-white/[0.08] transition-colors"
              >
                <Icon name="Camera" size={13} />
                КАМЕРА
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-400 font-mono-vpn text-xs hover:bg-white/[0.08] transition-colors"
              >
                <Icon name="QrCode" size={13} />
                ФОТО
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageQR} />
            </div>
          </div>
        )}

        {!showInput && configs.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.01] px-4 py-6 text-center">
            <div className="flex justify-center gap-3 mb-3">
              <button
                onClick={() => setShowScanner(true)}
                className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
              >
                <Icon name="Camera" size={20} className="text-green-400" />
                <span className="font-mono-vpn text-[10px] text-slate-400">КАМЕРА</span>
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
              >
                <Icon name="QrCode" size={20} className="text-slate-400" />
                <span className="font-mono-vpn text-[10px] text-slate-400">ФОТО QR</span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageQR} />
            </div>
            <p className="text-slate-500 text-sm">Нет конфигураций</p>
            <p className="font-mono-vpn text-[10px] text-slate-600 mt-1">Сканируйте QR или нажмите «+ ДОБАВИТЬ»</p>
          </div>
        )}

        {configs.length > 0 && (
          <div className="space-y-1.5">
            {configs.map((cfg) => (
              <div
                key={cfg.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.05] bg-white/[0.02]"
              >
                <div className="w-8 h-8 rounded-lg bg-green-950/40 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon name="Link" size={14} className="text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{cfg.name}</p>
                  <p className="font-mono-vpn text-[10px] text-slate-500 truncate">{cfg.raw.slice(0, 40)}…</p>
                  <p className="font-mono-vpn text-[10px] text-slate-600">Добавлено {cfg.addedAt}</p>
                </div>
                <button
                  onClick={() => onRemove(cfg.id)}
                  className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

interface SettingsTabProps {
  protocol: "WireGuard" | "OpenVPN" | "Auto";
  killSwitch: boolean;
  autoConnect: boolean;
  dnsLeak: boolean;
  splitTunnel: boolean;
  onProtocolChange: (p: "WireGuard" | "OpenVPN" | "Auto") => void;
  onKillSwitchChange: (v: boolean) => void;
  onAutoConnectChange: (v: boolean) => void;
  onDnsLeakChange: (v: boolean) => void;
  onSplitTunnelChange: (v: boolean) => void;
}

export default function SettingsTab({
  protocol,
  killSwitch,
  autoConnect,
  dnsLeak,
  splitTunnel,
  onProtocolChange,
  onKillSwitchChange,
  onAutoConnectChange,
  onDnsLeakChange,
  onSplitTunnelChange,
}: SettingsTabProps) {
  const [configs, setConfigs] = useState<VlessConfig[]>([]);

  const handleAdd = (cfg: VlessConfig) => setConfigs((prev) => [cfg, ...prev]);
  const handleRemove = (id: string) => setConfigs((prev) => prev.filter((c) => c.id !== id));

  const toggleItems = [
    { label: "Kill Switch", sub: "Блокировать трафик при разрыве VPN", value: killSwitch, set: onKillSwitchChange, icon: "ShieldOff" },
    { label: "Защита от DNS-утечек", sub: "Использовать зашифрованный DNS", value: dnsLeak, set: onDnsLeakChange, icon: "Eye" },
    { label: "Автоподключение", sub: "Подключаться при запуске приложения", value: autoConnect, set: onAutoConnectChange, icon: "Wifi" },
    { label: "Split Tunneling", sub: "Выбрать приложения для VPN", value: splitTunnel, set: onSplitTunnelChange, icon: "GitBranch" },
  ];

  return (
    <div className="animate-fade-in-up space-y-5">

      {/* VLESS конфиги */}
      <VlessSection configs={configs} onAdd={handleAdd} onRemove={handleRemove} />

      {/* Protocol */}
      <div>
        <p className="font-mono-vpn text-[10px] text-slate-500 tracking-widest mb-3">ПРОТОКОЛ ПОДКЛЮЧЕНИЯ</p>
        <div className="space-y-1.5">
          {(["Auto", "WireGuard", "OpenVPN"] as const).map((p) => (
            <button
              key={p}
              onClick={() => onProtocolChange(p)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 ${
                protocol === p
                  ? "border-green-500/50 bg-green-950/30"
                  : "border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                  protocol === p ? "border-green-400" : "border-slate-600"
                }`}>
                  {protocol === p && <div className="w-2 h-2 rounded-full bg-green-400" />}
                </div>
                <div className="text-left">
                  <p className="text-white text-sm font-medium">{p === "Auto" ? "Авто" : p}</p>
                  <p className="font-mono-vpn text-[10px] text-slate-500">
                    {p === "Auto" && "Лучший протокол автоматически"}
                    {p === "WireGuard" && "Быстрый · Современный · UDP"}
                    {p === "OpenVPN" && "Надёжный · TCP/UDP · Проверенный"}
                  </p>
                </div>
              </div>
              {protocol === p && <Icon name="Check" size={14} className="text-green-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Security toggles */}
      <div>
        <p className="font-mono-vpn text-[10px] text-slate-500 tracking-widest mb-3">БЕЗОПАСНОСТЬ</p>
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] divide-y divide-white/[0.04]">
          {toggleItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Icon name={item.icon} size={15} className="text-slate-500" />
                <div>
                  <p className="text-white text-sm">{item.label}</p>
                  <p className="font-mono-vpn text-[10px] text-slate-600">{item.sub}</p>
                </div>
              </div>
              <button
                onClick={() => item.set(!item.value)}
                className={`rounded-full relative transition-all duration-300 flex-shrink-0 ${
                  item.value ? "bg-green-500/80" : "bg-white/10"
                }`}
                style={{ width: 40, height: 22 }}
              >
                <div
                  className="absolute top-0.5 rounded-full bg-white transition-all duration-300 shadow-sm"
                  style={{ width: 18, height: 18, left: item.value ? 18 : 2 }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* App info */}
      <div>
        <p className="font-mono-vpn text-[10px] text-slate-500 tracking-widest mb-3">О ПРИЛОЖЕНИИ</p>
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] divide-y divide-white/[0.04]">
          {[
            { label: "Версия", value: "1.0.0" },
            { label: "Лицензия", value: "Premium" },
            { label: "Последнее обновление", value: "27 марта 2026" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between px-4 py-3">
              <span className="text-slate-400 text-sm">{row.label}</span>
              <span className="font-mono-vpn text-xs text-white">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full py-3 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm font-medium hover:bg-red-950/40 transition-colors">
        Выйти из аккаунта
      </button>
    </div>
  );
}