#!/usr/bin/env node
/**
 * Makes your existing AstronautPage use the simulator's live values (heart rate, SpO2, time, mission day)
 * instead of its hardcoded demo numbers.
 *
 *   node scripts/patch-astronaut.mjs app/routes/astronaut.tsx
 *
 * It makes 7 exact text replacements. If any text is not found exactly once, it changes nothing
 * and tells you which one. Running it twice is safe.
 */
import { readFileSync, writeFileSync } from "node:fs";

const file = process.argv[2] ?? "app/routes/astronaut.tsx";
let src = readFileSync(file, "utf8");

if (src.includes("liveHeartRate")) {
  console.log(`${file} is already patched. Nothing to do.`);
  process.exit(0);
}

const edits = [
  [
    "export function AstronautPage({ anomalyActive, location }: DemoPageProps) {",
    `export function AstronautPage({ anomalyActive, location, now, missionDay, heartRate, spo2 }: DemoPageProps) {
  // Live values from the simulator. They fall back to the old demo numbers when used standalone.
  const liveHeartRate = heartRate ?? (anomalyActive ? 112 : 68);
  const liveSpo2 = spo2 ?? 98;
  const clock = now ?? new Date(Date.UTC(2027, 2, 18, 8, 42));
  const clockText = \`\${String(clock.getUTCHours()).padStart(2, "0")}:\${String(clock.getUTCMinutes()).padStart(2, "0")}\`;
  const dayPart = clock.getUTCHours() < 12 ? "morning" : clock.getUTCHours() < 18 ? "afternoon" : "evening";`,
  ],
  ["Good morning, Maya", "Good {dayPart}, Maya"],
  ["<strong>018</strong>", '<strong>{String(missionDay ?? 18).padStart(3, "0")}</strong>'],
  ["LOCAL TIME · 08:42", "LOCAL TIME · {clockText}"],
  ['{anomalyActive ? "112" : "68"}<small> bpm</small>', "{liveHeartRate}<small> bpm</small>"],
  ["98<small>%</small>", "{liveSpo2}<small>%</small>"],
  ['{anomalyActive ? "112 bpm*" : "68 bpm"}', '{liveHeartRate} bpm{anomalyActive ? "*" : ""}'],
];

const problems = [];
for (const [find] of edits) {
  const count = src.split(find).length - 1;
  if (count !== 1) problems.push(`  found ${count} times (expected 1): ${find.slice(0, 70)}`);
}
if (problems.length) {
  console.error(`Not patched. Your file differs from the version this script was written for:\n${problems.join("\n")}`);
  process.exit(1);
}

for (const [find, replace] of edits) src = src.replace(find, () => replace);
writeFileSync(file, src);
console.log(`Patched ${file} (${edits.length} edits).`);
