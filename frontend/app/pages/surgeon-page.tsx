import { useState } from "react";
import type { FormEvent } from "react";
import { RemedyInventory } from "../components/remedy-inventory";
import type { DemoPageProps } from "../demo-types";

const missionData = {
  "Artemis III": { cmo: "Dr. Elena Park", crew: ["Maya Chen", "Jonas Weber", "Leah Okafor", "Tomas Varga"], orbit: "Lunar surface · Sol 18" },
  "Gateway Resupply 2": { cmo: "Dr. Samir Patel", crew: ["Nia Brooks", "Owen Kim", "Rafael Costa"], orbit: "NRHO · Day 06" },
  "Mars Transit Demo": { cmo: "Dr. Anika Rao", crew: ["Avery Cole", "Mei Tan", "Dmitri Volkov"], orbit: "Transit · Day 142" },
};

type MissionName = keyof typeof missionData;

export function SurgeonPage({ anomalyActive, location }: DemoPageProps) {
  const [mission, setMission] = useState<MissionName>("Artemis III");
  const [crewMember, setCrewMember] = useState("Maya Chen");
  const [sleepStart, setSleepStart] = useState("21:30");
  const [extraCheckin, setExtraCheckin] = useState(false);
  const [routineSaved, setRoutineSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [sentMessages, setSentMessages] = useState<string[]>([]);
  const activeMission = missionData[mission];

  function changeMission(value: MissionName) {
    setMission(value);
    setCrewMember(missionData[value].crew[0]);
    setRoutineSaved(false);
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    setSentMessages((current) => [`To ${crewMember}: ${trimmed}`, ...current]);
    setMessage("");
  }

  return (
    <>
      <section className="page-heading">
        <div>
          <span className="eyebrow">FLIGHT SURGEON / MULTI-MISSION</span>
          <h1>Mission oversight<span>.</span></h1>
          <p>Review crew trends, adjust routines, and communicate with the mission team.</p>
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
          <label className="check-option">
            <input type="checkbox" checked={extraCheckin} onChange={(event) => { setExtraCheckin(event.target.checked); setRoutineSaved(false); }} />
            <span><strong>Add extra cognitive check-in</strong><small>Schedule an additional reaction check during the next duty cycle.</small></span>
          </label>
          <div className="routine-preview">
            <span className="eyebrow">CHANGE PREVIEW</span>
            <p>{crewMember} · sleep window begins at {sleepStart}{extraCheckin ? " · additional cognitive check-in" : " · standard cognitive cadence"}</p>
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
                <p>Biometric and symptom inputs overlap with a simulated CO₂ event in the {location} context.</p>
              </article>
            )}
          </section>

          <section className="message-panel">
            <div className="section-heading compact-heading"><div><span className="eyebrow">PRIVATE CHANNEL</span><h2>Crew message</h2></div><span className="private-tag">PRIVATE</span></div>
            <form onSubmit={sendMessage}>
              <label className="field-label">RECIPIENT
                <select value={crewMember} onChange={(event) => setCrewMember(event.target.value)}>
                  {activeMission.crew.map((member) => <option key={member}>{member}</option>)}
                </select>
              </label>
              <label className="field-label">MESSAGE
                <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write a private mission message..." rows={3} />
              </label>
              <button className="button button-secondary full-button" type="submit" disabled={!message.trim()}>Send message</button>
            </form>
            {sentMessages.length > 0 && (
              <div className="sent-message-list" aria-live="polite">
                {sentMessages.map((sentMessage, index) => <p key={`${sentMessage}-${index}`}>{sentMessage}<small>JUST NOW · DEMO</small></p>)}
              </div>
            )}
          </section>
        </div>
      </div>
      <RemedyInventory key={mission} canEdit={false} missionConnected={mission === "Artemis III"} />
    </>
  );
}
