// ---------------------------------------------------------------------------
// GET /api/schedule
//
// Returns the full competition schedule as a JSON array of ScheduleEntry.
//
// Cache strategy: revalidate every 60 seconds (Next.js route segment config).
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import {
  normalizeScheduleRows,
  getMockSchedule,
  SCHEDULE_FILE_ID,
  DAY1_SHEET_NAME,
} from "@/lib/normalizeSchedule";
import { fetchXlsxSheet } from "@/lib/googleSheets";

export const revalidate = 60;

export async function GET() {
  try {
    const rows = await fetchXlsxSheet(SCHEDULE_FILE_ID, DAY1_SHEET_NAME);
    const schedule = normalizeScheduleRows(rows, 1);
    return NextResponse.json(schedule);
  } catch (err) {
    console.error("[/api/schedule] Failed to load live data, falling back to mock:", err);
    return NextResponse.json(getMockSchedule());
  }
}
