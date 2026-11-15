import type { Answer, QuestionNode } from "../types";

interface Props {
  node: QuestionNode;
  onAnswer: (answer: Answer) => void;
}

export function QuestionCard({ node, onAnswer }: Props) {
  const titleId = `mf-q-${node.id}`;
  return (
    <section className="mf-card" aria-labelledby={titleId}>
      <h2 id={titleId} className="mf-question">{node.text}</h2>

      {node.help && (
        <details className="mf-help">
          <summary>How do I check this?</summary>
          <p>{node.help}</p>
        </details>
      )}

      <div className="mf-answers" role="group" aria-labelledby={titleId}>
        <button type="button" className="mf-answer" onClick={() => onAnswer("yes")}>Yes</button>
        <button type="button" className="mf-answer" onClick={() => onAnswer("no")}>No</button>
        <button type="button" className="mf-answer mf-answer-unsure" onClick={() => onAnswer("unsure")}>
          Not sure
        </button>
      </div>
    </section>
  );
}
