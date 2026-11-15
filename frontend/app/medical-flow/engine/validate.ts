import type { Answer, FlowGraph, FlowNode } from "../types";

export interface ValidationIssue {
  graphId: string;
  nodeId?: string;
  severity: "error" | "warning";
  message: string;
}

interface Edge {
  to: string;
  loop: boolean;
}

function edgesOf(node: FlowNode): Edge[] {
  switch (node.type) {
    case "question":
      return (["yes", "no", "unsure"] as Answer[]).map((a) => ({
        to: node[a],
        loop: node.loopEdges?.includes(a) ?? false,
      }));
    case "action":
      return [{ to: node.next, loop: false }];
    case "disposition":
      return [];
  }
}

/** Checks one graph for authoring mistakes. Run it in CI or in a dev-only check. */
export function validateGraph(graph: FlowGraph): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const err = (message: string, nodeId?: string) =>
    issues.push({ graphId: graph.id, nodeId, severity: "error", message });
  const warn = (message: string, nodeId?: string) =>
    issues.push({ graphId: graph.id, nodeId, severity: "warning", message });

  const ids = Object.keys(graph.nodes);

  if (!graph.nodes[graph.entry]) {
    err(`Entry node "${graph.entry}" does not exist`);
    return issues;
  }

  for (const id of ids) {
    const node = graph.nodes[id];
    if (node.id !== id) err(`Node key "${id}" does not match its id "${node.id}"`, id);

    if (node.type === "question" && !node.text.trim()) err("Question has no text", id);
    if (node.type === "disposition" && node.instructions.length === 0)
      err("Disposition has no instructions", id);
    if (node.type === "action" && node.instructions.length === 0)
      err("Action has no instructions", id);

    for (const e of edgesOf(node)) {
      if (!graph.nodes[e.to]) err(`Points to missing node "${e.to}"`, id);
    }
  }

  // Reachability from entry.
  const reachable = new Set<string>();
  const stack = [graph.entry];
  while (stack.length) {
    const id = stack.pop()!;
    if (reachable.has(id) || !graph.nodes[id]) continue;
    reachable.add(id);
    edgesOf(graph.nodes[id]).forEach((e) => stack.push(e.to));
  }
  for (const id of ids) if (!reachable.has(id)) warn("Node is unreachable from the entry", id);

  // Every node must be able to reach a disposition (no dead ends).
  const canFinish = new Set<string>(ids.filter((id) => graph.nodes[id].type === "disposition"));
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of ids) {
      if (canFinish.has(id)) continue;
      if (edgesOf(graph.nodes[id]).some((e) => canFinish.has(e.to))) {
        canFinish.add(id);
        changed = true;
      }
    }
  }
  for (const id of ids) if (!canFinish.has(id)) err("No path from this node reaches an outcome", id);

  // Accidental cycles: ignore edges explicitly marked as loops.
  const color = new Map<string, 0 | 1 | 2>();
  const visit = (id: string): boolean => {
    color.set(id, 1);
    for (const e of edgesOf(graph.nodes[id])) {
      if (e.loop || !graph.nodes[e.to]) continue;
      const c = color.get(e.to) ?? 0;
      if (c === 1) {
        err(`Unmarked cycle back to "${e.to}". Add the answer to loopEdges if intentional`, id);
        return true;
      }
      if (c === 0 && visit(e.to)) return true;
    }
    color.set(id, 2);
    return false;
  };
  for (const id of ids) if ((color.get(id) ?? 0) === 0) visit(id);

  return issues;
}

export function validateAll(graphs: FlowGraph[]): ValidationIssue[] {
  const issues = graphs.flatMap(validateGraph);
  const seen = new Set<string>();
  for (const g of graphs) {
    if (seen.has(g.id))
      issues.push({ graphId: g.id, severity: "error", message: "Duplicate graph id" });
    seen.add(g.id);
  }
  return issues;
}
