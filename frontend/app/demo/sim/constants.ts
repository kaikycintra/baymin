import type { CrewLocation } from "../../demo-types";
import type { Actor, NodeId, ScenarioId } from "./types";

export const MISSION = {
  name: "Artemis X",
  /** Mission day 1: launch (fictional, 2033). Mission day 340 falls in 2034. */
  start: Date.UTC(2033, 11, 16),
  /** Mission day of the Mars landing. Mission day 340 is the 47th day on the surface. */
  landingDay: 294,
  crewCount: 4,
  astronaut: "Maya Chen",
  cmo: "Dr. Elena Park",
} as const;

/** Default simulated time: mission day 340 (day 47 on Mars), 08:42 UTC, 20 Nov 2034. Fixed so server and client render the same. */
export const DEFAULT_CLOCK = Date.UTC(2034, 10, 20, 8, 42, 0);

/** Where the crew member is, in words. */
export const PLACE_LABEL: Record<CrewLocation, string> = { habitat: "Mars base", rover: "Rover" };

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
  "cmo-app": "Medical officer app",
  "surgeon-app": "Flight surgeon app",
  "base-server": "Base server",
};

export const ACTORS: { id: Actor; label: string; caption: string }[] = [
  { id: "astronaut", label: "Astronaut", caption: "Astronaut app · Maya Chen" },
  { id: "cmo", label: "Medical officer", caption: "Mission medical officer (CMO) app" },
  { id: "surgeon", label: "Flight surgeon", caption: "Flight surgeon app · ground" },
  { id: "base", label: "Base station", caption: "Mars base server console" },
];

/** Who a reply is signed by. */
export const RESPONDER_NAME = {
  cmo: `${MISSION.cmo} · Medical officer`,
  surgeon: "Flight surgeon",
} as const;

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