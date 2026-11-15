import type { CrewLocation } from "../../demo-types";
import { formatPpm } from "../sim/format";

/** The red banner shown on every screen during a CO₂ excursion. */
export function GlobalAlert({ ppm, location }: { ppm: number; location: CrewLocation }) {
  return (
    <section className="global-alert" role="status">
      <span className="alert-symbol">!</span>
      <div>
        <strong>{location === "rover" ? "Rover cabin" : "Habitat"} CO₂ excursion</strong>
        <span>{formatPpm(ppm)} ppm · Environmental telemetry is being correlated with crew reports.</span>
      </div>
      <span className="alert-time">LIVE EVENT</span>
    </section>
  );
}
