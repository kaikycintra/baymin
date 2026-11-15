import type { Instruction, InstructionKind } from "../types";

const KIND_LABEL: Record<InstructionKind, string> = {
  action: "Do",
  measure: "Measure",
  exam: "Exam",
  lab: "Lab tests",
  medication: "Medication",
  call: "Call",
  monitor: "Monitor",
  observe: "Observe",
};

/** Ordered list: the order of instructions is the order to do them in. */
export function InstructionList({ items }: { items: Instruction[] }) {
  return (
    <ol className="mf-steps">
      {items.map((it, i) => (
        <li key={i} className={`mf-step mf-step-${it.kind}`}>
          <span className="mf-step-kind">{KIND_LABEL[it.kind]}</span>
          <span className="mf-step-text">{it.text}</span>
          {it.warning && <span className="mf-step-warning">{it.warning}</span>}
        </li>
      ))}
    </ol>
  );
}
