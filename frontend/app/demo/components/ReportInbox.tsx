import { useState } from "react";
import { groupResponses } from "../sim/reports";
import type { ReceivedReport, ReportResponse } from "../sim/types";
import { MISSION } from "../sim/constants";
import { formatClock } from "../sim/format";
import { reportToText } from "../../medical-flow/report/buildReport";
import "./reports.css";

const QUICK_REPLIES = [
  "Received. I am reviewing your report.",
  "Please keep monitoring and tell us if anything changes.",
  "Please come to the medical area so I can examine you.",
];

interface Props {
  reports: ReceivedReport[];
  /** Replies to show under each report. */
  responses?: ReportResponse[];
  /** Replies that have reached the astronaut's device. Others show as "waiting". */
  deliveredIds?: ReadonlySet<string>;
  /** When given, each report gets a reply form. */
  onRespond?: (reportId: string, text: string) => void;
  emptyText?: string;
}

function ReplyForm({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <form
      className="rp-form"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = text.trim();
        if (!trimmed) return;
        onSend(trimmed);
        setText("");
      }}
    >
      <label className="field-label">
        REPLY TO {MISSION.astronaut.toUpperCase()}
        <textarea value={text} maxLength={500} rows={2} placeholder="Write a reply to this report..." onChange={(event) => setText(event.target.value)} />
      </label>
      <div className="rp-chips" role="group" aria-label="Quick replies">
        {QUICK_REPLIES.map((reply) => (
          <button key={reply} type="button" className="rp-chip" onClick={() => setText(reply)}>{reply}</button>
        ))}
      </div>
      <button className="button button-secondary" type="submit" disabled={!text.trim()}>Send response</button>
    </form>
  );
}

/** Reports that reached the base server, with the replies sent to the astronaut. */
export function ReportInbox({ reports, responses = [], deliveredIds, onRespond, emptyText }: Props) {
  if (reports.length === 0) {
    return (
      <p className="inbox-empty">
        {emptyText ?? "No crew reports yet. Reports saved from the Symptom guide on the astronaut phone arrive here."}
      </p>
    );
  }
  const byReport = groupResponses(responses);
  return (
    <div className="inbox">
      {reports.map(({ report, receivedAt }) => {
        const tone =
          report.outcome.level === "emergency" || report.outcome.level === "urgent"
            ? "mission-alert-red"
            : report.outcome.level === "cmo_evaluation"
              ? "mission-alert-amber"
              : "";
        const thread = byReport.get(report.id) ?? [];
        return (
          <article className={`mission-alert ${tone}`} key={report.id}>
            <div className="alert-meta">
              <span>{report.outcome.levelLabel.toUpperCase()}</span>
              <time>{formatClock(receivedAt)}</time>
            </div>
            <strong>{MISSION.astronaut} · {report.flow.title}</strong>
            <p>{report.outcome.title}</p>
            <details className="inbox-details">
              <summary>View full report</summary>
              <pre>{reportToText(report)}</pre>
            </details>

            {thread.length > 0 && (
              <div className="rp-thread" aria-label="Replies">
                {thread.map((reply) => {
                  const delivered = deliveredIds?.has(reply.id) ?? true;
                  return (
                    <div className="rp-reply" key={reply.id}>
                      <div className="rp-reply-head"><strong>{reply.author}</strong><time>{formatClock(reply.at)}</time></div>
                      <p>{reply.text}</p>
                      <span className={`rp-state ${delivered ? "" : "is-waiting"}`}>
                        {delivered ? "Delivered to the crew device" : "Waiting for the crew device"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            {onRespond && <ReplyForm onSend={(text) => onRespond(report.id, text)} />}
          </article>
        );
      })}
    </div>
  );
}