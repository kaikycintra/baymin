import { useMemo, useState } from "react";
import { buildReport, reportToText, shouldNotify } from "../report/buildReport";
import type { FlightSurgeonReport } from "../report/buildReport";
import { enqueueReport } from "../report/outbox";
import type { DispositionNode, FlowGraph, PathEntry } from "../types";

interface Props {
  graph: FlowGraph;
  path: PathEntry[];
  disposition: DispositionNode;
  /** Called after the report is saved to the local outbox. Hook your transport here. */
  onQueued?: (report: FlightSurgeonReport) => void;
}

export function ReportPanel({ graph, path, disposition, onQueued }: Props) {
  const [note, setNote] = useState("");
  const [queuedAt, setQueuedAt] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
  const recommended = shouldNotify(disposition);

  const preview = useMemo(() => reportToText(buildReport(graph, path, disposition, note)), [graph, path, disposition, note]);

  const queue = () => {
    const report = buildReport(graph, path, disposition, note);
    enqueueReport(report);
    setQueuedAt(new Date());
    onQueued?.(report);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(preview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <section className="mf-report" aria-labelledby="mf-report-title">
      <h3 id="mf-report-title" className="mf-h3">Report for the flight surgeon</h3>
      <p className="mf-report-lead">
        {recommended
          ? "We recommend sending this report. It is saved on this device and sent as soon as the link is available. A reply may take time, so follow the steps above in the meantime."
          : "Optional. Send it if you want the flight surgeon to have a record of this event."}
      </p>

      <label className="mf-note">
        <span>Add a note (optional)</span>
        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} disabled={queuedAt !== null} />
      </label>

      <details className="mf-preview">
        <summary>Preview report</summary>
        <pre>{preview}</pre>
      </details>

      <div className="mf-report-actions">
        {queuedAt ? (
          <p className="mf-queued" role="status">
            Report saved at {queuedAt.toLocaleTimeString()}. It will be sent when the link is available.
          </p>
        ) : (
          <button type="button" className="mf-btn-primary" onClick={queue}>
            Save report to send
          </button>
        )}
        <button type="button" className="mf-btn mf-btn-quiet" onClick={copy}>
          {copied ? "Copied" : "Copy as text"}
        </button>
      </div>
    </section>
  );
}
