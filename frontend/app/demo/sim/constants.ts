import type { Actor, NodeId, ScenarioId } from "./types";

export const MISSION = {
  name: "Artemis III",
  /** Mission day 1 starts here (fictional). */
  start: Date.UTC(2027, 2, 1),
  crewCount: 4,
  astronaut: "Maya Chen",
} as const;

/** Default simulated time: mission day 018, 08:42 (UTC). Fixed so server and client render the same. */
export const DEFAULT_CLOCK = Date.UTC(2027, 2, 18, 8, 42, 0);

/** Demo thresholds, not clinical limits. */
export const CO2_CAUTION = 3500;
export const CO2_ALARM = 5000;
export const HR_LIMIT = 100;

/** Guide the astronaut app suggests when the watch reports a high heart rate. */
export const PALPITATIONS_GUIDE_ID = "palpitations-tachycardia";

export const NODE_LABEL: Record<NodeId, string> = {
  watch: "Apple Watch",
  "habitat-sensor": "CO₂ sensor",
  "astronaut-app": "Astronaut app",
  "base-server": "Base server",
};

export const ACTORS: { id: Actor; label: string; caption: string }[] = [
  { id: "astronaut", label: "Astronaut", caption: "Astronaut app · Maya Chen" },
  { id: "cmo", label: "Medical officer", caption: "Mission medical officer (CMO) app" },
  { id: "surgeon", label: "Flight surgeon", caption: "Flight surgeon app · ground" },
  { id: "base", label: "Base station", caption: "Ship / base server console" },
];

export const SPEEDS = [1, 60, 600] as const;

export const SCENARIOS: Record<
  ScenarioId,
  {
    label: string;
    hint: string;
    watch?: { heartRate: number; spo2: number };
    habitat?: { co2: number; temp: number };
  }
> = {
  nominal: {
    label: "All nominal",
    hint: "HR 68, CO₂ 800 ppm",
    watch: { heartRate: 68, spo2: 98 },
    habitat: { co2: 800, temp: 22.5 },
  },
  "co2-excursion": {
    label: "CO₂ excursion",
    hint: "CO₂ 5,400 ppm, HR 112",
    watch: { heartRate: 112, spo2: 97 },
    habitat: { co2: 5400, temp: 24.5 },
  },
  "high-heart-rate": {
    label: "High heart rate",
    hint: "HR 124 at normal CO₂",
    watch: { heartRate: 124, spo2: 96 },
  },
};
