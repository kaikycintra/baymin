import type { FlowGraph } from "../types";

/** Simple keyword search. Swap for an AI router later; keep the same signature. */
export function searchGraphs(graphs: FlowGraph[], query: string): FlowGraph[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return graphs;
  return graphs
    .map((g) => {
      const haystack = [g.title, g.description, ...g.keywords].join(" ").toLowerCase();
      const score = terms.reduce((s, t) => s + (haystack.includes(t) ? 1 : 0), 0);
      return { g, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.g);
}
