import type { DispositionLevel } from "./types";

export interface LevelMeta {
  label: string;
  rank: number;
  /** Whether a flight-surgeon report is recommended by default at this level. */
  notifyByDefault: boolean;
}

export const LEVELS: Record<DispositionLevel, LevelMeta> = {
  self_care: { label: "Self-care", rank: 0, notifyByDefault: false },
  monitor: { label: "Monitor", rank: 1, notifyByDefault: false },
  cmo_evaluation: { label: "CMO evaluation needed", rank: 2, notifyByDefault: true },
  urgent: { label: "Urgent: call the CMO now", rank: 3, notifyByDefault: true },
  emergency: { label: "Emergency", rank: 4, notifyByDefault: true },
};

export const ANSWER_LABEL = { yes: "Yes", no: "No", unsure: "Not sure" } as const;
