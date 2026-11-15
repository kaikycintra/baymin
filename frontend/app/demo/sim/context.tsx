import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";
import { createInitialState, simReducer } from "./state";
import type { SimAction, SimState } from "./types";

interface SimContextValue {
  state: SimState;
  dispatch: Dispatch<SimAction>;
}

const SimContext = createContext<SimContextValue | null>(null);

/** Holds the whole simulated world and runs the mission clock. */
export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(simReducer, undefined, createInitialState);

  useEffect(() => {
    if (!state.running) return;
    const id = window.setInterval(() => dispatch({ type: "clock/tick", ms: 1000 * state.speed }), 1000);
    return () => window.clearInterval(id);
  }, [state.running, state.speed]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <SimContext.Provider value={value}>{children}</SimContext.Provider>;
}

export function useSim(): SimContextValue {
  const ctx = useContext(SimContext);
  if (!ctx) throw new Error("useSim must be used inside <SimulationProvider>");
  return ctx;
}
