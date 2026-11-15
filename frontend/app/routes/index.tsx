import { redirect } from "react-router";

export function loader() {
  return redirect("/astronaut");
}

export default function Index() {
  return null;
}
