import { useOutletContext } from "react-router";
import { AstronautPage } from "../pages/astronaut-page";
import type { DemoPageProps } from "../demo-types";

export default function AstronautRoute() {
  const context = useOutletContext<DemoPageProps>();
  return <AstronautPage {...context} />;
}