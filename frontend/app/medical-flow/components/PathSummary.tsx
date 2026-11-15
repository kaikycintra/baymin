import { ANSWER_LABEL } from "../levels";
import type { PathEntry } from "../types";

export function PathSummary({ path }: { path: PathEntry[] }) {
  if (path.length === 0) return null;
  return (
    <details className="mf-path">
      <summary>Your answers so far ({path.length})</summary>
      <ul>
        {path.map((p, i) => (
          <li key={i}>
            <span>{p.label}</span>
            <strong>{p.kind === "question" && p.answer ? ANSWER_LABEL[p.answer] : "Done"}</strong>
          </li>
        ))}
      </ul>
    </details>
  );
}
