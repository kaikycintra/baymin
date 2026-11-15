import { useMemo, useState } from "react";
import { searchGraphs } from "../engine/search";
import type { FlowGraph } from "../types";

interface Props {
  graphs: FlowGraph[];
  onSelect: (graphId: string) => void;
}

export function ConditionPicker({ graphs, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchGraphs(graphs, query), [graphs, query]);

  return (
    <section className="mf-picker" aria-labelledby="mf-picker-title">
      <h1 id="mf-picker-title" className="mf-h1">What are you experiencing?</h1>
      <label className="mf-search">
        <span className="mf-visually-hidden">Search symptoms</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search symptoms, e.g. rash or heart rate"
        />
      </label>

      {results.length === 0 ? (
        <p className="mf-empty">
          No matching guide. Try a different word, or call the Crew Medical Officer (CMO).
        </p>
      ) : (
        <ul className="mf-picker-list">
          {results.map((g) => (
            <li key={g.id}>
              <button type="button" className="mf-picker-item" onClick={() => onSelect(g.id)}>
                <span className="mf-picker-title">{g.title}</span>
                <span className="mf-picker-desc">{g.description}</span>
                {g.review === "draft" && <span className="mf-badge">Draft, not clinician reviewed</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
