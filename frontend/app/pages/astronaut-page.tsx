import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { DemoPageProps } from "../demo-types";

type Task = {
  id: string;
  time: string;
  title: string;
  detail: string;
  state: "done" | "now" | "next";
};

type JournalEntry = {
  id: string;
  createdAt: string;
  kind: "text" | "voice";
  text?: string;
  audioDataUrl?: string;
  durationSeconds?: number;
};

const initialTasks: Task[] = [
  { id: "hydration", time: "07:30", title: "Hydration & vitals", detail: "Morning check · 4 min", state: "done" },
  { id: "checkin", time: "09:00", title: "Circadian & mood check-in", detail: "Sleep quality and mood · 2 min", state: "now" },
  { id: "cognitive-challenge", time: "09:15", title: "Daily cognitive challenge", detail: "Pattern recognition · 1 min", state: "next" },
  { id: "exercise", time: "11:30", title: "Resistance exercise", detail: "Lower-body protocol · 35 min", state: "next" },
  { id: "daily-journal", time: "20:00", title: "Daily journal entry", detail: "Reflect on the day · 5 min", state: "next" },
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

export function AstronautPage({ anomalyActive, location, now, missionDay, heartRate, spo2 }: DemoPageProps) {
  // Live values from the simulator. They fall back to the old demo numbers when used standalone.
  const liveHeartRate = heartRate ?? (anomalyActive ? 112 : 68);
  const liveSpo2 = spo2 ?? 98;
  const clock = now ?? new Date(Date.UTC(2027, 2, 18, 8, 42));
  const clockText = `${String(clock.getUTCHours()).padStart(2, "0")}:${String(clock.getUTCMinutes()).padStart(2, "0")}`;
  const dayPart = clock.getUTCHours() < 12 ? "morning" : clock.getUTCHours() < 18 ? "afternoon" : "evening";
  const [section, setSection] = useState<"routine" | "checks" | "journal" | "history">("routine");
  const [completedTasks, setCompletedTasks] = useState<string[]>(["hydration"]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  useEffect(() => {
    const storedEntries = readJournalEntries();
    setJournalEntries(storedEntries);
    if (storedEntries.length > 0) {
      setCompletedTasks((current) => current.includes("daily-journal") ? current : [...current, "daily-journal"]);
    }
  }, []);

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
          <h1>Good {dayPart}, Maya<span>.</span></h1>
          <p>Health routine and personal trend history for Artemis III.</p>
        </div>
        <div className="heading-readout">
          <span className="eyebrow">MISSION DAY</span>
          <strong>{String(missionDay ?? 18).padStart(3, "0")}</strong>
          <span>LOCAL TIME · {clockText}</span>
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
                id="health-tab-routine"
                aria-controls="health-panel-routine"
                aria-selected={section === "routine"}
                className={section === "routine" ? "selected" : ""}
                onClick={() => setSection("routine")}
              >
                Routine
              </button>
              <button
                type="button"
                role="tab"
                id="health-tab-checks"
                aria-controls="health-panel-checks"
                aria-selected={section === "checks"}
                className={section === "checks" ? "selected" : ""}
                onClick={() => setSection("checks")}
              >
                Daily checks
              </button>
              <button
                type="button"
                role="tab"
                id="health-tab-journal"
                aria-controls="health-panel-journal"
                aria-selected={section === "journal"}
                className={section === "journal" ? "selected" : ""}
                onClick={() => setSection("journal")}
              >
                Journal
              </button>
              <button
                type="button"
                role="tab"
                id="health-tab-history"
                aria-controls="health-panel-history"
                aria-selected={section === "history"}
                className={section === "history" ? "selected" : ""}
                onClick={() => setSection("history")}
              >
                History
              </button>
            </div>
          </div>

          <div
            className="health-tab-panel"
            id="health-panel-journal"
            role="tabpanel"
            aria-labelledby="health-tab-journal"
            hidden={section !== "journal"}
          >
            <DailyJournalPanel
              onJournalEntriesChanged={(entries) => {
                setJournalEntries(entries);
                setCompletedTasks((current) => {
                  if (entries.length > 0) {
                    return current.includes("daily-journal") ? current : [...current, "daily-journal"];
                  }
                  return current.filter((taskId) => taskId !== "daily-journal");
                });
              }}
            />
          </div>

          <div
            className="health-tab-panel"
            id="health-panel-routine"
            role="tabpanel"
            aria-labelledby="health-tab-routine"
            hidden={section !== "routine"}
          >
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
                      disabled={task.id === "cognitive-challenge"}
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
          </div>

          <div
            className="health-tab-panel"
            id="health-panel-checks"
            role="tabpanel"
            aria-labelledby="health-tab-checks"
            hidden={section !== "checks"}
          >
            <DailyChecksPanel
              challengeCompleted={completedTasks.includes("cognitive-challenge")}
              onCheckinSaved={() => setCompletedTasks((current) =>
                current.includes("checkin") ? current : [...current, "checkin"],
              )}
              onChallengeComplete={() => setCompletedTasks((current) =>
                current.includes("cognitive-challenge")
                  ? current
                  : [...current, "cognitive-challenge"],
              )}
            />
          </div>

          <div
            className="health-tab-panel"
            id="health-panel-history"
            role="tabpanel"
            aria-labelledby="health-tab-history"
            hidden={section !== "history"}
          >
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
                <div className="history-row"><span>Resting heart rate</span><strong>{liveHeartRate} bpm{anomalyActive ? "*" : ""}</strong><span className="trend-neutral">Baseline</span></div>
                <div className="history-row"><span>Blood pressure</span><strong>118 / 76</strong><span className="trend-positive">Within range</span></div>
                <div className="history-row"><span>Sleep duration</span><strong>7 h 36 m</strong><span className="trend-neutral">+ 18 min</span></div>
                {anomalyActive && <p className="footnote">* Simulated reading during the active environmental event.</p>}
              </div>
              <JournalHistory entries={journalEntries} />
            </div>
          </div>
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
              <div><span>HEART RATE</span><strong>{liveHeartRate}<small> bpm</small></strong></div>
              <div><span>O₂ SATURATION</span><strong>{liveSpo2}<small>%</small></strong></div>
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

function DailyChecksPanel({
  challengeCompleted,
  onCheckinSaved,
  onChallengeComplete,
}: {
  challengeCompleted: boolean;
  onCheckinSaved: () => void;
  onChallengeComplete: () => void;
}) {
  const [sleepQuality, setSleepQuality] = useState(7);
  const [stress, setStress] = useState(2);
  const [energy, setEnergy] = useState(3);
  const [mood, setMood] = useState("Steady");
  const [lightExposure, setLightExposure] = useState("Typical");
  const [workload, setWorkload] = useState("Typical");
  const [saved, setSaved] = useState(false);

  function saveCheckin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
    onCheckinSaved();
  }

  return (
    <div className="daily-checks">
      <form className="checkin-panel" onSubmit={saveCheckin}>
        <div className="checkin-title">
          <div>
            <span className="eyebrow">DAILY SELF-REPORT</span>
            <h3>Circadian, mood & context</h3>
          </div>
          <span className="duration-tag">~2 MIN</span>
        </div>

        <div className="wellbeing-scales">
          <label className="range-label" htmlFor="sleep-quality">
            <span>Sleep quality</span><strong>{sleepQuality}<small> / 10</small></strong>
          </label>
          <input id="sleep-quality" type="range" min="1" max="10" value={sleepQuality} onChange={(event) => { setSleepQuality(Number(event.target.value)); setSaved(false); }} />
          <label className="range-label" htmlFor="stress-level">
            <span>Perceived stress</span><strong>{stress}<small> / 5</small></strong>
          </label>
          <input id="stress-level" type="range" min="1" max="5" value={stress} onChange={(event) => { setStress(Number(event.target.value)); setSaved(false); }} />
          <label className="range-label" htmlFor="energy-level">
            <span>Energy</span><strong>{energy}<small> / 5</small></strong>
          </label>
          <input id="energy-level" type="range" min="1" max="5" value={energy} onChange={(event) => { setEnergy(Number(event.target.value)); setSaved(false); }} />
        </div>

        <fieldset className="mood-fieldset">
          <legend>Current mood</legend>
          <div className="mood-row">
            {(["Low", "Steady", "Good"] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={mood === option ? "mood-option selected" : "mood-option"}
                aria-pressed={mood === option}
                onClick={() => { setMood(option); setSaved(false); }}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="daily-context-fields">
          <label className="field-label">LIGHT EXPOSURE
            <select value={lightExposure} onChange={(event) => { setLightExposure(event.target.value); setSaved(false); }}>
              <option>Low</option><option>Typical</option><option>High</option>
            </select>
          </label>
          <label className="field-label">WORKLOAD
            <select value={workload} onChange={(event) => { setWorkload(event.target.value); setSaved(false); }}>
              <option>Light</option><option>Typical</option><option>Heavy</option>
            </select>
          </label>
        </div>

        <div className="checkin-save-row">
          <p className="self-report-note">Personal context helps track changes over time; it is not a diagnosis.</p>
          <button className="button button-primary" type="submit">{saved ? "Check-in saved" : "Save daily check-in"}</button>
        </div>
      </form>

      <section className="daily-tests" aria-labelledby="daily-tests-title">
        <div className="daily-tests-heading">
          <div><span className="eyebrow">DAILY COGNITIVE BATTERY</span><h3 id="daily-tests-title">Memory, attention & reaction</h3></div>
          <span className="duration-tag">~3 MIN</span>
        </div>
        <p className="self-report-note">Repeat under similar conditions and compare with your own baseline. These brief demos are not diagnostic tests.</p>
        <DailyCognitiveChallenge completed={challengeCompleted} onComplete={onChallengeComplete} />
        <MemoryRecallTest />
        <AttentionScanTest />
        <section className="daily-challenge reaction-test">
          <div className="challenge-heading">
            <div><span className="eyebrow">VIGILANCE</span><h3>Reaction time</h3></div>
            <span className="duration-tag">30 SEC</span>
          </div>
          <ReactionCheck />
        </section>
      </section>
    </div>
  );
}

const JOURNAL_STORAGE_KEY = "baymax.astronaut-journal.v1";
const MAX_JOURNAL_STORAGE_LENGTH = 2_400_000;
const MAX_RECORDING_SECONDS = 90;

function isJournalEntry(value: unknown): value is JournalEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<JournalEntry>;
  if (typeof entry.id !== "string" || typeof entry.createdAt !== "string") return false;
  if (entry.kind === "text") return typeof entry.text === "string";
  return entry.kind === "voice" && typeof entry.audioDataUrl === "string";
}

function readJournalEntries(): JournalEntry[] {
  try {
    const stored = window.localStorage.getItem(JOURNAL_STORAGE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.filter(isJournalEntry) : [];
  } catch {
    return [];
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string"
      ? resolve(reader.result)
      : reject(new Error("Could not read the voice recording."));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the voice recording."));
    reader.readAsDataURL(blob);
  });
}

function DailyJournalPanel({ onJournalEntriesChanged }: { onJournalEntriesChanged: (entries: JournalEntry[]) => void }) {
  const [draft, setDraft] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [error, setError] = useState("");
  const entriesRef = useRef<JournalEntry[]>([]);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef(0);
  const recordingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const storedEntries = readJournalEntries();
    entriesRef.current = storedEntries;
    setEntries(storedEntries);
    setStorageReady(true);

    return () => {
      if (recordingTimerRef.current !== null) window.clearInterval(recordingTimerRef.current);
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.onstop = null;
        recorder.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function storeEntry(newEntry: JournalEntry): boolean {
    const nextEntries = [newEntry, ...entriesRef.current];
    const serialized = JSON.stringify(nextEntries);
    if (serialized.length > MAX_JOURNAL_STORAGE_LENGTH) {
      setError("Local journal storage is nearly full. Delete an older entry before saving this one.");
      return false;
    }

    try {
      window.localStorage.setItem(JOURNAL_STORAGE_KEY, serialized);
    } catch {
      setError("Could not save to this browser's local storage. Remove older recordings or check available storage.");
      return false;
    }

    entriesRef.current = nextEntries;
    setEntries(nextEntries);
    setError("");
    onJournalEntriesChanged(nextEntries);
    return true;
  }

  function deleteEntry(id: string) {
    const nextEntries = entriesRef.current.filter((item) => item.id !== id);
    try {
      window.localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(nextEntries));
      entriesRef.current = nextEntries;
      setEntries(nextEntries);
      setError("");
      onJournalEntriesChanged(nextEntries);
    } catch {
      setError("Could not update this browser's local journal storage.");
    }
  }

  function saveTextEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const saved = storeEntry({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      kind: "text",
      text,
    });
    if (saved) setDraft("");
  }

  function stopRecording() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state === "recording") recorder.stop();
  }

  async function startRecording() {
    setError("");
    if (!storageReady) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Voice recording is not supported by this browser. You can write an entry instead.");
      return;
    }

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioPlayer = document.createElement("audio");
      const mimeType = ["audio/mp4", "audio/webm", "audio/webm;codecs=opus"]
        .find((type) => MediaRecorder.isTypeSupported(type) && audioPlayer.canPlayType(type) !== "");
      if (!mimeType) {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setError("This browser cannot record an audio format it can replay. You can write an entry instead.");
        return;
      }

      const options: MediaRecorderOptions = { audioBitsPerSecond: 24000, mimeType };

      const recorder = new MediaRecorder(stream, options);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recordingStartedAtRef.current = Date.now();
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onerror = () => setError("Recording stopped unexpectedly. Try again or write an entry.");
      recorder.onstop = () => {
        const durationSeconds = Math.min(
          MAX_RECORDING_SECONDS,
          Math.max(1, Math.round((Date.now() - recordingStartedAtRef.current) / 1000)),
        );
        const recordingType = recorder.mimeType || chunksRef.current[0]?.type || "audio/webm";
        const recording = new Blob(chunksRef.current, { type: recordingType });
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (recordingTimerRef.current !== null) window.clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
        setIsRecording(false);
        setRecordingSeconds(0);

        if (recording.size === 0) {
          setError("No audio was captured. Check microphone permission and try again.");
          return;
        }

        void blobToDataUrl(recording)
          .then((audioDataUrl) => storeEntry({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            createdAt: new Date().toISOString(),
            kind: "voice",
            audioDataUrl,
            durationSeconds,
          }))
          .catch(() => setError("Could not prepare the recording for local storage."));
      };

      recorder.start(1000);
      setIsRecording(true);
      recordingTimerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartedAtRef.current) / 1000);
        setRecordingSeconds(Math.min(elapsed, MAX_RECORDING_SECONDS));
        if (elapsed >= MAX_RECORDING_SECONDS) stopRecording();
      }, 500);
    } catch (recordingError) {
      stream?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      const denied = recordingError instanceof DOMException && recordingError.name === "NotAllowedError";
      setError(denied
        ? "Microphone permission was denied. Allow microphone access or write an entry instead."
        : "Could not start recording. Check microphone availability and try again.");
    }
  }

  return (
    <section className="daily-journal" aria-labelledby="journal-title">
      <div className="journal-heading">
        <div>
          <span className="eyebrow">PRIVATE DAILY REFLECTION</span>
          <h3 id="journal-title">How was your day?</h3>
        </div>
        <span className="duration-tag">MISSION DAY 018</span>
      </div>

      <p className="journal-prompt">Reflect on what stood out today: mood, sleep, workload, relationships, symptoms, medication, light exposure, or mission events.</p>

      <form className="journal-form" onSubmit={saveTextEntry}>
        <label className="sr-only" htmlFor="daily-journal-entry">Daily journal entry</label>
        <textarea
          id="daily-journal-entry"
          value={draft}
          maxLength={3000}
          rows={9}
          placeholder="Start your entry..."
          onChange={(event) => setDraft(event.target.value)}
        />
        <div className="journal-actions">
          <div className="journal-left-actions">
            <button
              className={isRecording ? "journal-record-button recording" : "journal-record-button"}
              type="button"
              aria-pressed={isRecording}
              disabled={!storageReady && !isRecording}
              onClick={isRecording ? stopRecording : startRecording}
            >
              <span className="microphone-icon" aria-hidden="true"><i /></span>
              {isRecording ? "Stop and save voice log" : "Record voice log"}
            </button>
            <span className="journal-count">{draft.length} / 3000</span>
          </div>
          <button className="journal-save-button" type="submit" disabled={!draft.trim() || !storageReady}>Save entry</button>
        </div>
        {isRecording && <span className="recording-time" role="timer">Recording · {Math.floor(recordingSeconds / 60)}:{String(recordingSeconds % 60).padStart(2, "0")} · up to {MAX_RECORDING_SECONDS}s</span>}
      </form>

      {error && <p className="journal-error" role="alert">{error}</p>}

      <section className="journal-history" aria-labelledby="journal-history-title">
        <div className="journal-history-heading">
          <div><span className="eyebrow">LOCAL ARCHIVE</span><h4 id="journal-history-title">Journal history</h4></div>
          <span className="journal-count">{entries.length} ENTRIES</span>
        </div>
        {entries.length === 0 ? (
          <p className="journal-history-empty">No saved entries yet.</p>
        ) : (
          <div className="journal-entry-list">
            {entries.map((item) => (
              <article className="saved-journal-entry" key={item.id}>
                <div className="saved-journal-heading">
                  <span className="eyebrow">{item.kind === "voice" ? "VOICE LOG" : "WRITTEN ENTRY"}</span>
                  <time>{new Date(item.createdAt).toLocaleString()}</time>
                </div>
                {item.kind === "voice" && item.audioDataUrl ? (
                  <div className="saved-voice-entry">
                    <span>{item.durationSeconds ?? 0}s recording</span>
                    <audio controls preload="metadata" src={item.audioDataUrl}>Audio playback is not supported by this browser.</audio>
                  </div>
                ) : (
                  <p>{item.text}</p>
                )}
                <button className="journal-delete" type="button" onClick={() => deleteEntry(item.id)}>Delete from this device</button>
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="journal-disclaimer">Journal text and audio are stored in this browser's local storage and are not sent to mission control. Clearing browser data removes them.</p>
    </section>
  );
}

function JournalHistory({ entries }: { entries: JournalEntry[] }) {
  return (
    <section className="journal-history history-journal-archive" aria-labelledby="history-journal-title">
      <div className="journal-history-heading">
        <div>
          <span className="eyebrow">PERSONAL JOURNAL</span>
          <h4 id="history-journal-title">Written & voice entries</h4>
        </div>
        <span className="journal-count">{entries.length} ENTRIES</span>
      </div>
      {entries.length === 0 ? (
        <p className="journal-history-empty">No saved journal entries yet.</p>
      ) : (
        <div className="journal-entry-list">
          {entries.map((item) => (
            <article className="saved-journal-entry" key={item.id}>
              <div className="saved-journal-heading">
                <span className="eyebrow">{item.kind === "voice" ? "VOICE LOG" : "WRITTEN ENTRY"}</span>
                <time>{new Date(item.createdAt).toLocaleString()}</time>
              </div>
              {item.kind === "voice" && item.audioDataUrl ? (
                <div className="saved-voice-entry">
                  <span>{item.durationSeconds ?? 0}s recording</span>
                  <audio controls preload="metadata" src={item.audioDataUrl}>Audio playback is not supported by this browser.</audio>
                </div>
              ) : (
                <p>{item.text}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function MemoryRecallTest() {
  const [phase, setPhase] = useState<"ready" | "showing" | "recall" | "complete">("ready");
  const [sequence, setSequence] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (phase !== "showing") return;
    const timer = window.setTimeout(() => setPhase("recall"), 3500);
    return () => window.clearTimeout(timer);
  }, [phase]);

  function startTest() {
    setSequence(Array.from({ length: 5 }, () => Math.floor(Math.random() * 9) + 1).join(""));
    setAnswer("");
    setFeedback("");
    setPhase("showing");
  }

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (answer === sequence) {
      setFeedback("Sequence matched. Test complete.");
      setPhase("complete");
      return;
    }
    setFeedback("That sequence did not match. Try again.");
    setAnswer("");
  }

  return (
    <section className="daily-challenge memory-test">
      <div className="challenge-heading">
        <div><span className="eyebrow">WORKING MEMORY</span><h3>Remember the sequence</h3></div>
        <span className="duration-tag">~1 MIN</span>
      </div>
      {phase === "ready" && <p className="test-instructions">Memorize the five digits, then enter them in order.</p>}
      {phase === "showing" && <p className="memory-sequence" aria-live="assertive">{sequence.split("").join(" · ")}</p>}
      {phase === "recall" && (
        <form className="memory-answer-form" onSubmit={submitAnswer}>
          <label className="sr-only" htmlFor="memory-answer">Enter the five digits in order</label>
          <input id="memory-answer" type="text" inputMode="numeric" autoComplete="off" maxLength={5} value={answer} placeholder="Enter 5 digits" onChange={(event) => setAnswer(event.target.value.replace(/\D/g, ""))} />
          <button className="button button-secondary" type="submit" disabled={answer.length !== 5}>Check sequence</button>
        </form>
      )}
      {phase === "complete" && <p className="test-feedback" role="status">{feedback}</p>}
      {phase === "ready" || phase === "complete" ? (
        <button className="button button-secondary" type="button" onClick={startTest}>{phase === "complete" ? "Try a new sequence" : "Start memory test"}</button>
      ) : null}
      {feedback && phase !== "complete" && <p className="test-feedback" role="status">{feedback}</p>}
    </section>
  );
}

function AttentionScanTest() {
  const [complete, setComplete] = useState(false);
  const [feedback, setFeedback] = useState("");

  function answerScan(answer: number) {
    if (answer === 5) {
      setComplete(true);
      setFeedback("Correct. Target scan complete.");
      return;
    }
    setFeedback("Not quite. Count the target symbol again.");
  }

  return (
    <section className="daily-challenge attention-test">
      <div className="challenge-heading">
        <div><span className="eyebrow">SELECTIVE ATTENTION</span><h3>Count the target</h3></div>
        <span className="duration-tag">~1 MIN</span>
      </div>
      <p className="test-instructions">How many times does 7 appear in this sequence?</p>
      <p className="attention-sequence" aria-label="7, 2, 7, 4, 1, 7, 9, 7, 5, 2, 7">7 <span>2</span> 7 <span>4</span> <span>1</span> 7 <span>9</span> 7 <span>5</span> <span>2</span> 7</p>
      {complete ? (
        <p className="test-feedback" role="status">{feedback}</p>
      ) : (
        <>
          <div className="challenge-answers" role="group" aria-label="Number of target symbols">
            {[4, 5, 6].map((answer) => <button className="challenge-answer" key={answer} type="button" onClick={() => answerScan(answer)}>{answer}</button>)}
          </div>
          {feedback && <p className="test-feedback" role="status">{feedback}</p>}
        </>
      )}
    </section>
  );
}

function DailyCognitiveChallenge({
  completed,
  onComplete,
}: {
  completed: boolean;
  onComplete: () => void;
}) {
  const [feedback, setFeedback] = useState("");

  function submitAnswer(answer: number) {
    if (answer === 32) {
      setFeedback("Correct. Today's challenge is complete.");
      onComplete();
      return;
    }
    setFeedback("Not quite. Try another answer.");
  }

  return (
    <section className="daily-challenge" aria-labelledby="daily-challenge-title">
      <div className="challenge-heading">
        <div>
          <span className="eyebrow">DAILY COGNITIVE CHALLENGE</span>
          <h3 id="daily-challenge-title">Complete the sequence</h3>
        </div>
        <span className="duration-tag">~1 MIN</span>
      </div>
      <p className="challenge-prompt">2 <span>/</span> 4 <span>/</span> 8 <span>/</span> 16 <span>/</span> ?</p>
      {completed ? (
        <p className="challenge-feedback" role="status">{feedback || "Today's challenge is complete."}</p>
      ) : (
        <>
          <div className="challenge-answers" role="group" aria-label="Choose the next number">
            {[24, 30, 32].map((answer) => (
              <button
                className="challenge-answer"
                key={answer}
                type="button"
                onClick={() => submitAnswer(answer)}
              >
                {answer}
              </button>
            ))}
          </div>
          <p className="challenge-feedback" role="status" aria-live="polite">{feedback || "Choose the next number in the pattern."}</p>
        </>
      )}
    </section>
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
          className={`challenge-answer reaction-target ${targetVisible ? "target-ready" : ""}`}
          type="button"
          disabled={!targetVisible}
          onClick={recordResponse}
          aria-label={targetVisible ? "Target appeared, tap to record reaction" : "Wait for the target"}
        >
          {targetVisible ? "TAP" : "WAIT"}
        </button>
      ) : (
        <button className="challenge-answer reaction-start" type="button" onClick={startTest}>
          {finished ? "Run again" : "Begin test"}
        </button>
      )}
    </div>
  );
}