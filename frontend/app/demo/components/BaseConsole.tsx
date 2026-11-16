// Save as: app/demo/components/BaseConsole.tsx (REPLACES yours)
import { CO2_ALARM, CO2_CAUTION, HR_LIMIT, MISSION, PLACE_LABEL } from "../sim/constants";
import { useSim } from "../sim/context";
import { formatClock, formatPpm, marsDay, missionDay } from "../sim/format";
import { co2Level } from "../sim/state";
import { Co2Chart } from "./Co2Chart";
import { GlobalAlert } from "./GlobalAlert";
import { RemedyStorage } from "./RemedyStorage";
import { ReportInbox } from "./ReportInbox";

const LEVEL_TEXT = { nominal: "Nominal", caution: "Caution", alarm: "Alarm" } as const;

const OTHER_CREW = [
  { name: "Jonas Weber", heartRate: 64, spo2: 98 },
  { name: "Leah Okafor", heartRate: 61, spo2: 99 },
  { name: "Tomas Varga", heartRate: 66, spo2: 98 },
];

/** The Mars base server screen: what the base knows, from the events it has received. */
export function BaseConsole() {
  const { state } = useSim();
  const { base, link, location, outbox } = state;
  const level = co2Level(base.env.co2);
  const place = location === "rover" ? "Rover" : PLACE_LABEL.habitat;
  const mars = marsDay(state.clock);
  const activeAlerts = base.alerts.filter((a) => a.clearedAt === null);
  const resolved = base.alerts.filter((a) => a.clearedAt !== null).slice(0, 4);
  const hrHigh = base.crew !== null && base.crew.heartRate > HR_LIMIT;

  return (
    <section className="console" aria-label="Base server console">
      <header className="console-bar">
        <span className="eyebrow">
          MARS BASE SERVER · {MISSION.name.toUpperCase()} · MISSION DAY {String(missionDay(state.clock)).padStart(3, "0")} · {mars ? `MARS DAY ${mars}` : "IN TRANSIT"}
        </span>
        <span className={`console-link console-link-${link}`}>
          ● CREW LINK {link.toUpperCase()}
          {outbox.length > 0 ? ` · ${outbox.length} QUEUED ON DEVICE` : ""}
        </span>
        <span className="eyebrow">{formatClock(state.clock, true)} UTC</span>
      </header>

      {level === "alarm" && <GlobalAlert ppm={base.env.co2} location={location} />}

      <div className="console-body">
        <section className="console-block">
          <div className="section-heading compact-heading">
            <div><span className="eyebrow">ENVIRONMENT · {place.toUpperCase()}</span><h2>Cabin air</h2></div>
            <span className={`level-chip level-${level}`}>{LEVEL_TEXT[level]}</span>
          </div>
          <div className="console-readout">
            <strong>{formatPpm(base.env.co2)}<small> ppm CO₂</small></strong>
            <span>{base.env.temp.toFixed(1)} °C · updated {formatClock(base.env.at, true)}</span>
          </div>
          <Co2Chart history={base.co2History} />
          <p className="footnote">Demo thresholds: caution at {formatPpm(CO2_CAUTION)} ppm, alarm at {formatPpm(CO2_ALARM)} ppm.</p>
        </section>

        <section className="console-block">
          <div className="section-heading compact-heading">
            <div><span className="eyebrow">CREW TELEMETRY</span><h2>Vitals</h2></div>
            <span className="crew-count">{MISSION.crewCount} CREW</span>
          </div>
          <div className="console-table">
            <div className="console-row console-row-head"><span>CREW MEMBER</span><span>HEART RATE</span><span>SPO₂</span></div>
            <div className="console-row">
              <span className="crew-name">
                <strong>{MISSION.astronaut}</strong>
                <small>{base.crew ? `Live · ${formatClock(base.crew.at, true)}` : "No data yet"}</small>
              </span>
              <strong className={hrHigh ? "tone-red" : ""}>{base.crew ? `${base.crew.heartRate} bpm` : "—"}</strong>
              <strong>{base.crew ? `${base.crew.spo2}%` : "—"}</strong>
            </div>
            {OTHER_CREW.map((member) => (
              <div className="console-row" key={member.name}>
                <span className="crew-name"><strong>{member.name}</strong><small>Static demo data</small></span>
                <strong>{member.heartRate} bpm</strong>
                <strong>{member.spo2}%</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="console-block">
          <div className="section-heading compact-heading">
            <div><span className="eyebrow">NEEDS REVIEW</span><h2>Alerts</h2></div>
            <span className="alert-count">{String(activeAlerts.length).padStart(2, "0")}</span>
          </div>
          {activeAlerts.length === 0 && <p className="inbox-empty">No active alerts.</p>}
          {activeAlerts.map((a) => (
            <article className={`mission-alert ${a.severity === "alarm" ? "mission-alert-red" : "mission-alert-amber"}`} key={a.id}>
              <div className="alert-meta"><span>{a.severity.toUpperCase()}</span><time>SINCE {formatClock(a.raisedAt)}</time></div>
              <strong>{a.title}</strong>
              <p>{a.detail}</p>
            </article>
          ))}
          {resolved.length > 0 && (
            <div className="console-resolved">
              <span className="eyebrow">RESOLVED</span>
              {resolved.map((a) => (
                <p key={a.id}>{a.title} · {formatClock(a.raisedAt)} to {formatClock(a.clearedAt ?? a.raisedAt)}</p>
              ))}
            </div>
          )}
        </section>

        <section className="console-block">
          <RemedyStorage />
        </section>

        <section className="console-block">
          <div className="section-heading compact-heading">
            <div><span className="eyebrow">FROM THE SYMPTOM GUIDE</span><h2>Crew reports</h2></div>
            <span className="alert-count">{String(base.reports.length).padStart(2, "0")}</span>
          </div>
          <ReportInbox reports={base.reports} />
        </section>
      </div>
    </section>
  );
}