import { useEffect, useState } from "react";
import type { ActionNode } from "../types";
import { InstructionList } from "./InstructionList";

interface Props {
  node: ActionNode;
  onContinue: () => void;
}

function format(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function ActionCard({ node, onContinue }: Props) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (remaining === null || remaining <= 0) return;
    const t = setTimeout(() => setRemaining((r) => (r === null ? null : r - 1)), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  const titleId = `mf-a-${node.id}`;
  return (
    <section className="mf-card" aria-labelledby={titleId}>
      <h2 id={titleId} className="mf-question">{node.title}</h2>
      <InstructionList items={node.instructions} />

      {node.timerMinutes && (
        <div className="mf-timer" aria-live="polite">
          {remaining === null ? (
            <button type="button" className="mf-btn mf-btn-secondary" onClick={() => setRemaining(node.timerMinutes! * 60)}>
              Start {node.timerMinutes}-minute timer
            </button>
          ) : remaining > 0 ? (
            <span className="mf-timer-readout">{format(remaining)} remaining</span>
          ) : (
            <span className="mf-timer-readout">Time is up</span>
          )}
        </div>
      )}

      <button type="button" className="mf-btn mf-btn-secondary" onClick={onContinue}>
        {node.continueLabel ?? "Done, continue"}
      </button>
    </section>
  );
}
