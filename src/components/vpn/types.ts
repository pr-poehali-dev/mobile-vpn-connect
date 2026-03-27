export type Tab = "connect" | "servers" | "history" | "settings";
export type ConnectionState = "disconnected" | "connecting" | "connected";

export interface Server {
  id: string;
  country: string;
  city: string;
  flag: string;
  ping: number;
  load: number;
  region: string;
  protocol: string;
}

export interface LogEntry {
  id: string;
  server: string;
  flag: string;
  start: string;
  duration: string;
  dataIn: string;
  dataOut: string;
  status: "success" | "interrupted";
}

export interface VlessConfig {
  id: string;
  name: string;
  raw: string;
  addedAt: string;
}

export const SERVERS: Server[] = [
  { id: "1", country: "Нидерланды", city: "Амстердам", flag: "🇳🇱", ping: 28, load: 34, region: "Европа", protocol: "WireGuard" },
  { id: "2", country: "США", city: "Нью-Йорк", flag: "🇺🇸", ping: 112, load: 45, region: "Америка", protocol: "WireGuard" },
  { id: "3", country: "Чехия", city: "Прага", flag: "🇨🇿", ping: 32, load: 28, region: "Европа", protocol: "WireGuard" },
  { id: "4", country: "Германия", city: "Франкфурт", flag: "🇩🇪", ping: 35, load: 51, region: "Европа", protocol: "WireGuard" },
  { id: "5", country: "Польша", city: "Варшава", flag: "🇵🇱", ping: 30, load: 22, region: "Европа", protocol: "WireGuard" },
  { id: "6", country: "Великобритания", city: "Лондон", flag: "🇬🇧", ping: 42, load: 60, region: "Европа", protocol: "WireGuard" },
  { id: "7", country: "Латвия", city: "Рига", flag: "🇱🇻", ping: 25, load: 18, region: "Европа", protocol: "WireGuard" },
];

export const HISTORY: LogEntry[] = [
  { id: "1", server: "Амстердам, Нидерланды", flag: "🇳🇱", start: "Сегодня, 14:23", duration: "2ч 41м", dataIn: "1.2 ГБ", dataOut: "340 МБ", status: "success" },
  { id: "2", server: "Франкфурт, Германия", flag: "🇩🇪", start: "Сегодня, 09:10", duration: "47м", dataIn: "230 МБ", dataOut: "89 МБ", status: "success" },
  { id: "3", server: "Токио, Япония", flag: "🇯🇵", start: "Вчера, 22:55", duration: "1ч 18м", dataIn: "870 МБ", dataOut: "210 МБ", status: "interrupted" },
  { id: "4", server: "Нью-Йорк, США", flag: "🇺🇸", start: "Вчера, 18:30", duration: "3ч 02м", dataIn: "2.1 ГБ", dataOut: "540 МБ", status: "success" },
  { id: "5", server: "Хельсинки, Финляндия", flag: "🇫🇮", start: "26 марта, 12:15", duration: "55м", dataIn: "410 МБ", dataOut: "120 МБ", status: "success" },
];