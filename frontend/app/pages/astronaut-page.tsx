import { useEffect, useRef, useState } from "react";
import type { DemoPageProps } from "../demo-types";

type Task = {
  id: string;
  time: string;
  title: string;
  detail: string;
  state: "done" | "now" | "next";
};

const initialTasks: Task[] = [
  { id: "hydration", time: "07:30", title: "Hydration & vitals", detail: "Morning check · 4 min", state: "done" },
  { id: "checkin", time: "09:00", title: "Circadian & mood check-in", detail: "Sleep quality and mood · 2 min", state: "now" },
  { id: "exercise", time: "11:30", title: "Resistance exercise", detail: "Lower-body protocol · 35 min", state: "next" },
];

const sleepHistory = [
  { day: "M", hours: 7.4, score: 78 },
  { day: "T", hours: 8.1, score: 84 },
  { day: "W", hours: 6.8, score: 69 },
  { day: "T", hours: 7.2, score: 74 },
  { day: "F", hours: 8.3, score: 89 },
  { day: "S", hours: 7.9, score: 82 },
  { day: "S", hours: 7.6, score: 80 },
];

export function AstronautPage({ anomalyActive, location }: DemoPageProps) {
  const [section, setSection] = useState<"routine" | "history">("routine");
  const [completedTasks, setCompletedTasks] = useState<string[]>(["hydration"]);
  const [sleepQuality, setSleepQuality] = useState(7);
  const [mood, setMood] = useState("Steady");
  const [checkinSaved, setCheckinSaved] = useState(false);

  function toggleTask(id: string) {
    setCompletedTasks((current) =>
      current.includes(id) ? current.filter((taskId) => taskId !== id) : [...current, id],
    );
  }

  return (
    <>
      <section className="page-heading">
        <div>
          <span className="eyebrow">CREW MEMBER / ASTRONAUT</span>
          <h1>Good morning, Maya<span>.</span></h1>
          <p>Health routine and personal trend history for Artemis III.</p>
        </div>
        <div className="heading-readout">
          <span className="eyebrow">MISSION DAY</span>
          <strong>018</strong>
          <span>LOCAL TIME · 08:42</span>
        </div>
      </section>

      <div className="dashboard-grid astronaut-grid">
        <section className="content-section routine-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">PERSONAL HEALTH LOG</span>
              <h2>My health</h2>
            </div>
            <div className="segmented-control" role="tablist" aria-label="Personal health views">
              <button
                type="button"
                role="tab"
                aria-selected={section === "routine"}
                className={section === "routine" ? "selected" : ""}
                onClick={() => setSection("routine")}
              >
                Routine
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={section === "history"}
                className={section === "history" ? "selected" : ""}
                onClick={() => setSection("history")}
              >
                History
              </button>
            </div>
          </div>

          {section === "routine" ? (
            <>
              <div className="routine-list">
                {initialTasks.map((task) => {
                  const done = completedTasks.includes(task.id);
                  return (
                    <div className={`routine-row ${done ? "is-complete" : ""}`} key={task.id}>
                      <button
                        className="task-check"
                        type="button"
                        aria-label={`${done ? "Mark incomplete" : "Mark complete"}: ${task.title}`}
                        aria-pressed={done}
                        onClick={() => toggleTask(task.id)}
                      >
                        {done ? "OK" : task.time}
                      </button>
                      <div className="routine-copy">
                        <strong>{task.title}</strong>
                        <span>{task.detail}</span>
                      </div>
                      <span className={`task-state state-${task.state}`}>{done ? "DONE" : task.state.toUpperCase()}</span>
                    </div>
                  );
                })}
              </div>

              <form
                className="checkin-panel"
                onSubmit={(event) => {
                  event.preventDefault();
                  setCheckinSaved(true);
                }}
              >
                <div className="checkin-title">
                  <div>
                    <span className="eyebrow">DAILY CHECK-IN</span>
                    <h3>Circadian & mood</h3>
                  </div>
                  <span className="duration-tag">~2 MIN</span>
                </div>
                <label className="range-label" htmlFor="sleep-quality">
                  <span>Sleep quality</span>
                  <strong>{sleepQuality}<small> / 10</small></strong>
                </label>
                <input
                  id="sleep-quality"
                  type="range"
                  min="1"
                  max="10"
                  value={sleepQuality}
                  onChange={(event) => {
                    setSleepQuality(Number(event.target.value));
                    setCheckinSaved(false);
                  }}
                />
                <div className="mood-row" aria-label="Select current mood">
                  {(["Low", "Steady", "Good"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={mood === option ? "mood-option selected" : "mood-option"}
                      aria-pressed={mood === option}
                      onClick={() => {
                        setMood(option);
                        setCheckinSaved(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="checkin-actions">
                  <ReactionCheck />
                  <button className="button button-primary" type="submit">
                    {checkinSaved ? "Check-in saved" : "Save check-in"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="history-view">
              <div className="history-summary">
                <div><span className="eyebrow">7-DAY SLEEP AVG</span><strong>7.6 <small>hr</small></strong></div>
                <div><span className="eyebrow">COGNITIVE CHECK</span><strong>286 <small>ms</small></strong></div>
                <div><span className="eyebrow">MOOD TREND</span><strong>Stable</strong></div>
              </div>
              <h3>Sleep quality · last 7 days</h3>
              <div className="trend-chart" role="img" aria-label="Sleep quality scores across the last seven days">
                {sleepHistory.map((entry, index) => (
                  <div className="trend-column" key={`${entry.day}-${index}`}>
                    <span className="trend-value">{entry.score}</span>
                    <div className="trend-track"><i style={{ height: `${entry.score}%` }} /></div>
                    <span className="trend-day">{entry.day}</span>
                  </div>
                ))}
              </div>
              <div className="history-table">
                <div className="history-row history-header"><span>MEASUREMENT</span><span>TODAY</span><span>7-DAY TREND</span></div>
                <div className="history-row"><span>Resting heart rate</span><strong>{anomalyActive ? "112 bpm*" : "68 bpm"}</strong><span className="trend-neutral">Baseline</span></div>
                <div className="history-row"><span>Blood pressure</span><strong>118 / 76</strong><span className="trend-positive">Within range</span></div>
                <div className="history-row"><span>Sleep duration</span><strong>7 h 36 m</strong><span className="trend-neutral">+ 18 min</span></div>
                {anomalyActive && <p className="footnote">* Simulated reading during the active environmental event.</p>}
              </div>
            </div>
          )}
        </section>

        <aside className="side-column">
          <section className={`health-status-panel ${anomalyActive ? "status-alert" : ""}`}>
            <div className="section-heading compact-heading">
              <div><span className="eyebrow">LIVE STATUS</span><h2>{anomalyActive ? "Review needed" : "All clear"}</h2></div>
              <span className={`status-mark ${anomalyActive ? "alert-mark" : ""}`}>{anomalyActive ? "!" : "OK"}</span>
            </div>
            {anomalyActive ? (
              <>
                <p className="status-message">Elevated heart rate and reported headache coincide with the local CO₂ excursion. This is a simulated correlation, not a diagnosis.</p>
                <div className="context-note">
                  <span className="eyebrow">{location === "rover" ? "ROVER CONTEXT" : "HABITAT CONTEXT"}</span>
                  <p>{location === "rover" ? "Follow the mission environmental checklist and confirm crew location and suit telemetry." : "Check habitat telemetry and follow the mission medical checklist."}</p>
                </div>
              </>
            ) : (
              <p className="status-message">No active alerts. Your latest routine sync completed at 08:31.</p>
            )}
            <div className="vitals-grid">
              <div><span>HEART RATE</span><strong>{anomalyActive ? "112" : "68"}<small> bpm</small></strong></div>
              <div><span>O₂ SATURATION</span><strong>98<small>%</small></strong></div>
            </div>
          </section>

          <section className="history-callout">
            <div><span className="eyebrow">MISSION SUPPORT</span><h3>Your data stays in sync</h3></div>
            <p>Recommendations from the ship/base team appear here when available.</p>
            <span className="sync-stamp"><i /> LAST SYNC · 08:31</span>
          </section>
        </aside>
      </div>
    </>
  );
}

function ReactionCheck() {
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(30);
  const [targetVisible, setTargetVisible] = useState(false);
  const [responses, setResponses] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const targetAt = useRef(0);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (!running || targetVisible) return;
    const cueTimer = window.setTimeout(() => {
      targetAt.current = performance.now();
      setTargetVisible(true);
    }, 850 + Math.random() * 1500);
    return () => window.clearTimeout(cueTimer);
  }, [running, targetVisible, responses]);

  useEffect(() => {
    if (remaining === 0 && running) {
      setRunning(false);
      setTargetVisible(false);
      setFinished(true);
    }
  }, [remaining, running]);

  function startTest() {
    setRemaining(30);
    setResponses([]);
    setFinished(false);
    setTargetVisible(false);
    setRunning(true);
  }

  function recordResponse() {
    if (!targetVisible) return;
    setResponses((current) => [...current, Math.round(performance.now() - targetAt.current)]);
    setTargetVisible(false);
  }

  const average = responses.length
    ? Math.round(responses.reduce((total, response) => total + response, 0) / responses.length)
    : null;

  return (
    <div className="reaction-check">
      <div className="reaction-copy">
        <span className="eyebrow">COGNITIVE CHECK</span>
        <strong>30-second reaction test</strong>
        <span>{running ? `${remaining}s remaining · ${responses.length} responses` : finished ? `Average response · ${average ?? "No"} ms` : "Tap only when the target appears."}</span>
      </div>
      {running ? (
        <button
          className={`reaction-target ${targetVisible ? "target-ready" : ""}`}
          type="button"
          disabled={!targetVisible}
          onClick={recordResponse}
          aria-label={targetVisible ? "Target appeared, tap to record reaction" : "Wait for the target"}
        >
          {targetVisible ? "TAP" : "WAIT"}
        </button>
      ) : (
        <button className="button button-secondary" type="button" onClick={startTest}>
          {finished ? "Run again" : "Begin test"}
        </button>
      )}
    </div>
  );
}