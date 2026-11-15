import { useCallback, useMemo, useState } from "react";
import { answerQuestion, completeAction, EMPTY_STATE, getNode, goBack, startFlow } from "../engine/flowEngine";
import type { Answer, FlowGraph, FlowState } from "../types";

/** Holds the state of one running flow. All transitions are delegated to the pure engine. */
export function useFlow(graphs: FlowGraph[]) {
  const [state, setState] = useState<FlowState>(EMPTY_STATE);

  const graph = useMemo(
    () => graphs.find((g) => g.id === state.graphId) ?? null,
    [graphs, state.graphId]
  );
  const node = graph && state.nodeId ? getNode(graph, state.nodeId) : null;

  const start = useCallback(
    (graphId: string) => {
      const g = graphs.find((x) => x.id === graphId);
      if (g) setState(startFlow(g));
    },
    [graphs]
  );

  const answer = useCallback(
    (a: Answer) => graph && setState((s) => answerQuestion(graph, s, a)),
    [graph]
  );

  const continueAction = useCallback(
    () => graph && setState((s) => completeAction(graph, s)),
    [graph]
  );

  const back = useCallback(() => setState((s) => goBack(s)), []);
  const restart = useCallback(() => graph && setState(startFlow(graph)), [graph]);
  const exit = useCallback(() => setState(EMPTY_STATE), []);

  return { graph, node, path: state.path, start, answer, continueAction, back, restart, exit };
}
