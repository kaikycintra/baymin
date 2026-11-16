// Save as: app/demo/history/store.ts
import type { CheckinValues } from "../../demo-types";
import type { PendingItem } from "../sim/types";
import { dayOf } from "./indicators";
import type { CrewHistory, HistoryEntry, HistoryPoint } from "./types";

const MAX_POINTS = 120;

/** Adds a point, or replaces the one for the same day. Returns a new array. */
export function upsertPoint(series: HistoryPoint[] | undefined, point: HistoryPoint): HistoryPoint[] {
  const list = series ? [...series] : [];
  const i = list.findIndex((p) => p.day === point.day);
  if (i >= 0) list[i] = point;
  else {
    list.push(point);
    list.sort((a, b) => a.day - b.day);
  }
  return list.slice(-MAX_POINTS);
}

export function withEntries(history: CrewHistory, entries: HistoryEntry[]): CrewHistory {
  let next = history;
  for (const e of entries) next = { ...next, [e.id]: upsertPoint(next[e.id], e.point) };
  return next;
}

/** Watch readings update today's heart rate and blood oxygen. */
export function vitalsEntries(v: { heartRate: number; spo2: number; at: number }): HistoryEntry[] {
  const day = dayOf(v.at);
  return [
    { id: "restingHr", point: { day, value: v.heartRate } },
    { id: "spo2", point: { day, value: v.spo2 } },
  ];
}

const MOOD_SCORE: Record<string, number> = { Low: 2, Steady: 3, Good: 4 };

/** The daily check-in updates today's sleep quality (1 to 10 becomes 10 to 100), stress, mood and energy. */
export function checkinEntries(c: CheckinValues, at: number): HistoryEntry[] {
  const day = dayOf(at);
  return [
    { id: "sleepQuality", point: { day, value: c.sleepQuality * 10 } },
    { id: "stress", point: { day, value: c.stress } },
    { id: "mood", point: { day, value: MOOD_SCORE[c.mood] ?? 3 } },
    { id: "energy", point: { day, value: c.energy } },
  ];
}

/**
 * What a viewer sees.
 *  "server": the base server's copy (what the medical officer and flight surgeon see).
 *  "self":   the astronaut's own device, which is the server copy plus anything still waiting for the link.
 */
export function selectHistory(args: {
  base: CrewHistory | undefined;
  outbox: PendingItem[];
  crewName: string;
  astronaut: string;
  viewer: "self" | "server";
}): { history: CrewHistory; pending: number } {
  const base = args.base ?? {};
  if (args.viewer === "server" || args.crewName !== args.astronaut) return { history: base, pending: 0 };
  let history = base;
  let pending = 0;
  for (const item of args.outbox) {
    if (item.payload.type === "vitals") {
      history = withEntries(history, vitalsEntries(item.payload.vitals));
      pending++;
    } else if (item.payload.type === "history") {
      history = withEntries(history, item.payload.entries);
      pending++;
    }
  }
  return { history, pending };
}