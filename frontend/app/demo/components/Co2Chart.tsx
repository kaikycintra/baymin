import { CO2_ALARM, CO2_CAUTION } from "../sim/constants";
import { formatClock, formatPpm } from "../sim/format";

const W = 320;
const H = 104;
const PAD = 6;
const MAX_PPM = 8000;

/** Small line chart of recent CO₂ readings, with the caution and alarm thresholds. */
export function Co2Chart({ history }: { history: { at: number; ppm: number }[] }) {
  const y = (ppm: number) => H - PAD - (Math.min(ppm, MAX_PPM) / MAX_PPM) * (H - PAD * 2);
  const x = (i: number) => PAD + (i * (W - PAD * 2)) / Math.max(1, history.length - 1);
  const points = history.map((p, i) => `${x(i).toFixed(1)},${y(p.ppm).toFixed(1)}`).join(" ");
  const last = history[history.length - 1];

  return (
    <svg
      className="co2-chart"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={
        last
          ? `CO₂ over the last ${history.length} readings. Latest ${formatPpm(last.ppm)} ppm at ${formatClock(last.at)}.`
          : "No CO₂ readings yet"
      }
    >
      <line className="co2-limit co2-limit-alarm" x1={PAD} x2={W - PAD} y1={y(CO2_ALARM)} y2={y(CO2_ALARM)} />
      <line className="co2-limit co2-limit-caution" x1={PAD} x2={W - PAD} y1={y(CO2_CAUTION)} y2={y(CO2_CAUTION)} />
      <text className="co2-label" x={W - PAD} y={y(CO2_ALARM) - 4} textAnchor="end">alarm {formatPpm(CO2_ALARM)}</text>
      <text className="co2-label" x={W - PAD} y={y(CO2_CAUTION) - 4} textAnchor="end">caution {formatPpm(CO2_CAUTION)}</text>
      {history.length > 1 && <polyline className="co2-line" points={points} fill="none" />}
      {last && <circle className="co2-dot" cx={x(history.length - 1)} cy={y(last.ppm)} r="3" />}
    </svg>
  );
}
