/**
 * Browser storage the demo writes outside the simulation state. Reset clears all of it.
 * If you rename the journal key in the astronaut page, change it here too.
 */
const DEMO_STORAGE_KEYS = [
  "baymax.astronaut-journal.v1", // journal text entries and voice recordings (audio saved as data URLs)
  "medical-flow.outbox.v1", // symptom-guide reports saved on the device
];

export function clearDemoStorage(): void {
  if (typeof window === "undefined") return;
  for (const key of DEMO_STORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* storage unavailable: nothing to clear */
    }
  }
}