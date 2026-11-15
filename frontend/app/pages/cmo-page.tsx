import { useState } from "react";
import { RemedyInventory } from "../components/remedy-inventory";
import type { DemoPageProps } from "../demo-types";

const crew = [
  { name: "Maya Chen", role: "Commander · EVA lead", sleep: "7.6 h", cognitive: "286 ms", status: "Monitoring" },
  { name: "Jonas Weber", role: "Pilot · Systems", sleep: "5.9 h", cognitive: "338 ms", status: "Trend flag" },
  { name: "Leah Okafor", role: "Mission specialist", sleep: "7.8 h", cognitive: "274 ms", status: "Stable" },
  { name: "Tomas Varga", role: "Mission specialist", sleep: "7.2 h", cognitive: "291 ms", status: "Stable" },
];

export function CmoPage({ anomalyActive, location }: DemoPageProps) {
  const [selectedCrew, setSelectedCrew] = useState(crew[0].name);
  const [environmentAcknowledged, setEnvironmentAcknowledged] = useState(false);
  const selectedMember = crew.find((member) => member.name === selectedCrew) ?? crew[0];

  return (
    <>
      <section className="page-heading">
        <div>
          <span className="eyebrow">MISSION MEDICAL OFFICER / ARTEMIS III</span>
          <h1>Crew health<span>.</span></h1>
          <p>Mission-wide routines, behavioral trends, and active event review.</p>
        </div>
        <div className="heading-readout cmo-readout"><span className="eyebrow">CREW STATUS</span><strong>04</strong><span>1 TREND FLAG</span></div>
      </section>

      <div className="summary-strip">
        <div><span className="eyebrow">ROUTINES DUE</span><strong>03</strong><small>across 4 crew</small></div>
        <div><span className="eyebrow">BEHAVIORAL FLAGS</span><strong className="tone-amber">01</strong><small>sleep + cognition trend</small></div>
        <div><span className="eyebrow">ENVIRONMENTAL ALERTS</span><strong className={anomalyActive ? "tone-red" : ""}>{anomalyActive ? "01" : "00"}</strong><small>{anomalyActive ? "correlation review" : "no active events"}</small></div>
        <div><span className="eyebrow">LAST SYNC</span><strong>08:31</strong><small>ship/base server</small></div>
      </div>

      <div className="dashboard-grid cmo-grid">
        <section className="content-section crew-section">
          <div className="section-heading">
            <div><span className="eyebrow">ARTEMIS III / CREW ROSTER</span><h2>Mission roster</h2></div>
            <span className="crew-count">4 MEMBERS</span>
          </div>
          <div className="crew-table">
            <div className="crew-table-row crew-table-head"><span>CREW MEMBER</span><span>SLEEP</span><span>REACTION</span><span>STATUS</span></div>
            {crew.map((member) => (
              <button
                className={`crew-table-row crew-select ${selectedCrew === member.name ? "is-selected" : ""}`}
                key={member.name}
                type="button"
                onClick={() => setSelectedCrew(member.name)}
              >
                <span className="crew-name"><strong>{member.name}</strong><small>{member.role}</small></span>
                <strong>{member.sleep}</strong>
                <strong>{member.cognitive}</strong>
                <span className={`crew-status ${member.status === "Trend flag" ? "status-warning" : ""}`}>{member.status}</span>
              </button>
            ))}
          </div>
          <div className="selected-member-panel">
            <div><span className="eyebrow">SELECTED CREW MEMBER</span><h3>{selectedMember.name}</h3><p>{selectedMember.role}</p></div>
            <div className="member-measures"><span>7-day sleep avg <strong>{selectedMember.sleep}</strong></span><span>Reaction avg <strong>{selectedMember.cognitive}</strong></span></div>
          </div>
        </section>

        <aside className="side-column">
          <section className="alert-list-panel">
            <div className="section-heading compact-heading">
              <div><span className="eyebrow">NEEDS REVIEW</span><h2>Mission alerts</h2></div>
              <span className="alert-count">{anomalyActive ? "02" : "01"}</span>
            </div>
            {anomalyActive && (
              <article className="mission-alert mission-alert-red">
                <div className="alert-meta"><span>ENVIRONMENT + BIOMETRIC</span><time>NOW</time></div>
                <strong>Maya Chen · correlation flag</strong>
                <p>Elevated HR and headache report coincide with a simulated habitat CO₂ excursion. Verify telemetry and assess per mission protocol.</p>
                <span className="location-chip">{location === "rover" ? "ROVER CONTEXT" : "HABITAT TELEMETRY"}</span>
                <button className="text-action" type="button" onClick={() => setEnvironmentAcknowledged((value) => !value)}>
                  {environmentAcknowledged ? "Acknowledged" : "Acknowledge event"}
                </button>
              </article>
            )}
            <article className="mission-alert mission-alert-amber">
              <div className="alert-meta"><span>BEHAVIORAL TREND</span><time>3 DAYS</time></div>
              <strong>Jonas Weber · sleep/cognition</strong>
              <p>Sleep duration and reaction scores have declined across consecutive check-ins. Review workload and circadian schedule.</p>
              <button className="text-action" type="button" onClick={() => setSelectedCrew("Jonas Weber")}>Review crew record</button>
            </article>
          </section>
          <section className="recommendation-panel">
            <span className="eyebrow">SERVER RECOMMENDATION</span>
            <h3>Awaiting mission analysis</h3>
            <p>Health summaries and recommendations from ship/base are shown here when received.</p>
            <span className="sync-stamp"><i /> BIDIRECTIONAL SYNC READY</span>
          </section>
        </aside>
      </div>
      <RemedyInventory canEdit />
    </>
  );
}
