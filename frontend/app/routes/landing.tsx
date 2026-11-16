import { Link } from "react-router";
import type { Route } from "./+types/landing";
import "../demo/demo.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Baymax | Mission health" },
    { name: "description", content: "Health support for crews far from Earth: daily check-ins, guided symptom flows, and reports that reach the ground even when the link is slow." },
  ];
}

const TRACE = [
  { time: "08:41:52", route: "CO₂ sensor → Base server", text: "CO₂ 5,400 ppm · 24.5 °C" },
  { time: "08:42:10", route: "Apple Watch → Astronaut app", text: "HR 112 bpm · SpO₂ 97%" },
  { time: "08:42:10", route: "Astronaut app → Base server", text: "Crew vitals synced" },
  { time: "08:42:10", route: "Base server", text: "Correlation flag raised: heart rate and CO₂" },
  { time: "08:44:31", route: "Astronaut app → Base server", text: "Report saved from the symptom guide" },
];

const FEATURES = [
  {
    title: "Daily check-ins",
    text: "Sleep, mood, workload and short cognitive tests are tracked against each astronaut’s own baseline, so slow changes stand out early.",
  },
  {
    title: "Guided symptom flows",
    text: "Yes, no or not sure. Each answer leads to what to do now, or to calling the medical officer. Flows are written as data, so new conditions can be added without new code.",
  },
  {
    title: "Body and environment together",
    text: "Wearable heart rate and cabin CO₂ are read side by side. A headache or a racing heart is not judged in isolation from the air the crew is breathing.",
  },
  {
    title: "Reports that wait for the link",
    text: "When the connection drops, data and reports are kept on the device and sent when it returns. The medical officer or flight surgeon can reply to a report, and the reply reaches the astronaut as soon as the link is back. The crew keeps following the guide in the meantime.",
  },
  {
    title: "Shared health history",
    text: "Sleep, heart, cognition and wellbeing trends are color-coded against reference ranges. The astronaut, the medical officer and the flight surgeon all see the same history.",
  },
  {
    title: "Remedy inventory",
    text: "The medical officer keeps the stock up to date, the flight surgeon can review it from Earth, and the base server shows what is in storage, in which lot, and what has expired.",
  },
];

const SCREENS = [
  { actor: "astronaut", title: "Astronaut app", text: "Daily routine, check-ins, journal, and the symptom guide. Receives live readings from a wearable." },
  { actor: "cmo", title: "Mission medical officer", text: "Crew roster, trends, mission alerts, and reports from crew members, on board." },
  { actor: "surgeon", title: "Flight surgeon", text: "Oversight across missions from Earth: adjust sleep routines and review crew history, trends and reports." },
  { actor: "base", title: "Base station", text: "The Mars base server. Shows what it has received, raises alerts, and collects reports and shows the remedy storage." },
] as const;

const STEPS = [
  "Pick a screen at the top of the demo. Start with the astronaut app.",
  "Send an event from the sensor panel. Try the CO₂ excursion scenario.",
  "Follow it. The event log shows who sent what to whom, and the base station shows what it knows.",
  "Act on it. Open the symptom guide on the astronaut phone, save the report, then find it on the medical officer and base screens.",
  "Turn the base network off and send more readings or a check-in to see them queue, then switch it back on.",
];

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-bar">
        <Link className="brand-lockup" to="/" aria-label="Baymax mission health">
          <img className="brand-mark" src="/baymax-logo.png" alt="" aria-hidden="true" />
          <span><strong>BAYMAX</strong><small>MISSION HEALTH</small></span>
        </Link>
        <nav className="landing-nav" aria-label="Main">
          <a href="#how">How it works</a>
          <a href="#screens">Screens</a>
          <Link to="/demo" className="landing-button landing-button-primary">Open the demo</Link>
        </nav>
      </header>

      <main>
        <section className="landing-section landing-hero-section">
          <div className="landing-inner landing-hero">
            <div>
              <span className="eyebrow">CREW HEALTH / MARS</span>
              <h1>Health support that keeps working when Earth is far away<span>.</span></h1>
              <p className="landing-lead">
                Baymax helps astronauts check on their own health, work through symptoms step by step,
                and tell the medical officer and flight surgeons what happened, even when the link home
                is slow or down.
              </p>
              <p className="landing-scenario">
                The demo follows the fictional Artemis X crew on Mars in 2034: mission day 340, day 47 on the
                surface, living in a base and working from a rover.
              </p>
              <div className="landing-actions">
                <Link to="/demo" className="landing-button landing-button-primary">Open the demo</Link>
                <Link to="/demo?actor=base" className="landing-button">See the base station</Link>
              </div>
            </div>
            <aside aria-label="Example event trace">
              <span className="eyebrow">EXAMPLE FROM THE SIMULATION</span>
              <ol className="trace">
                {TRACE.map((row, i) => (
                  <li className="trace-row" key={i}>
                    <time>{row.time}</time>
                    <span className="trace-route">{row.route}</span>
                    <span className="trace-text">{row.text}</span>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-inner landing-heading">
            <h2>Far from Earth, the first responder is the crew.</h2>
            <p>
              On a long mission the crew cannot count on an instant answer from Earth. From Mars a message
              takes minutes to arrive and the reply takes just as long, links drop, and the medicine cabinet
              is small. The first person to look at a problem is usually the person who has it. Baymax is
              built for that moment, and for the hours after, while Earth catches up.
            </p>
          </div>
        </section>

        <section className="landing-section" id="how">
          <div className="landing-inner">
            <div className="landing-heading">
              <h2>What the demo shows</h2>
              <p>Six ideas, working together in one simulated mission.</p>
            </div>
            <div className="landing-rows">
              {FEATURES.map((f) => (
                <div className="landing-row" key={f.title}>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section" id="screens">
          <div className="landing-inner">
            <div className="landing-heading">
              <h2>Four screens, one mission</h2>
              <p>Everyone in the loop has a screen. Open any of them in the demo.</p>
            </div>
            <div className="landing-rows">
              {SCREENS.map((s) => (
                <div className="landing-row landing-row-link" key={s.actor}>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <Link to={`/demo?actor=${s.actor}`} className="text-action">Open in the demo</Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-inner">
            <div className="landing-heading">
              <h2>Try it in five steps</h2>
              <p>You control the clock, the sensors and the network.</p>
            </div>
            <ol className="landing-steps">
              {STEPS.map((s) => <li key={s}>{s}</li>)}
            </ol>
            <div className="landing-actions landing-actions-end">
              <Link to="/demo" className="landing-button landing-button-primary">Open the demo</Link>
              <Link to="/demo?actor=astronaut" className="landing-button">Start as the astronaut</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-inner">
          <p>
            A prototype made for the NASA Space Apps Challenge. All crew, readings and alerts are fictional.
            The symptom flows have not been reviewed by a clinician and are not medical advice.
          </p>
          <p>
            Background reading:{" "}
            <a href="https://www.nasa.gov/hrp/risks/" target="_blank" rel="noreferrer">NASA Human Research Program risks</a>
            {" · "}
            <a href="https://www.nasa.gov/integrated-medical-model-documentation/" target="_blank" rel="noreferrer">Integrated Medical Model documentation</a>
          </p>
        </div>
      </footer>
    </div>
  );
}