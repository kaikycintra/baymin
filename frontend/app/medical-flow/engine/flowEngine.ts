import type { Answer, FlowGraph, FlowNode, FlowState } from "../types";

export const EMPTY_STATE: FlowState = { graphId: null, nodeId: null, path: [] };

export function getNode(graph: FlowGraph, id: string): FlowNode {
  const node = graph.nodes[id];
  if (!node) throw new Error(`Flow "${graph.id}" has no node "${id}"`);
  return node;
}

export function startFlow(graph: FlowGraph): FlowState {
  return { graphId: graph.id, nodeId: graph.entry, path: [] };
}

/** Pure: returns the next state after answering the current question. */
export function answerQuestion(graph: FlowGraph, state: FlowState, answer: Answer): FlowState {
  if (!state.nodeId) return state;
  const node = getNode(graph, state.nodeId);
  if (node.type !== "question") return state;
  return {
    ...state,
    nodeId: node[answer],
    path: [...state.path, { nodeId: node.id, kind: "question", label: node.text, answer }],
  };
}

/** Pure: confirms the current action step and moves on. */
export function completeAction(graph: FlowGraph, state: FlowState): FlowState {
  if (!state.nodeId) return state;
  const node = getNode(graph, state.nodeId);
  if (node.type !== "action") return state;
  return {
    ...state,
    nodeId: node.next,
    path: [...state.path, { nodeId: node.id, kind: "action", label: node.title }],
  };
}

/** Pure: undo the last step. */
export function goBack(state: FlowState): FlowState {
  if (state.path.length === 0) return state;
  const last = state.path[state.path.length - 1];
  return { ...state, nodeId: last.nodeId, path: state.path.slice(0, -1) };
}
