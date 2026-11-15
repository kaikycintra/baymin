import { allGraphs } from "../data";
import { useFlow } from "../hooks/useFlow";
import type { FlightSurgeonReport } from "../report/buildReport";
import type { FlowGraph } from "../types";
import { ActionCard } from "./ActionCard";
import { ConditionPicker } from "./ConditionPicker";
import { DispositionCard } from "./DispositionCard";
import { PathSummary } from "./PathSummary";
import { QuestionCard } from "./QuestionCard";
import "../styles/medical-flow.css";

interface Props {
  /** Defaults to every graph registered in data/index.ts. */
  graphs?: FlowGraph[];
  /** Fires when the crew member saves a report; use it to trigger your sync. */
  onReportQueued?: (report: FlightSurgeonReport) => void;
}

/** Drop-in screen: condition picker, then the guided questions, then the outcome. */
export function FlowRunner({ graphs = allGraphs, onReportQueued }: Props) {
  const flow = useFlow(graphs);

  if (!flow.graph || !flow.node) {
    return (
      <div className="mf">
        <ConditionPicker graphs={graphs} onSelect={flow.start} />
      </div>
    );
  }

  const { graph, node, path } = flow;

  return (
    <div className="mf">
      <header className="mf-header">
        <button type="button" className="mf-btn mf-btn-quiet" onClick={path.length ? flow.back : flow.exit}>
          {path.length ? "Back" : "All symptoms"}
        </button>
        <span className="mf-header-title">{graph.title}</span>
      </header>

      {node.type === "question" && <QuestionCard key={node.id} node={node} onAnswer={flow.answer} />}
      {node.type === "action" && <ActionCard key={node.id} node={node} onContinue={flow.continueAction} />}
      {node.type === "disposition" && (
        <DispositionCard
          key={node.id}
          graph={graph}
          node={node}
          path={path}
          onRestart={flow.restart}
          onExit={flow.exit}
          onReportQueued={onReportQueued}
        />
      )}

      <PathSummary path={path} />

      {graph.review === "draft" && (
        <p className="mf-disclaimer">
          Prototype guidance, not clinician reviewed. In any doubt, call the Crew Medical Officer (CMO).
        </p>
      )}
    </div>
  );
}
