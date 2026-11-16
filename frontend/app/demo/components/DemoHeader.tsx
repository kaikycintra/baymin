import { Link } from "react-router";
import type { CrewLocation } from "../../demo-types";
import { ACTORS, MISSION, PLACE_LABEL, SPEEDS } from "../sim/constants";
import { useSim } from "../sim/context";
import { formatClock, fromInputValue, marsDay, missionDay, toInputValue } from "../sim/format";
import type { Actor } from "../sim/types";

interface Props {
  actor: Actor;
  onActorChange: (actor: Actor) => void;
}

export function DemoHeader({ actor, onActorChange }: Props) {
  const { state, dispatch, reset } = useSim();

  return (
    <>
      <header className="topbar demo-topbar">
        <div className="header-identity">
          <Link className="brand-lockup" to="/" aria-label="Baymin mission health, back to the overview">
            <img className="brand-mark" src={`${import.meta.env.BASE_URL}baymin-logo.png`} alt="" aria-hidden="true" />
            <span><strong>BAYMIN</strong><small>MISSION HEALTH</small></span>
          </Link>
          <span className="identity-rule" aria-hidden="true" />
          <section className="mission-summary" aria-label="Current mission">
            <span className="eyebrow">ACTIVE MISSION</span>
            <strong>{MISSION.name}</strong>
            <span className="mission-details">
              <span>
                Mission day {String(missionDay(state.clock)).padStart(3, "0")} · {marsDay(state.clock) ? `Mars day ${marsDay(state.clock)}` : "In transit"} · {formatClock(state.clock)} UTC
              </span>
              <span className="mission-status"><i /> {MISSION.crewCount} crew online</span>
            </span>
          </section>
        </div>

        <div className="global-controls demo-controls">
          <label className="location-control">
            <span>SIMULATED DATE (UTC)</span>
            <input
              type="datetime-local"
              value={toInputValue(state.clock)}
              onChange={(e) => {
                const at = fromInputValue(e.target.value);
                if (at !== null) dispatch({ type: "clock/set", at });
              }}
            />
          </label>
          <div className="location-control">
            <span>CLOCK</span>
            <span className="demo-clock-controls">
              <button type="button" className="text-action" onClick={() => dispatch({ type: "clock/running", running: !state.running })}>
                {state.running ? "Pause" : "Run"}
              </button>
              <select aria-label="Clock speed" value={state.speed} onChange={(e) => dispatch({ type: "clock/speed", speed: Number(e.target.value) })}>
                {SPEEDS.map((s) => <option key={s} value={s}>{s}×</option>)}
              </select>
            </span>
          </div>
          <label className="location-control">
            <span>CREW CONTEXT</span>
            <select value={state.location} onChange={(e) => dispatch({ type: "location/set", location: e.target.value as CrewLocation })}>
              <option value="habitat">{PLACE_LABEL.habitat}</option>
              <option value="rover">{PLACE_LABEL.rover}</option>
            </select>
          </label>
          <button type="button" className="text-action demo-reset" onClick={reset}>Reset simulation</button>
        </div>
      </header>

      <nav className="demo-actor-bar" aria-label="Choose which app to show">
        <span className="eyebrow">SHOWING</span>
        <div className="segmented-control" role="tablist" aria-label="Simulated app">
          {ACTORS.map((a) => (
            <button
              key={a.id}
              type="button"
              role="tab"
              aria-selected={actor === a.id}
              className={actor === a.id ? "selected" : ""}
              onClick={() => onActorChange(a.id)}
            >
              {a.label}
            </button>
          ))}
        </div>
        <span className="simulation-label"><i /> SIMULATION MODE · all readings and alerts are mocked</span>
      </nav>
    </>
  );
}