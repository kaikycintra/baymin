import { useState } from "react";
import type { Route } from "./+types/home";
import { Outlet } from "react-router";
import type { CrewLocation } from "../demo-types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Baymax | Mission health" },
    { name: "description", content: "Simulated astronaut health operations console." },
  ];
}

export default function Home() {
  const [anomalyActive, setAnomalyActive] = useState(false);
  const [location, setLocation] = useState<CrewLocation>("habitat");

  return (
    <div className="app-frame">
      <main className="workspace">
        <header className="topbar">
          <div className="header-identity">
            <div className="brand-lockup" aria-label="Baymax mission health">
          <img className="brand-mark" src="/baymax-logo.png" alt="" aria-hidden="true" />
          <span>
            <strong>BAYMAX</strong>
            <small>MISSION HEALTH</small>
          </span>
            </div>
            <span className="identity-rule" aria-hidden="true" />
            <section className="mission-summary" aria-label="Current mission">
              <span className="eyebrow">ACTIVE MISSION</span>
              <strong>Artemis III</strong>
              <span className="mission-details">
                <span>Lunar surface · Sol 18</span>
                <span className="mission-status"><i /> 4 crew online</span>
              </span>
            </section>
          </div>
          <div className="global-controls">
            <label className="location-control">
              <span>CREW CONTEXT</span>
              <select
                value={location}
                onChange={(event) => setLocation(event.target.value as CrewLocation)}
              >
                <option value="habitat">Habitat</option>
                <option value="rover">Rover</option>
              </select>
            </label>
            <button
              className={`hazard-toggle ${anomalyActive ? "is-on" : ""}`}
              type="button"
              aria-pressed={anomalyActive}
              onClick={() => setAnomalyActive((active) => !active)}
            >
              <span className="toggle-track"><i /></span>
              <span className="toggle-copy">
                <small>ENVIRONMENT SIM</small>
                <strong>{anomalyActive ? "CO₂ anomaly active" : "Trigger CO₂ spike"}</strong>
              </span>
            </button>
          </div>
        </header>

        <div className="demo-note">
          <span className="simulation-label"><i /> SIMULATION MODE</span>
          <span>All readings and alerts are mocked for demonstration.</span>
          <span className="eyebrow">FLIGHT OPERATIONS / HEALTH</span>
        </div>

        {anomalyActive && (
          <section className="global-alert" role="status">
            <span className="alert-symbol">!</span>
            <div>
              <strong>Habitat CO₂ excursion simulated</strong>
              <span>5,400 ppm · Environmental telemetry is being correlated with crew reports.</span>
            </div>
            <span className="alert-time">LIVE EVENT</span>
          </section>
        )}

        <div className="page-content">
          <Outlet context={{ anomalyActive, location }} />
        </div>
      </main>
    </div>
  );
}
