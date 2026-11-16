// Save as: app/demo/components/SensorPanel.tsx (REPLACES yours)
import { useEffect, useRef, useState } from "react";
import { MISSION, NODE_LABEL, PLACE_LABEL, SCENARIOS } from "../sim/constants";
import { useSim } from "../sim/context";
import { formatClock, formatPpm } from "../sim/format";
import { routeLabel } from "../sim/state";
import type { ScenarioId } from "../sim/types";

/** Calls send() every 2 seconds while enabled. */
function useStream(enabled: boolean, send: () => void) {
  const latest = useRef(send);
  latest.current = send;
  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => latest.current(), 2000);
    return () => window.clearInterval(id);
  }, [enabled]);
}

function Range(props: {
  id: string;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step?: number;
  display?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const { id, label, value, unit, min, max, step = 1, display, onChange } = props;
  return (
    <div className="sensor-field">
      <label className="range-label" htmlFor={id}>
        <span>{label}</span>
        <strong>{display ? display(value) : value}<small> {unit}</small></strong>
      </label>
      <input id={id} className="sensor-range" type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

export function SensorPanel() {
  const { state, dispatch } = useSim();
  const [watchStream, setWatchStream] = useState(false);
  const [habitatStream, setHabitatStream] = useState(false);
  const place = PLACE_LABEL[state.location];

  useStream(watchStream, () => dispatch({ type: "watch/send" }));
  useStream(habitatStream, () => dispatch({ type: "habitat/send" }));

  return (
    <aside className="sensor-panel" aria-label="Simulation sensors">
      <div className="section-heading">
        <div><span className="eyebrow">SIMULATION / SENSORS</span><h2>Send events</h2></div>
      </div>

      <section className="sensor-block" aria-labelledby="scenarios-title">
        <h3 id="scenarios-title" className="sensor-title">Quick scenarios</h3>
        <div className="sensor-chips">
          {(Object.keys(SCENARIOS) as ScenarioId[]).map((id) => (
            <button key={id} type="button" className="sensor-chip" onClick={() => dispatch({ type: "scenario/apply", scenario: id })}>
              <strong>{SCENARIOS[id].label}</strong>
              <small>{SCENARIOS[id].hint}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="sensor-block" aria-labelledby="watch-title">
        <div className="sensor-head">
          <div><span className="eyebrow">APPLE WATCH → ASTRONAUT APP</span><h3 id="watch-title" className="sensor-title">{MISSION.astronaut}’s watch</h3></div>
          <label className="sensor-stream"><input type="checkbox" checked={watchStream} onChange={(e) => setWatchStream(e.target.checked)} /> Auto-send</label>
        </div>
        <Range id="watch-hr" label="Heart rate" unit="bpm" min={40} max={180} value={state.watch.heartRate} onChange={(heartRate) => dispatch({ type: "watch/edit", heartRate })} />
        <Range id="watch-spo2" label="Blood oxygen" unit="%" min={80} max={100} value={state.watch.spo2} onChange={(spo2) => dispatch({ type: "watch/edit", spo2 })} />
        <button type="button" className="button button-secondary" onClick={() => dispatch({ type: "watch/send" })}>Send reading</button>
      </section>

      <section className="sensor-block" aria-labelledby="habitat-title">
        <div className="sensor-head">
          <div><span className="eyebrow">{place.toUpperCase()} SENSOR → BASE SERVER</span><h3 id="habitat-title" className="sensor-title">{place} air</h3></div>
          <label className="sensor-stream"><input type="checkbox" checked={habitatStream} onChange={(e) => setHabitatStream(e.target.checked)} /> Auto-send</label>
        </div>
        <Range id="habitat-co2" label="CO₂" unit="ppm" min={400} max={8000} step={50} display={formatPpm} value={state.habitat.co2} onChange={(co2) => dispatch({ type: "habitat/edit", co2 })} />
        <Range id="habitat-temp" label="Temperature" unit="°C" min={15} max={35} step={0.5} display={(v) => v.toFixed(1)} value={state.habitat.temp} onChange={(temp) => dispatch({ type: "habitat/edit", temp })} />
        <button type="button" className="button button-secondary" onClick={() => dispatch({ type: "habitat/send" })}>Send reading</button>
      </section>

      <section className="sensor-block" aria-labelledby="link-title">
        <div className="sensor-head">
          <div><span className="eyebrow">ASTRONAUT APP → BASE SERVER</span><h3 id="link-title" className="sensor-title">Base network</h3></div>
          <button
            type="button"
            className={`hazard-toggle ${state.link === "offline" ? "is-on" : ""}`}
            aria-pressed={state.link === "offline"}
            onClick={() => dispatch({ type: "link/set", online: state.link === "offline" })}
          >
            <span className="toggle-track"><i /></span>
            <span className="toggle-copy"><small>LINK</small><strong>{state.link === "online" ? "Online" : "Offline"}</strong></span>
          </button>
        </div>
        <p className="sensor-note">
          {state.link === "online"
            ? "Switch it off to see the astronaut app queue data and send it when the link returns."
            : `${state.outbox.length} item${state.outbox.length === 1 ? "" : "s"} waiting on the astronaut’s device.`}
        </p>
      </section>

      <section className="sensor-block" aria-labelledby="log-title">
        <h3 id="log-title" className="sensor-title">Event log</h3>
        {state.events.length === 0 ? (
          <p className="sensor-note">Nothing sent yet. Send a reading or pick a scenario.</p>
        ) : (
          <ol className="event-log">
            {state.events.map((e) => (
              <li key={e.id} className="event-row">
                <time>{formatClock(e.at, true)}</time>
                <span className="event-route">{routeLabel(e, state.location === "rover" ? "Rover sensor" : NODE_LABEL["habitat-sensor"])}</span>
                <span className="event-summary">{e.summary}{e.status === "queued" ? <em className="event-queued"> · queued</em> : null}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </aside>
  );
}