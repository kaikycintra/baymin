import { MISSION } from "./constants";

const pad = (n: number) => String(n).padStart(2, "0");

/** Mission clock text. UTC on purpose, so server and browser always agree. */
export function formatClock(ms: number, withSeconds = false): string {
  const d = new Date(ms);
  const base = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  return withSeconds ? `${base}:${pad(d.getUTCSeconds())}` : base;
}

export function toInputValue(ms: number): string {
  return new Date(ms).toISOString().slice(0, 16);
}

export function fromInputValue(value: string): number | null {
  const ms = Date.parse(`${value}:00Z`);
  return Number.isNaN(ms) ? null : ms;
}

export function formatPpm(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function missionDay(ms: number): number {
  return Math.max(1, Math.floor((ms - MISSION.start) / 86_400_000) + 1);
}

/** Day on the Mars surface (1 = landing day), or undefined while the crew is still in transit. */
export function marsDay(ms: number): number | undefined {
  const day = missionDay(ms) - MISSION.landingDay + 1;
  return day >= 1 ? day : undefined;
}