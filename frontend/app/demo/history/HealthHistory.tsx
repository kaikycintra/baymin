// Save as: app/demo/history/HealthHistory.tsx
import { memo, useMemo, useState } from "react";
import { formatClock } from "../sim/format";
import {
  GROUPS, INDICATORS, STATUS_LABEL, formatDay, formatNumber, formatValue,
  latestOf, statusOf, trendOf, windowPoints,
} from "./indicators";
import type { IndicatorDef, Verdict } from "./indicators";
import type { CrewHistory, HistoryPoint, IndicatorId, Status } from "./types";
import "./history.css";

type Range = 7 | 14 | 28;
const RANGES: Range[] = [7, 14, 28];

export interface SyncInfo {
  /** "self": the astronaut's own view. "server": what the base server has. */
  perspective: "self" | "server";
  /** Updates on the astronaut's device that have not reached the base yet. */
  pending: number;
  /** When the base server last received history. */
  syncedAt: number;
  /** Minutes since the base last heard from this crew member, when that is worth flagging. */
  staleMinutes: number | null;
}

export interface HealthHistoryProps {
  crewName: string;
  title?: string;
  history: CrewHistory;
  /** UTC day index of "today" in the simulation. */
  today: number;
  sync?: SyncInfo;
  className?: string;
}

const VERDICT_LABEL: Record<Verdict, string> = {
  improving: "Improving", worsening: "Worsening", stable: "Stable", changing: "Changing", none: "Not enough data",
};

/** The shape differs by status, so colour is never the only signal. */
function Mark({ status }: { status: Status }) {
  return <span className={`hh-mark hh-mark-${status}`} aria-hidden="true" />;
}

function Shape({ status, x, y, r = 3.4 }: { status: Status; x: number; y: number; r?: number }) {
  return (
    <g className={`hh-${status}`} fill="currentColor">
      {status === "ok" && <circle cx={x} cy={y} r={r} />}
      {status === "watch" && <polygon points={`${x},${y - r * 1.3} ${x + r * 1.3},${y} ${x},${y + r * 1.3} ${x - r * 1.3},${y}`} />}
      {status === "alert" && <rect x={x - r} y={y - r} width={r * 2} height={r * 2} />}
    </g>
  );
}

const clamp = (v: number, [lo, hi]: readonly [number, number]) => Math.min(hi, Math.max(lo, v));

function scale(def: IndicatorDef, range: Range, today: number, w: number, h: number, padX: number, padY: number) {
  const [d0, d1] = def.domain;
  const start = today - range + 1;
  return {
    start,
    x: (day: number) => padX + ((day - start) / Math.max(1, range - 1)) * (w - padX * 2),
    y: (v: number) => h - padY - ((clamp(v, def.domain) - d0) / (d1 - d0)) * (h - padY * 2),
  };
}

function Sparkline({ def, points, today, range }: { def: IndicatorDef; points: HistoryPoint[]; today: number; range: Range }) {
  const W = 84, H = 30;
  const { x, y } = scale(def, range, today, W, H, 4, 4);
  const last = points[points.length - 1];
  return (
    <svg className="hh-spark" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <rect className="hh-band" x={0} width={W} y={y(def.ok[1])} height={Math.max(0, y(def.ok[0]) - y(def.ok[1]))} />
      {points.length > 1 && <polyline className="hh-line" fill="none" points={points.map((p) => `${x(p.day).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ")} />}
      {last && <Shape status={statusOf(def, last)} x={x(last.day)} y={y(last.value)} r={3} />}
    </svg>
  );
}

function IndicatorChart({ def, points, today, range }: { def: IndicatorDef; points: HistoryPoint[]; today: number; range: Range }) {
  const W = 320, H = 140;
  const { start, x, y } = scale(def, range, today, W, H, 34, 14);
  const [d0, d1] = def.domain;
  return (
    <svg className="hh-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${def.label}, last ${range} days. The shaded band is the in-range zone.`}>
      <rect className="hh-band" x={34} width={W - 68} y={y(def.watch[1])} height={Math.max(0, y(def.watch[0]) - y(def.watch[1]))} opacity="0.5" />
      <rect className="hh-band" x={34} width={W - 68} y={y(def.ok[1])} height={Math.max(0, y(def.ok[0]) - y(def.ok[1]))} />
      <line className="hh-axis" x1={34} x2={W - 34} y1={H - 14} y2={H - 14} />
      <text className="hh-axis-label" x={30} y={y(d1) + 3} textAnchor="end">{formatNumber(def, d1)}</text>
      <text className="hh-axis-label" x={30} y={y(d0) + 3} textAnchor="end">{formatNumber(def, d0)}</text>
      <text className="hh-axis-label" x={34} y={H - 1} textAnchor="start">{formatDay(start)}</text>
      <text className="hh-axis-label" x={W - 34} y={H - 1} textAnchor="end">{formatDay(today)}</text>
      {points.length > 1 && <polyline className="hh-line" fill="none" points={points.map((p) => `${x(p.day).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ")} />}
      {points.map((p) => <Shape key={p.day} status={statusOf(def, p)} x={x(p.day)} y={y(p.value)} />)}
    </svg>
  );
}

function Detail({ def, points, today, range, id }: { def: IndicatorDef; points: HistoryPoint[]; today: number; range: Range; id: string }) {
  if (points.length === 0) {
    return <div className="hh-detail" id={id}><p className="hh-note">No readings in the last {range} days.</p></div>;
  }
  const values = points.map((p) => p.value);
  const avg = values.reduce((t, v) => t + v, 0) / values.length;
  const outside = points.filter((p) => statusOf(def, p) !== "ok").length;
  const rows = points.slice(-7).reverse();
  return (
    <div className="hh-detail" id={id}>
      <p className="hh-summary-line">
        Last {range} days · {points.length} reading{points.length === 1 ? "" : "s"} · average {formatNumber(def, avg)} {def.unit} ·
        lowest {formatNumber(def, Math.min(...values))} · highest {formatNumber(def, Math.max(...values))} ·{" "}
        <strong className={outside > 0 ? "hh-watch" : "hh-ok"}>{outside === 0 ? "all in range" : `${outside} outside range`}</strong>
      </p>
      <IndicatorChart def={def} points={points} today={today} range={range} />
      <p className="hh-note">Reference (demo values): {def.refText}</p>
      <table className="hh-table">
        <caption className="hh-visually-hidden">{def.label}, most recent readings</caption>
        <thead><tr><th scope="col">DATE</th><th scope="col">VALUE</th><th scope="col">STATUS</th></tr></thead>
        <tbody>
          {rows.map((p) => {
            const status = statusOf(def, p);
            return (
              <tr key={p.day}>
                <td>{formatDay(p.day)}</td>
                <td className={`hh-${status}`}><strong>{formatValue(def, p)}</strong> <small>{def.unit}</small></td>
                <td className={`hh-${status}`}><Mark status={status} /> {STATUS_LABEL[status]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export const HealthHistory = memo(function HealthHistory({ crewName, title, history, today, sync, className }: HealthHistoryProps) {
  const [range, setRange] = useState<Range>(14);

  const rows = useMemo(
    () =>
      INDICATORS.map((def) => {
        const points = windowPoints(history[def.id], today, range);
        const latest = points[points.length - 1];
        return { def, points, latest, status: latest ? statusOf(def, latest) : null, trend: trendOf(def, points) };
      }),
    [history, today, range]
  );

  const counts = useMemo(() => {
    const c: Record<Status, number> = { ok: 0, watch: 0, alert: 0 };
    for (const r of rows) if (r.status) c[r.status]++;
    return c;
  }, [rows]);

  // Start with the most worrying indicator open, so the first thing you see is what needs attention.
  const [open, setOpen] = useState<IndicatorId | null>(() => {
    const first = (s: Status) => INDICATORS.find((d) => {
      const l = latestOf(history[d.id], today);
      return l && statusOf(d, l) === s;
    });
    return (first("alert") ?? first("watch") ?? INDICATORS[0]).id;
  });

  const syncClass = sync && (sync.pending > 0 || sync.staleMinutes !== null) ? "is-warn" : "";

  return (
    <section className={`hh ${className ?? ""}`} aria-label={`Health history for ${crewName}`}>
      <div className="hh-head">
        <div>
          <span className="eyebrow">HEALTH HISTORY</span>
          <h2>{title ?? crewName}</h2>
        </div>
        {sync && (
          <span className={`hh-sync ${syncClass}`} role="status">
            <i />
            {sync.perspective === "self"
              ? sync.pending > 0
                ? `${sync.pending} UPDATE${sync.pending === 1 ? "" : "S"} WAITING FOR LINK`
                : `SYNCED WITH BASE · ${formatClock(sync.syncedAt)}`
              : sync.staleMinutes !== null
                ? `NO NEW DATA FOR ${sync.staleMinutes} MIN · LAST ${formatClock(sync.syncedAt)}`
                : `BASE SERVER COPY · UPDATED ${formatClock(sync.syncedAt)}`}
          </span>
        )}
      </div>

      <div className="hh-tools">
        <div className="segmented-control" role="group" aria-label="Time range">
          {RANGES.map((r) => (
            <button key={r} type="button" aria-pressed={range === r} className={range === r ? "selected" : ""} onClick={() => setRange(r)}>
              {r} days
            </button>
          ))}
        </div>
      </div>

      <div className="hh-summary" role="group" aria-label="Latest readings by status">
        {(["ok", "watch", "alert"] as Status[]).map((s) => (
          <div key={s} className={`hh-${s}`}>
            <span className="hh-summary-label"><Mark status={s} /> {STATUS_LABEL[s].toUpperCase()}</span>
            <strong>{String(counts[s]).padStart(2, "0")}</strong>
          </div>
        ))}
      </div>

      {GROUPS.map((group) => (
        <div className="hh-group" key={group.id}>
          <span className="eyebrow hh-group-title">{group.label.toUpperCase()}</span>
          {rows.filter((r) => r.def.group === group.id).map(({ def, points, latest, status, trend }) => {
            const expanded = open === def.id;
            const panelId = `hh-${crewName.replace(/\W+/g, "")}-${def.id}`;
            return (
              <div key={def.id}>
                <button type="button" className="hh-row" aria-expanded={expanded} aria-controls={panelId} onClick={() => setOpen(expanded ? null : def.id)}>
                  <span className="hh-name">
                    <strong>{def.label}</strong>
                    <small className={`hh-trend hh-trend-${trend.verdict}`}>{trend.arrow} {VERDICT_LABEL[trend.verdict]}</small>
                  </span>
                  <Sparkline def={def} points={points} today={today} range={range} />
                  <span className="hh-latest">
                    {latest && status ? (
                      <>
                        <span className={`hh-value hh-${status}`}>{formatValue(def, latest)}<small> {def.unit}</small></span>
                        <span className={`hh-status hh-${status}`}><Mark status={status} /> {STATUS_LABEL[status]}</span>
                      </>
                    ) : (
                      <span className="hh-status">No data</span>
                    )}
                  </span>
                </button>
                {expanded && <Detail def={def} points={points} today={today} range={range} id={panelId} />}
              </div>
            );
          })}
        </div>
      ))}

      <p className="hh-note hh-legend">
        <Mark status="ok" /> in range &nbsp; <Mark status="watch" /> watch &nbsp; <Mark status="alert" /> out of range. Reference ranges are demo values, not clinical limits.
      </p>
    </section>
  );
});