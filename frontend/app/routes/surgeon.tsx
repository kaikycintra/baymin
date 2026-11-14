import { useOutletContext } from "react-router";
import { SurgeonPage } from "../pages/surgeon-page";
import type { DemoPageProps } from "../demo-types";

export default function SurgeonRoute() {
  const context = useOutletContext<DemoPageProps>();
  return <SurgeonPage {...context} />;
}