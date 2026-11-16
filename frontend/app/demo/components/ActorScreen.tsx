import { memo, useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CheckinValues, DemoPageProps } from "../../demo-types";
import { FlowRunner } from "../../medical-flow";
import { AstronautPage, CmoPage, SurgeonPage } from "../pages";
import { HR_LIMIT, PALPITATIONS_GUIDE_ID } from "../sim/constants";
import { useSim } from "../sim/context";
import { missionDay } from "../sim/format";
import { co2Level } from "../sim/state";
import type { Actor } from "../sim/types";
import { GlobalAlert } from "./GlobalAlert";
import { PhoneFrame } from "./PhoneFrame";
import type { PhoneTab } from "./PhoneFrame";
import { ReportInbox } from "./ReportInbox";

type PhoneActor = Exclude<Actor, "base">;

// Memoised so the pages do not re-render on every clock tick. Their props only change when data changes.
const AstronautMemo = memo(AstronautPage);
const CmoMemo = memo(CmoPage);
const SurgeonMemo = memo(SurgeonPage);

const TITLES: Record<PhoneActor, string> = {
  astronaut: "Astronaut app",
  cmo: "Mission medical officer app",
  surgeon: "Flight surgeon app",
};

/** What is inside the phone for each actor: their page, plus one extra screen. */
export function ActorScreen({ actor }: { actor: PhoneActor }) {
  const { state, dispatch } = useSim();
  const [tab, setTab] = useState<"main" | "extra">("main");
  const [guideId, setGuideId] = useState<string | undefined>(undefined);
  const [guideKey, setGuideKey] = useState(0);

  const minute = Math.floor(state.clock / 60_000) * 60_000;
  const now = useMemo(() => new Date(minute), [minute]);
  const anomalyActive = co2Level(state.base.env.co2) === "alarm";
  const onCheckin = useCallback((values: CheckinValues) => dispatch({ type: "checkin/submit", values }), [dispatch]);

  const pageProps: DemoPageProps = {
    anomalyActive,
    location: state.location,
    now,
    missionDay: missionDay(state.clock),
    heartRate: state.app.heartRate,
    spo2: state.app.spo2,
    co2Ppm: state.base.env.co2,
  };

  const reportCount = state.base.reports.length;
  const tabs: PhoneTab[] =
    actor === "astronaut"
      ? [
          { id: "main", label: "My health" },
          { id: "extra", label: "Symptom guide" },
        ]
      : [
          { id: "main", label: actor === "cmo" ? "Crew health" : "Oversight" },
          { id: "extra", label: "Reports", badge: reportCount },
        ];

  const showHeartPrompt =
    actor === "astronaut" && state.app.receivedAt !== null && state.app.heartRate > HR_LIMIT && tab === "main";

  function openGuide() {
    setGuideId(PALPITATIONS_GUIDE_ID);
    setGuideKey((k) => k + 1);
    setTab("extra");
  }

  const statusRight =
    actor === "astronaut" ? (
      <span className={`phone-link phone-link-${state.link}`}>● HAB-NET{state.link === "offline" ? " OFF" : ""}</span>
    ) : (
      <span className="phone-link phone-link-online">● GROUND</span>
    );

  return (
    <PhoneFrame
      title={TITLES[actor]}
      statusRight={statusRight}
      tabs={tabs}
      activeTab={tab}
      onTabChange={(id) => setTab(id as "main" | "extra")}
    >
      <PhoneViewport>
        {anomalyActive && <GlobalAlert ppm={state.base.env.co2} location={state.location} />}

        {/* Both screens stay mounted so switching tabs does not lose the page's own state. */}
        <div className="phone-panel" hidden={tab !== "main"}>
          {showHeartPrompt && (
            <section className="phone-prompt" role="status">
              <span className="eyebrow">WATCH ALERT</span>
              <strong>Your watch reports {state.app.heartRate} bpm.</strong>
              <p>That is above {HR_LIMIT} bpm. Answer a few questions to see what to do.</p>
              <button type="button" className="button button-primary" onClick={openGuide}>
                Open the palpitations guide
              </button>
            </section>
          )}
          <div className="page-content">
            {actor === "astronaut" && <AstronautMemo {...pageProps} />}
            {actor === "cmo" && <CmoMemo {...pageProps} />}
            {actor === "surgeon" && <SurgeonMemo {...pageProps} />}
          </div>
        </div>

        <div className="phone-panel" hidden={tab !== "extra"}>
          <div className="page-content">
            {actor === "astronaut" ? (
              <FlowRunner
                key={guideKey}
                initialGraphId={guideId}
                onReportQueued={(report) => dispatch({ type: "report/submit", report })}
              />
            ) : (
              <>
                <section className="page-heading">
                  <div>
                    <span className="eyebrow">CREW REPORTS</span>
                    <h1>Reports<span>.</span></h1>
                    <p>Saved by crew members from the symptom guide.</p>
                  </div>
                </section>
                <ReportInbox reports={state.base.reports} />
              </>
            )}
          </div>
        </div>
      </PhoneViewport>
    </PhoneFrame>
  );
}

/** The same wrapper structure the original home route used, so your page CSS applies unchanged. */
function PhoneViewport({ children }: { children: ReactNode }) {
  return (
    <div className="app-frame">
      <main className="workspace">{children}</main>
    </div>
  );
}
