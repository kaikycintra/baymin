// Save as: app/demo/history/types.ts
export type IndicatorId =
  | "sleepHours" | "sleepQuality"
  | "restingHr" | "spo2" | "bp"
  | "reaction"
  | "stress" | "mood" | "energy"
  | "temp" | "exercise";

export type Status = "ok" | "watch" | "alert";

/** One reading per UTC day. `day` is floor(epoch ms / 86,400,000). */
export interface HistoryPoint {
  day: number;
  value: number;
  /** Second number for paired readings: diastolic pressure for "bp". */
  secondary?: number;
}

/** Ascending by day. */
export type CrewHistory = Partial<Record<IndicatorId, HistoryPoint[]>>;
/** Keyed by crew member name. */
export type HistoryStore = Record<string, CrewHistory>;

export interface HistoryEntry {
  id: IndicatorId;
  point: HistoryPoint;
}