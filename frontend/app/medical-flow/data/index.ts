import type { FlowGraph } from "../types";
import { validateAll } from "../engine/validate";
import { palpitations } from "./palpitations";
import { urinary } from "./urinary";
import { allergic } from "./allergic";

/** Register new conditions here. */
export const allGraphs: FlowGraph[] = [palpitations, urinary, allergic];

/** Throws if any graph has authoring errors. Call it from a test or a dev-only check. */
export function assertValidGraphs(graphs: FlowGraph[] = allGraphs): void {
  const issues = validateAll(graphs);
  const errors = issues.filter((i) => i.severity === "error");
  issues
    .filter((i) => i.severity === "warning")
    .forEach((w) => console.warn(`[medical-flow] ${w.graphId}${w.nodeId ? "/" + w.nodeId : ""}: ${w.message}`));
  if (errors.length) {
    throw new Error(
      "Invalid flow graphs:\n" +
        errors.map((e) => `- ${e.graphId}${e.nodeId ? "/" + e.nodeId : ""}: ${e.message}`).join("\n")
    );
  }
}

export { palpitations, urinary, allergic };
