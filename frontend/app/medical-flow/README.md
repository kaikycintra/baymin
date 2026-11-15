# medical-flow

Guided yes / no / not sure medical decision flows. Copy this folder to `app/medical-flow/`.

## Use it

```tsx
import { FlowRunner } from "./medical-flow";

export default function MedicalScreen() {
  return <FlowRunner onReportQueued={(r) => console.log("queued", r.id)} />;
}
```

`FlowRunner` is the full screen. For custom layouts, use `useFlow(graphs)` with the individual
components (`ConditionPicker`, `QuestionCard`, `ActionCard`, `DispositionCard`, `ReportPanel`).

Send queued reports whenever your link is up:

```ts
import { flushOutbox } from "./medical-flow";
await flushOutbox(async (report) => { await fetch("/api/surgeon", { method: "POST", body: JSON.stringify(report) }); });
```

## Folder layout

```
medical-flow/
  types.ts               data model (nodes, graphs, state)
  levels.ts              severity levels and whether each recommends a flight-surgeon report
  data/                  one file per condition + index.ts registry
  engine/                pure logic: flowEngine, validate, search (no React)
  report/                buildReport (structured + text) and outbox (store-and-forward)
  hooks/useFlow.ts       React state around the engine
  components/            UI
  styles/medical-flow.css  scoped under .mf
```

## Add a condition

1. Copy `data/urinary.ts`, change the ids, nodes and text.
2. Add it to the array in `data/index.ts`.
3. Run `assertValidGraphs()` (call it in a test or once in dev). It catches missing targets,
   dead ends, unreachable nodes and unmarked cycles.

Node types: `question` (yes / no / unsure, all three required), `action` (step to confirm, optional timer),
`disposition` (final outcome with a severity level). A loop back to an earlier node must be listed in
`loopEdges`, otherwise the validator reports an accidental cycle.

## Decisions I made that you should review

- **"Not sure" routes** were not in your scenarios. For red-flag questions (chest pain, anaphylaxis signs,
  swelling) "not sure" follows the YES path; for the rest it follows the more cautious path (the one that calls the CMO).
- **Scenario 1 loop:** after the 15-minute rest I added a re-check question. If the heart rate is still high it
  returns to the start (as in your flowchart); if not, it ends in a new "monitor" outcome (`d_resolved`).
- **Severity levels** are my classification: emergency = anaphylaxis; urgent = chest-pain workup and swelling;
  CMO evaluation = unexplained cases; monitor / self-care = treatable at the crew member's level.
- Medication wording is translated as given. Doses and drugs have not been clinically reviewed; graphs are marked `draft`.
- Requires TypeScript and a bundler that handles CSS imports (Vite / CRA / Next). No other dependencies.

## Added for the simulator

- `<FlowRunner initialGraphId="palpitations-tachycardia" />` opens a guide directly (read once, on mount).
- `FlightSurgeonReport` is now exported as a type from the index.
