import { LEVELS } from "../levels";
import type { DispositionNode, FlowGraph, PathEntry } from "../types";
import type { FlightSurgeonReport } from "../report/buildReport";
import { InstructionList } from "./InstructionList";
import { ReportPanel } from "./ReportPanel";

interface Props {
  graph: FlowGraph;
  node: DispositionNode;
  path: PathEntry[];
  onRestart: () => void;
  onExit: () => void;
  onReportQueued?: (report: FlightSurgeonReport) => void;
}

export function DispositionCard({ graph, node, path, onRestart, onExit, onReportQueued }: Props) {
  const level = LEVELS[node.level];
  return (
    <section className={`mf-card mf-outcome mf-level-${node.level}`} aria-labelledby="mf-outcome-title">
      <div className="mf-outcome-banner" role={node.level === "emergency" || node.level === "urgent" ? "alert" : "status"}>
        <span className="mf-outcome-level">{level.label}</span>
        <h2 id="mf-outcome-title" className="mf-outcome-title">{node.title}</h2>
        {node.summary && <p>{node.summary}</p>}
      </div>

      <InstructionList items={node.instructions} />

      <ReportPanel graph={graph} path={path} disposition={node} onQueued={onReportQueued} />

      <div className="mf-outcome-actions">
        <button type="button" className="mf-btn mf-btn-secondary" onClick={onRestart}>Start this guide again</button>
        <button type="button" className="mf-btn mf-btn-quiet" onClick={onExit}>Choose another symptom</button>
      </div>
    </section>
  );
}
