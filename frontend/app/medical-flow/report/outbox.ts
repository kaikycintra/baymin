import type { FlightSurgeonReport } from "./buildReport";

/**
 * Store-and-forward queue. Reports are saved locally first and sent whenever the link is up,
 * because the response (and even the transmission) may be delayed.
 */
export interface OutboxItem {
  report: FlightSurgeonReport;
  status: "queued" | "sent";
  queuedAt: string;
  sentAt?: string;
}

const KEY = "medical-flow.outbox.v1";

function read(): OutboxItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as OutboxItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: OutboxItem[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable: nothing else we can do here */
  }
}

export function listOutbox(): OutboxItem[] {
  return read();
}

export function enqueueReport(report: FlightSurgeonReport): OutboxItem {
  const item: OutboxItem = { report, status: "queued", queuedAt: new Date().toISOString() };
  write([...read(), item]);
  return item;
}

/**
 * Tries to send every queued report with the sender you provide (HTTP, WebSocket, DTN bridge...).
 * Failed items stay queued and are retried on the next call.
 */
export async function flushOutbox(
  send: (report: FlightSurgeonReport) => Promise<void>
): Promise<{ sent: number; failed: number }> {
  const items = read();
  let sent = 0;
  let failed = 0;
  for (const item of items) {
    if (item.status !== "queued") continue;
    try {
      await send(item.report);
      item.status = "sent";
      item.sentAt = new Date().toISOString();
      sent++;
    } catch {
      failed++;
    }
  }
  write(items);
  return { sent, failed };
}
