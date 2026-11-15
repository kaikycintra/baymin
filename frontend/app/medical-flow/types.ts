/** Answers an astronaut can give to a question. "unsure" is first-class. */
export type Answer = "yes" | "no" | "unsure";

/** How serious the outcome of a flow is. Drives UI colour and flight-surgeon reporting. */
export type DispositionLevel =
  | "self_care"
  | "monitor"
  | "cmo_evaluation"
  | "urgent"
  | "emergency";

export type InstructionKind =
  | "action"
  | "measure"
  | "exam"
  | "lab"
  | "medication"
  | "call"
  | "monitor"
  | "observe";

export interface Instruction {
  kind: InstructionKind;
  text: string;
  /** Shown highlighted under the instruction, e.g. side effects. */
  warning?: string;
}

export interface QuestionNode {
  id: string;
  type: "question";
  text: string;
  /** Optional "how do I check this?" text. */
  help?: string;
  /** Next node for each answer. All three are required so authors must decide the "unsure" path. */
  yes: string;
  no: string;
  unsure: string;
  /**
   * Answers whose edge intentionally goes back to an earlier node
   * (e.g. "re-measure heart rate; if still high, restart the flow").
   * The validator ignores these edges when checking for accidental cycles.
   */
  loopEdges?: Answer[];
}

/** A step the astronaut performs and confirms, optionally with a timer. */
export interface ActionNode {
  id: string;
  type: "action";
  title: string;
  instructions: Instruction[];
  timerMinutes?: number;
  continueLabel?: string;
  next: string;
}

/** Terminal node: what to do now and how serious it is. */
export interface DispositionNode {
  id: string;
  type: "disposition";
  level: DispositionLevel;
  title: string;
  summary?: string;
  instructions: Instruction[];
  /** Overrides the default for this level (see LEVELS). */
  notifyFlightSurgeon?: boolean;
}

export type FlowNode = QuestionNode | ActionNode | DispositionNode;

export interface FlowSource {
  label: string;
  url?: string;
}

export interface FlowGraph {
  id: string;
  /** Short symptom name shown in the picker. */
  title: string;
  description: string;
  /** Used by search (and later by an AI router) to match free text to this flow. */
  keywords: string[];
  version: string;
  review: "draft" | "clinician_reviewed";
  entry: string;
  nodes: Record<string, FlowNode>;
  sources: FlowSource[];
}

export interface PathEntry {
  nodeId: string;
  kind: "question" | "action";
  /** Question text or action title, stored so the log survives later content edits. */
  label: string;
  answer?: Answer;
}

export interface FlowState {
  graphId: string | null;
  nodeId: string | null;
  path: PathEntry[];
}
