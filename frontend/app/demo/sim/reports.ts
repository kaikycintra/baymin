// Save as: app/demo/sim/reports.ts (NEW)
import type { FlightSurgeonReport } from "../../medical-flow";
import type { PendingItem, ReceivedReport, ReportResponse } from "./types";

export interface MyReport {
  id: string;
  report: FlightSurgeonReport;
  /** "received": the base server has it. "waiting": still on the astronaut's device. */
  status: "received" | "waiting";
  /** Simulated time it was sent (or queued). */
  at: number;
  /** Replies that have reached the astronaut's device. */
  replies: ReportResponse[];
}

/** The astronaut's own reports, newest first: the ones the base has, plus any still waiting for the link. */
export function selectMyReports(delivered: ReceivedReport[], outbox: PendingItem[], deviceResponses: ReportResponse[]): MyReport[] {
  const repliesFor = (id: string) => deviceResponses.filter((r) => r.reportId === id).sort((a, b) => a.at - b.at);
  const sent: MyReport[] = delivered.map(({ report, receivedAt }) => ({
    id: report.id, report, status: "received", at: receivedAt, replies: repliesFor(report.id),
  }));
  const waiting: MyReport[] = outbox.flatMap((item) =>
    item.payload.type === "report"
      ? [{ id: item.payload.report.id, report: item.payload.report, status: "waiting" as const, at: item.queuedAt, replies: [] }]
      : []
  );
  return [...sent, ...waiting].sort((a, b) => b.at - a.at);
}

export function groupResponses(responses: ReportResponse[]): Map<string, ReportResponse[]> {
  const map = new Map<string, ReportResponse[]>();
  for (const r of [...responses].sort((a, b) => a.at - b.at)) map.set(r.reportId, [...(map.get(r.reportId) ?? []), r]);
  return map;
}

export function countUnseen(deviceResponses: ReportResponse[], seenIds: string[]): number {
  const seen = new Set(seenIds);
  return deviceResponses.filter((r) => !seen.has(r.id)).length;
}