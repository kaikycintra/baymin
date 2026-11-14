import { useOutletContext } from "react-router";
import { CmoPage } from "../pages/cmo-page";
import type { DemoPageProps } from "../demo-types";

export default function CmoRoute() {
  const context = useOutletContext<DemoPageProps>();
  return <CmoPage {...context} />;
}