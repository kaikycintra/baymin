import type { CrewLocation } from "../../demo-types";
import type { FlightSurgeonReport } from "../../medical-flow";

/** Which app the demo is showing. */
export type Actor = "astronaut" | "cmo" | "surgeon" | "base";

/** The things in the simulated world that can send each other events. */
export type NodeId = "watch" | "habitat-sensor" | "astronaut-app" | "base-server";

export type EventKind = "vitals" | "environment" | "report" | "link";
export type Co2Level = "nominal" | "caution" | "alarm";
export type ScenarioId = "nominal" | "co2-excursion" | "high-heart-rate";

export interface SimEvent {
  id: number;
  /** Simulated time (epoch ms) */
  at: number;
  from: NodeId;
  to: NodeId;
  kind: EventKind;
  summary: string;
  status: "delivered" | "queued";
}

export interface CrewVitals {
  heartRate: number;
  spo2: number;
  at: number;
}

export type PendingPayload =
  | { type: "vitals"; vitals: CrewVitals }
  | { type: "report"; report: FlightSurgeonReport };

/** Something the astronaut app wants to send to the base while the link is down. */
export interface PendingItem {
  eventId: number;
  payload: PendingPayload;
}

export interface BaseAlert {
  id: number;
  key: "co2" | "hr" | "correlation";
  severity: "caution" | "alarm";
  title: string;
  detail: string;
  raisedAt: number;
  clearedAt: number | null;
}

export interface ReceivedReport {
  report: FlightSurgeonReport;
  receivedAt: number;
}

export interface SimState {
  clock: number;
  running: boolean;
  speed: number;
  location: CrewLocation;

  /** What the sensors are currently set to read (not yet sent anywhere). */
  watch: { heartRate: number; spo2: number };
  habitat: { co2: number; temp: number };

  /** Link between the astronaut app and the base server. */
  link: "online" | "offline";

  /** Latest data the astronaut app received from the watch. */
  app: { heartRate: number; spo2: number; receivedAt: number | null };
  outbox: PendingItem[];

  /** What the base server knows. */
  base: {
    env: { co2: number; temp: number; at: number };
    co2History: { at: number; ppm: number }[];
    crew: CrewVitals | null;
    alerts: BaseAlert[];
    reports: ReceivedReport[];
  };

  events: SimEvent[];
  nextId: number;
}

export type SimAction =
  | { type: "clock/set"; at: number }
  | { type: "clock/tick"; ms: number }
  | { type: "clock/running"; running: boolean }
  | { type: "clock/speed"; speed: number }
  | { type: "location/set"; location: CrewLocation }
  | { type: "watch/edit"; heartRate?: number; spo2?: number }
  | { type: "habitat/edit"; co2?: number; temp?: number }
  | { type: "watch/send" }
  | { type: "habitat/send" }
  | { type: "link/set"; online: boolean }
  | { type: "report/submit"; report: FlightSurgeonReport }
  | { type: "scenario/apply"; scenario: ScenarioId }
  | { type: "reset" };
