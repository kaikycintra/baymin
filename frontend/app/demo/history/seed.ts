// Save as: app/demo/history/seed.ts
import { INDICATORS, dayOf } from "./indicators";
import type { IndicatorDef } from "./indicators";
import type { CrewHistory, HistoryPoint, HistoryStore, IndicatorId } from "./types";

/** Everyone who appears anywhere in the demo. */
export const CREW_NAMES = [
  "Maya Chen", "Jonas Weber", "Leah Okafor", "Tomas Varga", // Artemis III
  "Nia Brooks", "Owen Kim", "Rafael Costa", // Gateway Resupply 2
  "Avery Cole", "Mei Tan", "Dmitri Volkov", // Mars Transit Demo
];

const WINDOW_DAYS = 28;

interface Baseline {
  mean: number;
  sd: number;
  /** Total change from the first to the last day. */
  drift?: number;
  secondary?: { mean: number; sd: number; drift?: number };
}

const DEFAULTS: Record<IndicatorId, Baseline> = {
  sleepHours: { mean: 7.4, sd: 0.5 },
  sleepQuality: { mean: 78, sd: 6 },
  restingHr: { mean: 66, sd: 2.5 },
  spo2: { mean: 97.8, sd: 0.7 },
  bp: { mean: 117, sd: 4, secondary: { mean: 75, sd: 3 } },
  reaction: { mean: 288, sd: 10 },
  stress: { mean: 2.1, sd: 0.6 },
  mood: { mean: 3.4, sd: 0.5 },
  energy: { mean: 3.5, sd: 0.5 },
  temp: { mean: 36.6, sd: 0.15 },
  exercise: { mean: 40, sd: 12 },
};

interface Profile {
  tweak?: Partial<Record<IndicatorId, Baseline>>;
  /** Today's watch readings. */
  today?: { hr: number; spo2: number };
  /** Make the last 7 days average exactly this, so the roster numbers in the medical officer app match. */
  avg7?: { sleepHours?: number; reaction?: number };
  /** Exact values for the last 7 days (the numbers the astronaut page already showed). */
  last7?: { sleepHours?: number[]; sleepQuality?: number[] };
}

const PROFILES: Record<string, Profile> = {
  "Maya Chen": {
    tweak: { restingHr: { mean: 67, sd: 2 }, reaction: { mean: 286, sd: 9 } },
    today: { hr: 68, spo2: 98 },
    avg7: { reaction: 286 },
    last7: { sleepHours: [7.4, 8.1, 6.8, 7.2, 8.3, 7.9, 7.6], sleepQuality: [78, 84, 69, 74, 89, 82, 80] },
  },
  "Jonas Weber": {
    // A slow decline: the medical officer app flags this as a trend.
    tweak: {
      sleepHours: { mean: 7.2, sd: 0.3, drift: -1.5 },
      sleepQuality: { mean: 78, sd: 5, drift: -18 },
      reaction: { mean: 284, sd: 8, drift: 62 },
      stress: { mean: 2.2, sd: 0.4, drift: 1.6 },
      mood: { mean: 3.4, sd: 0.4, drift: -1 },
      energy: { mean: 3.5, sd: 0.4, drift: -1.1 },
      restingHr: { mean: 63, sd: 2, drift: 4 },
    },
    today: { hr: 64, spo2: 98 },
    avg7: { sleepHours: 5.9, reaction: 338 },
  },
  "Leah Okafor": {
    tweak: { sleepHours: { mean: 7.8, sd: 0.3 }, reaction: { mean: 274, sd: 8 }, exercise: { mean: 48, sd: 10 } },
    today: { hr: 61, spo2: 99 },
    avg7: { sleepHours: 7.8, reaction: 274 },
  },
  "Tomas Varga": {
    tweak: { sleepHours: { mean: 7.2, sd: 0.4 }, reaction: { mean: 291, sd: 9 } },
    today: { hr: 66, spo2: 98 },
    avg7: { sleepHours: 7.2, reaction: 291 },
  },
  "Dmitri Volkov": {
    // Blood pressure creeping up, to show the colour coding on another indicator.
    tweak: { bp: { mean: 130, sd: 4, drift: 8, secondary: { mean: 84, sd: 3, drift: 4 } } },
  },
  "Mei Tan": {
    tweak: { exercise: { mean: 20, sd: 8 }, mood: { mean: 3, sd: 0.5 } },
  },
};

/* ---------- deterministic randomness: the server and the browser must produce the same numbers ---------- */

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (v: number, decimals: number) => Number(v.toFixed(decimals));
const clamp = (v: number, [lo, hi]: readonly [number, number]) => Math.min(hi, Math.max(lo, v));

/** Shift the last `count` values so they average `target`, spreading the rounding error onto the last one. */
function fitAverage(points: HistoryPoint[], count: number, target: number, def: IndicatorDef): HistoryPoint[] {
  const tail = points.slice(-count);
  const shift = target - tail.reduce((t, p) => t + p.value, 0) / tail.length;
  const shifted = tail.map((p) => ({ ...p, value: round(clamp(p.value + shift, def.domain), def.decimals) }));
  const diff = target * count - shifted.reduce((t, p) => t + p.value, 0);
  const last = shifted[shifted.length - 1];
  shifted[shifted.length - 1] = { ...last, value: round(last.value + diff, def.decimals) };
  return [...points.slice(0, -count), ...shifted];
}

function seedCrew(name: string, anchorDay: number): CrewHistory {
  const profile = PROFILES[name] ?? {};
  const rand = mulberry32(hash(name));
  const gauss = () => (rand() + rand() + rand() + rand() - 2) * 1.732; // roughly mean 0, sd 1

  // Crew without a named profile get small, stable differences from the defaults.
  const generic = PROFILES[name] === undefined || !PROFILES[name].tweak;
  const jitter = generic
    ? { sleepHours: (rand() - 0.5) * 0.8, reaction: (rand() - 0.5) * 30, restingHr: (rand() - 0.5) * 8 }
    : { sleepHours: 0, reaction: 0, restingHr: 0 };

  const history: CrewHistory = {};
  for (const def of INDICATORS) {
    const base = profile.tweak?.[def.id] ?? DEFAULTS[def.id];
    const extra = def.id === "sleepHours" ? jitter.sleepHours : def.id === "reaction" ? jitter.reaction : def.id === "restingHr" ? jitter.restingHr : 0;
    let series: HistoryPoint[] = [];
    for (let i = 0; i < WINDOW_DAYS; i++) {
      const t = i / (WINDOW_DAYS - 1);
      const value = round(clamp(base.mean + extra + (base.drift ?? 0) * t + gauss() * base.sd, def.domain), def.decimals);
      const point: HistoryPoint = { day: anchorDay - WINDOW_DAYS + i, value };
      if (def.secondary && base.secondary) {
        point.secondary = round(base.secondary.mean + (base.secondary.drift ?? 0) * t + gauss() * base.secondary.sd, def.secondary.decimals);
      }
      series.push(point);
    }

    const exact = profile.last7?.[def.id as "sleepHours" | "sleepQuality"];
    if (exact) series = [...series.slice(0, -exact.length), ...exact.map((value, i) => ({ day: anchorDay - exact.length + i, value }))];
    const target = profile.avg7?.[def.id as "sleepHours" | "reaction"];
    if (target !== undefined) series = fitAverage(series, 7, target, def);

    history[def.id] = series;
  }

  // Today's readings come from the watch.
  const today = profile.today ?? { hr: 60 + (hash(name + "hr") % 12), spo2: 97 + (hash(name + "o2") % 3) };
  history.restingHr = [...(history.restingHr ?? []), { day: anchorDay, value: today.hr }];
  history.spo2 = [...(history.spo2 ?? []), { day: anchorDay, value: today.spo2 }];
  return history;
}

/** Four weeks of history for everyone, ending the day before `anchorMs`, plus today's watch readings. */
export function seedHistory(anchorMs: number): HistoryStore {
  const anchorDay = dayOf(anchorMs);
  return Object.fromEntries(CREW_NAMES.map((name) => [name, seedCrew(name, anchorDay)]));
}