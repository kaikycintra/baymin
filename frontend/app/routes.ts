import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	route("/", "routes/home.tsx", [
		index("routes/index.tsx"),
		route("astronaut", "routes/astronaut.tsx"),
		route("cmo", "routes/cmo.tsx"),
		route("surgeon", "routes/surgeon.tsx"),
	]),
] satisfies RouteConfig;
