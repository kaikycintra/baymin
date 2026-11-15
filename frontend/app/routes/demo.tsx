import { useSearchParams } from "react-router";
import type { Route } from "./+types/demo";
import { ActorScreen } from "../demo/components/ActorScreen";
import { BaseConsole } from "../demo/components/BaseConsole";
import { DemoHeader } from "../demo/components/DemoHeader";
import { SensorPanel } from "../demo/components/SensorPanel";
import { ACTORS } from "../demo/sim/constants";
import { SimulationProvider, useSim } from "../demo/sim/context";
import type { Actor } from "../demo/sim/types";
import "../demo/demo.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Baymax | Simulation" },
    { name: "description", content: "Try the astronaut, medical officer, flight surgeon and base station screens, and send sensor events between them." },
  ];
}

function parseActor(value: string | null): Actor {
  return ACTORS.some((a) => a.id === value) ? (value as Actor) : "astronaut";
}

export default function DemoRoute() {
  return (
    <SimulationProvider>
      <DemoShell />
    </SimulationProvider>
  );
}

function DemoShell() {
  const { state } = useSim();
  const [params, setParams] = useSearchParams();
  const actor = parseActor(params.get("actor"));
  const caption = ACTORS.find((a) => a.id === actor)?.caption;

  function changeActor(next: Actor) {
    setParams(
      (prev) => {
        const copy = new URLSearchParams(prev);
        copy.set("actor", next);
        return copy;
      },
      { replace: true, preventScrollReset: true }
    );
  }

  return (
    <div className="demo-page">
      <DemoHeader actor={actor} onActorChange={changeActor} />
      <div className="demo-grid">
        <section className="demo-stage" aria-label="Simulated screen">
          {actor === "base" ? <BaseConsole /> : <ActorScreen key={`${actor}-${state.resetCount}`} actor={actor} />}
          <p className="demo-stage-caption">{caption}</p>
        </section>
        <SensorPanel />
      </div>
    </div>
  );
}
