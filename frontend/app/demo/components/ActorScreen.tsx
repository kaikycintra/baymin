import { memo, useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CheckinValues, DemoPageProps } from "../../demo-types";
import { FlowRunner } from "../../medical-flow";
import { AstronautPage, CmoPage, SurgeonPage } from "../pages";
import { HR_LIMIT, PALPITATIONS_GUIDE_ID } from "../sim/constants";
import { useSim } from "../sim/context";
import { marsDay, missionDay } from "../sim/format";
import { selectMyReports } from "../sim/reports";
import { co2Level } from "../sim/state";
import type { Actor } from "../sim/types";
import { GlobalAlert } from "./GlobalAlert";
import { PhoneFrame } from "./PhoneFrame";
import type { PhoneTab } from "./PhoneFrame";
import { MyReports } from "./MyReports";
import { ReportInbox } from "./ReportInbox";

type PhoneActor = Exclude<Actor, "base">;
/** main: the role's page. extra: symptom guide (astronaut) or crew reports (medical officer, flight surgeon). mine: the astronaut's own reports and replies. */
type TabId = "main" | "extra" | "mine";

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
  const [tab, setTab] = useState<TabId>("main");
  const [guideId, setGuideId] = useState<string | undefined>(undefined);
  const [guideKey, setGuideKey] = useState(0);

  const minute = Math.floor(state.clock / 60_000) * 60_000;
  const now = useMemo(() => new Date(minute), [minute]);
  const anomalyActive = co2Level(state.base.env.co2) === "alarm";
  // Stable, so the memoised pages do not re-render. Saved check-ins go into the shared health history.
  const onCheckin = useCallback((values: CheckinValues) => dispatch({ type: "checkin/submit", values }), [dispatch]);

  const pageProps: DemoPageProps = {
    anomalyActive,
    location: state.location,
    now,
    missionDay: missionDay(state.clock),
    marsDay: marsDay(state.clock),
    heartRate: state.app.heartRate,
    spo2: state.app.spo2,
    co2Ppm: state.base.env.co2,
    onCheckin,
  };

  const reportCount = state.base.reports.length;

  // Replies: what the astronaut has on the device, what is new to them, and what the others can see was delivered.
  const myReports = useMemo(
    () => selectMyReports(state.base.reports, state.outbox, state.app.responses),
    [state.base.reports, state.outbox, state.app.responses]
  );
  const unseenIds = useMemo(() => {
    const seen = new Set(state.app.seenResponseIds);
    return new Set(state.app.responses.filter((r) => !seen.has(r.id)).map((r) => r.id));
  }, [state.app.responses, state.app.seenResponseIds]);
  const deliveredIds = useMemo(() => new Set(state.app.responses.map((r) => r.id)), [state.app.responses]);
  const unseenList = state.app.responses.filter((r) => unseenIds.has(r.id));
  const latestUnseen = unseenList[unseenList.length - 1];

  const tabs: PhoneTab[] =
    actor === "astronaut"
      ? [
          { id: "main", label: "My health" },
          { id: "extra", label: "Symptom guide" },
          { id: "mine", label: "Reports", badge: tab === "mine" ? 0 : unseenIds.size },
        ]
      : [
          { id: "main", label: actor === "cmo" ? "Crew health" : "Oversight" },
          { id: "extra", label: "Reports", badge: reportCount },
        ];

  const showHeartPrompt =
    actor === "astronaut" && state.app.receivedAt !== null && state.app.heartRate > HR_LIMIT && tab === "main";

  const showReplyPrompt = actor === "astronaut" && unseenIds.size > 0 && tab !== "mine";

  /** Leaving the Reports tab marks its replies as read. */
  function changeTab(next: TabId) {
    if (tab === "mine" && next !== "mine" && state.app.responses.length > 0) {
      dispatch({ type: "response/seen", ids: state.app.responses.map((r) => r.id) });
    }
    setTab(next);
  }

  function openGuide() {
    setGuideId(PALPITATIONS_GUIDE_ID);
    setGuideKey((k) => k + 1);
    setTab("extra");
  }

  const statusRight =
    actor === "astronaut" ? (
      <span className={`phone-link phone-link-${state.link}`}>● BASE-NET{state.link === "offline" ? " OFF" : ""}</span>
    ) : actor === "cmo" ? (
      <span className="phone-link phone-link-online">● BASE-NET</span>
    ) : (
      <span className="phone-link phone-link-online">● EARTH LINK</span>
    );

  return (
    <PhoneFrame
      title={TITLES[actor]}
      statusRight={statusRight}
      tabs={tabs}
      activeTab={tab}
      onTabChange={(id) => changeTab(id as TabId)}
    >
      <PhoneViewport>
        {anomalyActive && <GlobalAlert ppm={state.base.env.co2} location={state.location} />}

        {showReplyPrompt && latestUnseen && (
          <section className="phone-prompt" role="status">
            <span className="eyebrow">NEW REPLY</span>
            <strong>{latestUnseen.author} replied to your report.</strong>
            <p>{unseenIds.size > 1 ? `${unseenIds.size} new replies are waiting.` : "Open your reports to read it."}</p>
            <button type="button" className="button button-primary" onClick={() => changeTab("mine")}>
              Read the reply
            </button>
          </section>
        )}

        {/* All screens stay mounted so switching tabs does not lose the page's own state. */}
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
                    <p>Saved by crew members from the symptom guide. Reply to send a response to the astronaut.</p>
                  </div>
                </section>
                <ReportInbox
                  reports={state.base.reports}
                  responses={state.base.responses}
                  deliveredIds={deliveredIds}
                  onRespond={(reportId, text) => dispatch({ type: "response/send", reportId, from: actor === "cmo" ? "cmo" : "surgeon", text })}
                />
              </>
            )}
          </div>
        </div>

        {actor === "astronaut" && (
          <div className="phone-panel" hidden={tab !== "mine"}>
            <div className="page-content">
              <MyReports items={myReports} unseenIds={unseenIds} />
            </div>
          </div>
        )}
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