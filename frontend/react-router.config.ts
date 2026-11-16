import type { Config } from "@react-router/dev/config";

// "/" for local development. On GitHub Pages the site lives at /<repo-name>/, set by the workflow.
export default {
  ssr: false, // static single-page app: no server needed
  basename: process.env.BASE_PATH ?? "/",
} satisfies Config;