import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";
import { clearDemoStorage } from "./storage";
import { createInitialState, simReducer } from "./state";
import type { SimAction, SimState } from "./types";

interface SimContextValue {
  state: SimState;
  dispatch: Dispatch<SimAction>;
  /** Resets the simulation AND clears saved journal entries, voice recordings and saved reports. */
  reset: () => void;
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

  const reset = useCallback(() => {
    clearDemoStorage(); // first, so screens remounting after the reset read empty storage
    dispatch({ type: "reset" });
  }, []);

  const value = useMemo(() => ({ state, dispatch, reset }), [state, reset]);
  return <SimContext.Provider value={value}>{children}</SimContext.Provider>;
}

export function useSim(): SimContextValue {
  const ctx = useContext(SimContext);
  if (!ctx) throw new Error("useSim must be used inside <SimulationProvider>");
  return ctx;
}

/** Like useSim, but returns null outside a provider. Lets shared components fall back to static data. */
export function useSimOptional(): SimContextValue | null {
  return useContext(SimContext);
}