import type { ReceivedReport } from "../sim/types";
import { MISSION } from "../sim/constants";
import { formatClock } from "../sim/format";
import { reportToText } from "../../medical-flow/report/buildReport";

/** Reports that crew members saved from the symptom guide and that reached the base server. */
export function ReportInbox({ reports, emptyText }: { reports: ReceivedReport[]; emptyText?: string }) {
  if (reports.length === 0) {
    return (
      <p className="inbox-empty">
        {emptyText ?? "No crew reports yet. Reports saved from the Symptom guide on the astronaut phone arrive here."}
      </p>
    );
  }
  return (
    <div className="inbox">
      {reports.map(({ report, receivedAt }) => {
        const tone =
          report.outcome.level === "emergency" || report.outcome.level === "urgent"
            ? "mission-alert-red"
            : report.outcome.level === "cmo_evaluation"
              ? "mission-alert-amber"
              : "";
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
          </article>
        );
      })}
    </div>
  );
}
