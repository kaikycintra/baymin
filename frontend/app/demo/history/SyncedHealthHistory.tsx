// Save as: app/demo/history/SyncedHealthHistory.tsx
import { useMemo } from "react";
import type { SyncInfo } from "./HealthHistory";
import { DEFAULT_CLOCK, MISSION } from "../sim/constants";
import { useSimOptional } from "../sim/context";
import { dayOf } from "./indicators";
import { HealthHistory } from "./HealthHistory";
import { seedHistory } from "./seed";
import { selectHistory } from "./store";

const STALE_AFTER_MIN = 30;

interface Props {
  crewName: string;
  /**
   * "self":   the astronaut's own device. Includes updates still waiting for the link.
   * "server": the base server's copy. This is what the medical officer and flight surgeon see.
   */
  viewer: "self" | "server";
  className?: string;
}

/**
 * The health history for one crew member, kept in sync through the simulation.
 * Use it on the astronaut, medical officer and flight surgeon screens.
 * Outside a <SimulationProvider> it falls back to static seed data.
 */
export function SyncedHealthHistory({ crewName, viewer, className }: Props) {
  const sim = useSimOptional();
  const state = sim?.state;
  const baseHistory = state?.base.history[crewName];
  const outbox = state?.outbox;
  const minute = state ? Math.floor(state.clock / 60_000) * 60_000 : DEFAULT_CLOCK;

  const view = useMemo(() => {
    if (!state) return { history: seedHistory(DEFAULT_CLOCK)[crewName] ?? {}, pending: 0 };
    return selectHistory({ base: baseHistory, outbox: outbox ?? [], crewName, astronaut: MISSION.astronaut, viewer });
    // `state` is intentionally left out: only the base history and the outbox change what this shows.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseHistory, outbox, crewName, viewer, !!state]);

  const syncedAt = state?.base.historySyncedAt ?? DEFAULT_CLOCK;
  const sinceMin = Math.floor((minute - syncedAt) / 60_000);
  // Only the astronaut has a live device, so only they can go quiet.
  const staleMinutes = viewer === "server" && crewName === MISSION.astronaut && sinceMin >= STALE_AFTER_MIN ? sinceMin : null;

  const hasSim = !!state;
  const pending = view.pending;
  // Memoised so the (memoised) HealthHistory does not re-render every clock tick.
  const sync = useMemo<SyncInfo | undefined>(
    () => (hasSim ? { perspective: viewer, pending, syncedAt, staleMinutes } : undefined),
    [hasSim, viewer, pending, syncedAt, staleMinutes]
  );

  return (
    <HealthHistory
      crewName={crewName}
      title={viewer === "self" ? "My history" : crewName}
      history={view.history}
      today={dayOf(minute)}
      className={className}
      sync={sync}
    />
  );
}