// Save as: app/demo/sim/state.ts (REPLACES yours)
import { CO2_ALARM, CO2_CAUTION, DEFAULT_CLOCK, HR_LIMIT, MISSION, NODE_LABEL, RESPONDER_NAME, SCENARIOS } from "./constants";
import { seedHistory } from "../history/seed";
import { checkinEntries, vitalsEntries, withEntries } from "../history/store";
import type { HistoryEntry } from "../history/types";
import { formatPpm } from "./format";
import type {
  BaseAlert,
  Co2Level,
  CrewVitals,
  PendingPayload,
  ReportResponse,
  SimAction,
  SimEvent,
  SimState,
} from "./types";
import type { FlightSurgeonReport } from "../../medical-flow";

const MAX_EVENTS = 60;
const MAX_HISTORY = 40;
const MAX_OUTBOX = 50;

export function co2Level(ppm: number): Co2Level {
  return ppm >= CO2_ALARM ? "alarm" : ppm >= CO2_CAUTION ? "caution" : "nominal";
}

export function isAnomalyActive(state: SimState): boolean {
  return co2Level(state.base.env.co2) === "alarm";
}

export function createInitialState(): SimState {
  const at = DEFAULT_CLOCK;
  return {
    clock: at,
    running: true,
    speed: 1,
    location: "habitat",
    watch: { heartRate: 68, spo2: 98 },
    habitat: { co2: 800, temp: 22.5 },
    link: "online",
    app: { heartRate: 68, spo2: 98, receivedAt: null, responses: [], seenResponseIds: [] },
    outbox: [],
    downlink: [],
    base: {
      env: { co2: 800, temp: 22.5, at },
      co2History: Array.from({ length: 8 }, (_, i) => ({
        at: at - (8 - i) * 60_000,
        ppm: 780 + ((i * 37) % 40),
      })),
      crew: { heartRate: 68, spo2: 98, at },
      alerts: [],
      reports: [],
      responses: [],
      history: seedHistory(at),
      historySyncedAt: at,
    },
    events: [],
    nextId: 1,
    resetCount: 0,
  };
}

/* ---------- helpers: each returns a new state ---------- */

function pushEvent(s: SimState, e: Omit<SimEvent, "id" | "at">): [SimState, number] {
  const id = s.nextId;
  const event: SimEvent = { ...e, id, at: s.clock };
  return [{ ...s, nextId: id + 1, events: [event, ...s.events].slice(0, MAX_EVENTS) }, id];
}

/** Raises and clears base-server alerts from what the server currently knows. */
function refreshAlerts(s: SimState): SimState {
  const level = co2Level(s.base.env.co2);
  const hr = s.base.crew?.heartRate ?? 0;
  const hrHigh = hr > HR_LIMIT;

  type Want = Pick<BaseAlert, "severity" | "title" | "detail"> | null;
  const wanted: Record<BaseAlert["key"], Want> = {
    co2:
      level === "alarm"
        ? { severity: "alarm", title: "CO₂ excursion", detail: `Cabin CO₂ is above the demo alarm threshold (${formatPpm(CO2_ALARM)} ppm).` }
        : level === "caution"
          ? { severity: "caution", title: "CO₂ elevated", detail: `Cabin CO₂ is above the demo caution threshold (${formatPpm(CO2_CAUTION)} ppm).` }
          : null,
    hr: hrHigh
      ? { severity: "caution", title: "Elevated heart rate", detail: `Heart rate is above ${HR_LIMIT} bpm. The crew member was prompted to open the palpitations guide.` }
      : null,
    correlation:
      hrHigh && level !== "nominal"
        ? { severity: "alarm", title: "Correlation flag: heart rate and CO₂", detail: "Elevated heart rate coincides with elevated CO₂. This is a correlation, not a diagnosis." }
        : null,
  };

  let nextId = s.nextId;
  let alerts = s.base.alerts;
  for (const key of ["co2", "hr", "correlation"] as const) {
    const want = wanted[key];
    const active = alerts.find((a) => a.key === key && a.clearedAt === null);
    if (!want && active) {
      alerts = alerts.map((a) => (a === active ? { ...a, clearedAt: s.clock } : a));
    } else if (want && !active) {
      alerts = [{ id: nextId++, key, raisedAt: s.clock, clearedAt: null, ...want }, ...alerts];
    } else if (want && active && active.severity !== want.severity) {
      alerts = alerts.map((a) => (a === active ? { ...a, ...want } : a));
    }
  }
  return { ...s, nextId, base: { ...s.base, alerts: alerts.slice(0, 30) } };
}

function deliverHistory(s: SimState, crew: string, entries: HistoryEntry[]): SimState {
  const store = s.base.history;
  return {
    ...s,
    base: { ...s.base, history: { ...store, [crew]: withEntries(store[crew] ?? {}, entries) }, historySyncedAt: s.clock },
  };
}

function deliverVitals(s: SimState, vitals: CrewVitals): SimState {
  const current = s.base.crew;
  if (current && current.at > vitals.at) return s;
  const withHistory = deliverHistory(s, MISSION.astronaut, vitalsEntries(vitals)); // watch readings update today's history
  return refreshAlerts({ ...withHistory, base: { ...withHistory.base, crew: vitals } });
}

function deliver(s: SimState, payload: PendingPayload): SimState {
  switch (payload.type) {
    case "vitals":
      return deliverVitals(s, payload.vitals);
    case "report":
      return deliverReport(s, payload.report);
    case "history":
      return deliverHistory(s, payload.crew, payload.entries);
  }
}

function deliverReport(s: SimState, report: FlightSurgeonReport): SimState {
  return { ...s, base: { ...s.base, reports: [{ report, receivedAt: s.clock }, ...s.base.reports] } };
}

/** Sends something from the astronaut app to the base server, or queues it if the link is down. */
function sendToBase(
  s: SimState,
  kind: "vitals" | "report" | "history",
  summary: string,
  payload: PendingPayload
): SimState {
  const online = s.link === "online";
  let [next, id] = pushEvent(s, {
    from: "astronaut-app",
    to: "base-server",
    kind,
    summary: online ? summary : `${summary} (waiting for link)`,
    status: online ? "delivered" : "queued",
  });
  if (online) return deliver(next, payload);
  const outbox = [...next.outbox, { eventId: id, payload, queuedAt: next.clock }].slice(-MAX_OUTBOX);
  return { ...next, outbox };
}

function sendWatch(s: SimState): SimState {
  const { heartRate, spo2 } = s.watch;
  let [next] = pushEvent(s, {
    from: "watch",
    to: "astronaut-app",
    kind: "vitals",
    summary: `HR ${heartRate} bpm · SpO₂ ${spo2}%`,
    status: "delivered",
  });
  next = { ...next, app: { ...next.app, heartRate, spo2, receivedAt: next.clock } };
  return sendToBase(next, "vitals", "Crew vitals synced", {
    type: "vitals",
    vitals: { heartRate, spo2, at: next.clock },
  });
}

function sendHabitat(s: SimState): SimState {
  const { co2, temp } = s.habitat;
  let [next] = pushEvent(s, {
    from: "habitat-sensor",
    to: "base-server",
    kind: "environment",
    summary: `CO₂ ${formatPpm(co2)} ppm · ${temp.toFixed(1)} °C`,
    status: "delivered",
  });
  next = {
    ...next,
    base: {
      ...next.base,
      env: { co2, temp, at: next.clock },
      co2History: [...next.base.co2History, { at: next.clock, ppm: co2 }].slice(-MAX_HISTORY),
    },
  };
  return refreshAlerts(next);
}

function setLink(s: SimState, online: boolean): SimState {
  if (online === (s.link === "online")) return s;
  let next: SimState = { ...s, link: online ? "online" : "offline" };
  if (!online) {
    [next] = pushEvent(next, {
      from: "astronaut-app",
      to: "base-server",
      kind: "link",
      summary: "Link to base lost. New data will be queued",
      status: "delivered",
    });
    return next;
  }
  const pending = next.outbox;
  const down = next.downlink;
  const ids = new Set([...pending.map((p) => p.eventId), ...down.map((d) => d.eventId)]);
  next = {
    ...next,
    outbox: [],
    downlink: [],
    events: next.events.map((e) => (ids.has(e.id) ? { ...e, status: "delivered" as const } : e)),
    // replies the base server was holding now reach the astronaut's device
    app: { ...next.app, responses: [...next.app.responses, ...down.map((d) => d.response)] },
  };
  for (const p of pending) next = deliver(next, p.payload);
  const total = pending.length + down.length;
  [next] = pushEvent(next, {
    from: "astronaut-app",
    to: "base-server",
    kind: "link",
    summary: total ? `Link restored. ${total} queued item${total === 1 ? "" : "s"} delivered` : "Link restored",
    status: "delivered",
  });
  return next;
}

/* ---------- reducer ---------- */

export function simReducer(s: SimState, action: SimAction): SimState {
  switch (action.type) {
    case "clock/set":
      return { ...s, clock: action.at };
    case "clock/tick":
      return { ...s, clock: s.clock + action.ms };
    case "clock/running":
      return { ...s, running: action.running };
    case "clock/speed":
      return { ...s, speed: action.speed };
    case "location/set":
      return { ...s, location: action.location };
    case "watch/edit":
      return {
        ...s,
        watch: {
          heartRate: action.heartRate ?? s.watch.heartRate,
          spo2: action.spo2 ?? s.watch.spo2,
        },
      };
    case "habitat/edit":
      return {
        ...s,
        habitat: { co2: action.co2 ?? s.habitat.co2, temp: action.temp ?? s.habitat.temp },
      };
    case "watch/send":
      return sendWatch(s);
    case "habitat/send":
      return sendHabitat(s);
    case "link/set":
      return setLink(s, action.online);
    case "report/submit":
      return sendToBase(s, "report", `Report: ${action.report.outcome.title}`, {
        type: "report",
        report: action.report,
      });
    case "checkin/submit":
      return sendToBase(s, "history", "Daily check-in synced", {
        type: "history",
        crew: MISSION.astronaut,
        entries: checkinEntries(action.values, s.clock),
      });
    case "response/send": {
      const text = action.text.trim().slice(0, 500);
      const target = s.base.reports.find((r) => r.report.id === action.reportId);
      if (!text || !target) return s;
      const label = action.from === "cmo" ? "Medical officer" : "Flight surgeon";
      const response: ReportResponse = {
        id: `resp-${s.nextId}`,
        reportId: action.reportId,
        from: action.from,
        author: RESPONDER_NAME[action.from],
        text,
        at: s.clock,
      };
      // 1. the reply reaches the base server
      let [next] = pushEvent(s, {
        from: action.from === "cmo" ? "cmo-app" : "surgeon-app",
        to: "base-server",
        kind: "response",
        summary: `${label} replied to “${target.report.outcome.title}”`,
        status: "delivered",
      });
      next = { ...next, base: { ...next.base, responses: [...next.base.responses, response] } };
      // 2. the base server passes it on to the astronaut's device, or holds it until the link is back
      if (next.link === "online") {
        [next] = pushEvent(next, { from: "base-server", to: "astronaut-app", kind: "response", summary: "Reply delivered to the crew device", status: "delivered" });
        return { ...next, app: { ...next.app, responses: [...next.app.responses, response] } };
      }
      const [queued, eventId] = pushEvent(next, { from: "base-server", to: "astronaut-app", kind: "response", summary: "Reply waiting for the crew device (link down)", status: "queued" });
      return { ...queued, downlink: [...queued.downlink, { eventId, response }] };
    }
    case "response/seen": {
      const seen = new Set([...s.app.seenResponseIds, ...action.ids]);
      return { ...s, app: { ...s.app, seenResponseIds: [...seen] } };
    }
    case "scenario/apply": {
      const sc = SCENARIOS[action.scenario];
      let next = s;
      if (sc.habitat) next = sendHabitat({ ...next, habitat: sc.habitat });
      if (sc.watch) next = sendWatch({ ...next, watch: sc.watch });
      return next;
    }
    case "reset":
      return { ...createInitialState(), resetCount: s.resetCount + 1 };
  }
}

/** Short label like "Apple Watch → Astronaut app", used by the event log. */
export function routeLabel(e: SimEvent, habitatLabel: string): string {
  const name = (id: SimEvent["from"]) => (id === "habitat-sensor" ? habitatLabel : NODE_LABEL[id]);
  return `${name(e.from)} → ${name(e.to)}`;
}