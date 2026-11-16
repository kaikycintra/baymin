// Save as: app/demo/components/MyReports.tsx (NEW)
import { formatDay, dayOf } from "../history/indicators";
import { formatClock } from "../sim/format";
import type { MyReport } from "../sim/reports";
import { reportToText } from "../../medical-flow/report/buildReport";
import "./reports.css";

interface Props {
  items: MyReport[];
  /** Ids of replies the astronaut has not looked at yet. */
  unseenIds: ReadonlySet<string>;
}

const when = (ms: number) => `${formatDay(dayOf(ms))} · ${formatClock(ms)}`;

/** The astronaut's own reports and the replies to them. */
export function MyReports({ items, unseenIds }: Props) {
  return (
    <>
      <section className="page-heading">
        <div>
          <span className="eyebrow">MY REPORTS</span>
          <h1>Reports<span>.</span></h1>
          <p>Reports you saved from the symptom guide, and replies from your medical team.</p>
        </div>
      </section>

      {items.length === 0 ? (
        <p className="inbox-empty">No reports yet. When you save a report in the Symptom guide, it appears here with any reply.</p>
      ) : (
        <div className="mr-list">
          {items.map(({ id, report, status, at, replies }) => {
            const tone =
              report.outcome.level === "emergency" || report.outcome.level === "urgent"
                ? "mission-alert-red"
                : report.outcome.level === "cmo_evaluation"
                  ? "mission-alert-amber"
                  : "";
            return (
              <article className={`mission-alert ${tone}`} key={id}>
                <div className="alert-meta"><span>{report.outcome.levelLabel.toUpperCase()}</span><time>{when(at)}</time></div>
                <strong>{report.flow.title}</strong>
                <p>{report.outcome.title}</p>
                <span className={`mr-status ${status === "waiting" ? "is-waiting" : ""}`}>
                  {status === "waiting" ? "Waiting for link. Will send when it returns" : "Received by base"}
                </span>

                <div className="rp-thread" aria-label="Replies">
                  {replies.length === 0 ? (
                    <p className="rp-none">No reply yet.</p>
                  ) : (
                    replies.map((reply) => {
                      const fresh = unseenIds.has(reply.id);
                      return (
                        <div className={`rp-reply ${fresh ? "mr-reply-new" : ""}`} key={reply.id}>
                          <div className="rp-reply-head">
                            <strong>{reply.author} {fresh && <span className="mr-new">NEW</span>}</strong>
                            <time>{when(reply.at)}</time>
                          </div>
                          <p>{reply.text}</p>
                        </div>
                      );
                    })
                  )}
                </div>

                <details className="inbox-details">
                  <summary>View my report</summary>
                  <pre>{reportToText(report)}</pre>
                </details>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}