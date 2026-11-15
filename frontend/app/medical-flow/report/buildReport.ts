import { ANSWER_LABEL, LEVELS } from "../levels";
import type { DispositionLevel, DispositionNode, FlowGraph, Instruction, PathEntry } from "../types";

export interface FlightSurgeonReport {
  id: string;
  createdAt: string; // ISO timestamp
  flow: { id: string; title: string; version: string; review: FlowGraph["review"] };
  outcome: { level: DispositionLevel; levelLabel: string; title: string };
  /** What the crew member answered, in order. */
  answers: { question: string; answer: string }[];
  /** Steps the crew member confirmed doing (e.g. rest and re-measure). */
  stepsCompleted: string[];
  /** What the flow recommended at the end. */
  recommended: Instruction[];
  notifyRecommended: boolean;
  crewNote?: string;
}

export function shouldNotify(d: DispositionNode): boolean {
  return d.notifyFlightSurgeon ?? LEVELS[d.level].notifyByDefault;
}

export function buildReport(
  graph: FlowGraph,
  path: PathEntry[],
  disposition: DispositionNode,
  crewNote?: string
): FlightSurgeonReport {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    flow: { id: graph.id, title: graph.title, version: graph.version, review: graph.review },
    outcome: {
      level: disposition.level,
      levelLabel: LEVELS[disposition.level].label,
      title: disposition.title,
    },
    answers: path
      .filter((p) => p.kind === "question" && p.answer)
      .map((p) => ({ question: p.label, answer: ANSWER_LABEL[p.answer!] })),
    stepsCompleted: path.filter((p) => p.kind === "action").map((p) => p.label),
    recommended: disposition.instructions,
    notifyRecommended: shouldNotify(disposition),
    crewNote: crewNote?.trim() || undefined,
  };
}

/** Plain-text version, suitable for low-bandwidth links or copy/paste. */
export function reportToText(r: FlightSurgeonReport): string {
  const lines: string[] = [
    `MEDICAL REPORT ${r.id}`,
    `Time: ${r.createdAt}`,
    `Flow: ${r.flow.title} (v${r.flow.version}, ${
      r.flow.review === "draft" ? "draft, not clinician reviewed" : "clinician reviewed"
    })`,
    `Outcome: ${r.outcome.levelLabel} - ${r.outcome.title}`,
    "",
    "Answers:",
    ...r.answers.map((a) => `- ${a.question} ${a.answer}`),
  ];
  if (r.stepsCompleted.length) lines.push("", "Steps completed:", ...r.stepsCompleted.map((s) => `- ${s}`));
  lines.push("", "Recommended by flow:", ...r.recommended.map((i) => `- [${i.kind}] ${i.text}${i.warning ? ` (${i.warning})` : ""}`));
  if (r.crewNote) lines.push("", `Crew note: ${r.crewNote}`);
  return lines.join("\n");
}
