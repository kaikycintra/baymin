import { useState } from "react";
import { RemedyInventory } from "../components/remedy-inventory";
import type { DemoPageProps } from "../demo-types";
import { SyncedHealthHistory } from "../demo/history/SyncedHealthHistory";

const missionData = {
  "Artemis X": { cmo: "Dr. Elena Park", crew: ["Maya Chen", "Jonas Weber", "Leah Okafor", "Tomas Varga"], orbit: "Mars surface · Day 47" },
  "Gateway Resupply 2": { cmo: "Dr. Samir Patel", crew: ["Nia Brooks", "Owen Kim", "Rafael Costa"], orbit: "NRHO · Day 06" },
  "Mars Transit Demo": { cmo: "Dr. Anika Rao", crew: ["Avery Cole", "Mei Tan", "Dmitri Volkov"], orbit: "Transit · Day 142" },
};

type MissionName = keyof typeof missionData;

export function SurgeonPage({ anomalyActive, location }: DemoPageProps) {
  const [mission, setMission] = useState<MissionName>("Artemis X");
  const [crewMember, setCrewMember] = useState("Maya Chen");
  const [sleepStart, setSleepStart] = useState("21:30");
  const [routineSaved, setRoutineSaved] = useState(false);
  const activeMission = missionData[mission];

  function changeMission(value: MissionName) {
    setMission(value);
    setCrewMember(missionData[value].crew[0]);
    setRoutineSaved(false);
  }

  return (
    <>
      <section className="page-heading">
        <div>
          <span className="eyebrow">FLIGHT SURGEON / MULTI-MISSION</span>
          <h1>Mission oversight<span>.</span></h1>
          <p>Review crew history and trends, and adjust sleep routines for the mission team.</p>
        </div>
        <div className="heading-readout"><span className="eyebrow">MISSIONS</span><strong>03</strong><span>3 CMOs CONNECTED</span></div>
      </section>

      <section className="mission-picker-panel">
        <label className="mission-picker">
          <span className="eyebrow">SELECT MISSION</span>
          <select value={mission} onChange={(event) => changeMission(event.target.value as MissionName)}>
            {Object.keys(missionData).map((name) => <option key={name}>{name}</option>)}
          </select>
        </label>
        <div className="mission-brief"><span className="eyebrow">MISSION STATUS</span><strong>{activeMission.orbit}</strong></div>
        <div className="mission-brief"><span className="eyebrow">MISSION CMO</span><strong>{activeMission.cmo}</strong></div>
        <div className="mission-brief"><span className="eyebrow">CREW</span><strong>{activeMission.crew.length} astronauts</strong></div>
      </section>

      <div className="surgeon-grid">
        <section className="content-section routine-editor">
          <div className="section-heading">
            <div><span className="eyebrow">CARE PLAN / EDIT</span><h2>Adjust a routine</h2></div>
            <span className="permission-tag">SURGEON AUTHORITY</span>
          </div>
          <label className="field-label">ASTRONAUT
            <select value={crewMember} onChange={(event) => { setCrewMember(event.target.value); setRoutineSaved(false); }}>
              {activeMission.crew.map((member) => <option key={member}>{member}</option>)}
            </select>
          </label>
          <label className="field-label">SCHEDULED SLEEP WINDOW START
            <input type="time" value={sleepStart} onChange={(event) => { setSleepStart(event.target.value); setRoutineSaved(false); }} />
          </label>
          <div className="routine-preview">
            <span className="eyebrow">CHANGE PREVIEW</span>
            <p>{crewMember} · sleep window begins at {sleepStart}</p>
          </div>
          <button className="button button-primary full-button" type="button" onClick={() => setRoutineSaved(true)}>
            {routineSaved ? "Routine update queued" : "Save routine update"}
          </button>
          {routineSaved && <p className="success-note" role="status">Mock update queued for the mission CMO and astronaut app.</p>}
        </section>

        <div className="surgeon-side-column">
          <section className="alert-list-panel trend-flags-panel">
            <div className="section-heading compact-heading"><div><span className="eyebrow">LONGITUDINAL REVIEW</span><h2>Trend flags</h2></div><span className="alert-count">02</span></div>
            <article className="mission-alert mission-alert-amber">
              <div className="alert-meta"><span>BEHAVIORAL HEALTH</span><time>7 DAYS</time></div>
              <strong>Jonas Weber · fatigue pattern</strong>
              <p>Sleep and cognitive response trends are below the crew member's recent baseline. CMO review requested.</p>
              <span className="location-chip">EARLY REVIEW FLAG · NOT A DIAGNOSIS</span>
            </article>
            {anomalyActive && (
              <article className="mission-alert mission-alert-red">
                <div className="alert-meta"><span>ENVIRONMENTAL CORRELATION</span><time>NOW</time></div>
                <strong>Maya Chen · local event</strong>
                <p>Biometric and symptom inputs overlap with a simulated CO₂ event at the {location === "rover" ? "rover" : "Mars base"}.</p>
              </article>
            )}
          </section>

        </div>
      </div>
      <section className="content-section">
        <SyncedHealthHistory crewName={crewMember} viewer="server" className="hh-spaced" />
      </section>
      <RemedyInventory key={mission} canEdit={false} missionConnected={mission === "Artemis X"} />
    </>
  );
}