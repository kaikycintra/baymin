// Save as: app/demo/history/indicators.ts
import type { HistoryPoint, IndicatorId, Status } from "./types";

type Band = readonly [number, number];

export const DAY_MS = 86_400_000;
export const dayOf = (ms: number) => Math.floor(ms / DAY_MS);

export type GroupId = "sleep" | "heart" | "cognition" | "wellbeing" | "body";

export interface IndicatorDef {
  id: IndicatorId;
  label: string;
  unit: string;
  group: GroupId;
  decimals: number;
  /** Inclusive ranges. Outside `ok` but inside `watch` is "watch". Outside both is "alert". */
  ok: Band;
  watch: Band;
  secondary?: { ok: Band; watch: Band; decimals: number };
  /** Which direction is healthier. Used to colour trends. */
  better: "up" | "down" | "none";
  /** Changes smaller than this count as "stable". */
  epsilon: number;
  /** Chart scale. */
  domain: Band;
  /** Shown to the reader. These are demo values, not clinical limits. */
  refText: string;
}

export const GROUPS: { id: GroupId; label: string }[] = [
  { id: "sleep", label: "Sleep" },
  { id: "heart", label: "Heart and breathing" },
  { id: "cognition", label: "Cognition" },
  { id: "wellbeing", label: "Wellbeing" },
  { id: "body", label: "Body and activity" },
];

export const INDICATORS: IndicatorDef[] = [
  { id: "sleepHours", label: "Sleep duration", unit: "h", group: "sleep", decimals: 1, ok: [7, 9], watch: [6, 10], better: "up", epsilon: 0.25, domain: [4, 10], refText: "7 to 9 h in range. 6 to 7 h or 9 to 10 h watch." },
  { id: "sleepQuality", label: "Sleep quality", unit: "/100", group: "sleep", decimals: 0, ok: [70, 100], watch: [55, 100], better: "up", epsilon: 3, domain: [40, 100], refText: "70 or more in range. 55 to 69 watch." },
  { id: "restingHr", label: "Resting heart rate", unit: "bpm", group: "heart", decimals: 0, ok: [50, 90], watch: [45, 100], better: "down", epsilon: 2, domain: [40, 120], refText: "50 to 90 bpm in range. 91 to 100 watch. Above 100 out of range." },
  { id: "spo2", label: "Blood oxygen", unit: "%", group: "heart", decimals: 0, ok: [95, 100], watch: [92, 100], better: "up", epsilon: 0.5, domain: [88, 100], refText: "95% or more in range. 92 to 94% watch." },
  { id: "bp", label: "Blood pressure", unit: "mmHg", group: "heart", decimals: 0, ok: [90, 120], watch: [85, 140], secondary: { ok: [60, 80], watch: [55, 90], decimals: 0 }, better: "down", epsilon: 3, domain: [80, 160], refText: "Systolic 90 to 120 and diastolic 60 to 80 in range. Up to 140 / 90 watch. The chart shows systolic." },
  { id: "reaction", label: "Reaction time", unit: "ms", group: "cognition", decimals: 0, ok: [0, 300], watch: [0, 330], better: "down", epsilon: 8, domain: [220, 380], refText: "300 ms or less in range. 301 to 330 watch." },
  { id: "stress", label: "Perceived stress", unit: "/5", group: "wellbeing", decimals: 0, ok: [1, 2], watch: [1, 3], better: "down", epsilon: 0.3, domain: [1, 5], refText: "1 to 2 in range. 3 watch. 4 to 5 out of range." },
  { id: "mood", label: "Mood", unit: "/5", group: "wellbeing", decimals: 0, ok: [3, 5], watch: [2, 5], better: "up", epsilon: 0.3, domain: [1, 5], refText: "3 or more in range. 2 watch. 1 out of range." },
  { id: "energy", label: "Energy", unit: "/5", group: "wellbeing", decimals: 0, ok: [3, 5], watch: [2, 5], better: "up", epsilon: 0.3, domain: [1, 5], refText: "3 or more in range. 2 watch. 1 out of range." },
  { id: "temp", label: "Body temperature", unit: "°C", group: "body", decimals: 1, ok: [36.1, 37.2], watch: [35.5, 37.8], better: "none", epsilon: 0.2, domain: [35.5, 38.5], refText: "36.1 to 37.2 °C in range. 35.5 to 37.8 °C watch." },
  { id: "exercise", label: "Exercise", unit: "min", group: "body", decimals: 0, ok: [30, 600], watch: [15, 600], better: "up", epsilon: 5, domain: [0, 90], refText: "30 min or more in range. 15 to 29 min watch." },
];

export const INDICATOR_BY_ID = Object.fromEntries(INDICATORS.map((d) => [d.id, d])) as Record<IndicatorId, IndicatorDef>;

/** Text is always shown next to colour. */
export const STATUS_LABEL: Record<Status, string> = { ok: "In range", watch: "Watch", alert: "Out of range" };

const RANK: Record<Status, number> = { ok: 0, watch: 1, alert: 2 };
export const worst = (a: Status, b: Status): Status => (RANK[a] >= RANK[b] ? a : b);

function bandStatus(v: number, ok: Band, watch: Band): Status {
  if (v >= ok[0] && v <= ok[1]) return "ok";
  if (v >= watch[0] && v <= watch[1]) return "watch";
  return "alert";
}

export function statusOf(def: IndicatorDef, p: HistoryPoint): Status {
  let s = bandStatus(p.value, def.ok, def.watch);
  if (def.secondary && p.secondary !== undefined) s = worst(s, bandStatus(p.secondary, def.secondary.ok, def.secondary.watch));
  return s;
}

export const formatNumber = (def: IndicatorDef, v: number) => v.toFixed(def.decimals);

/** "7.6" or "118 / 76". */
export function formatValue(def: IndicatorDef, p: HistoryPoint): string {
  if (def.secondary && p.secondary !== undefined) return `${formatNumber(def, p.value)} / ${p.secondary.toFixed(def.secondary.decimals)}`;
  return formatNumber(def, p.value);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function formatDay(day: number): string {
  const d = new Date(day * DAY_MS);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/** Latest point on or before `today`. */
export function latestOf(points: HistoryPoint[] | undefined, today: number): HistoryPoint | undefined {
  if (!points) return undefined;
  for (let i = points.length - 1; i >= 0; i--) if (points[i].day <= today) return points[i];
  return undefined;
}

/** Points in the last `range` days, ending today. */
export function windowPoints(points: HistoryPoint[] | undefined, today: number, range: number): HistoryPoint[] {
  return (points ?? []).filter((p) => p.day <= today && p.day > today - range);
}

export type Verdict = "improving" | "worsening" | "stable" | "changing" | "none";
export interface Trend {
  verdict: Verdict;
  arrow: "↑" | "↓" | "→" | "";
  delta: number;
}

/** Last 3 readings against the ones before them in the window. */
export function trendOf(def: IndicatorDef, points: HistoryPoint[]): Trend {
  if (points.length < 4) return { verdict: "none", arrow: "", delta: 0 };
  const mean = (xs: HistoryPoint[]) => xs.reduce((t, p) => t + p.value, 0) / xs.length;
  const delta = mean(points.slice(-3)) - mean(points.slice(0, -3));
  if (Math.abs(delta) < def.epsilon) return { verdict: "stable", arrow: "→", delta };
  const arrow = delta > 0 ? "↑" : "↓";
  if (def.better === "none") return { verdict: "changing", arrow, delta };
  const good = def.better === "up" ? delta > 0 : delta < 0;
  return { verdict: good ? "improving" : "worsening", arrow, delta };
}