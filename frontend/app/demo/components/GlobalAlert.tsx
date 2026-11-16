import type { CrewLocation } from "../../demo-types";
import { PLACE_LABEL } from "../sim/constants";
import { formatPpm } from "../sim/format";

/** The red banner shown on every screen during a CO₂ excursion. */
export function GlobalAlert({ ppm, location }: { ppm: number; location: CrewLocation }) {
  return (
    <section className="global-alert" role="status">
      <span className="alert-symbol">!</span>
      <div>
        <strong>{PLACE_LABEL[location]} CO₂ excursion</strong>
        <span>{formatPpm(ppm)} ppm · Environmental telemetry is being correlated with crew reports.</span>
      </div>
      <span className="alert-time">LIVE EVENT</span>
    </section>
  );
}