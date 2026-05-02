// ---------------------------------------------------------------------------
// Program page (Server Component)
// URL: /program
//
// Fetches both Day 1 and Day 2 schedules from Google Drive and renders them
// as a flat table (one row per heat) so athletes can see each heat's exact
// start time. Tabs in the client component switch between the two days.
//
// The Day 2 sheet ("2. Gün Saatli Program") has two side-by-side tables:
// columns A–E contain a different dataset; the actual 2. Gün data is in
// columns G–K (colOffset = 6).
// ---------------------------------------------------------------------------

import { fetchXlsxSheet } from "@/lib/googleSheets";
import {
  getScheduleTableRows,
  SCHEDULE_FILE_ID,
  DAY1_SHEET_NAME,
  DAY2_SHEET_NAME,
} from "@/lib/normalizeSchedule";
import type { RawScheduleRow } from "@/lib/normalizeSchedule";
import TopNav from "@/components/TopNav";
import SideNav from "@/components/SideNav";
import Footer from "@/components/Footer";
import ProgramTablePage from "@/components/ProgramTablePage";

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function ProgramPage() {
  let day1Rows: RawScheduleRow[] = [];
  let day2Rows: RawScheduleRow[] = [];
  const now = new Date();
  const lastUpdated = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  try {
    const [rows1, rows2] = await Promise.all([
      fetchXlsxSheet(SCHEDULE_FILE_ID, DAY1_SHEET_NAME),
      fetchXlsxSheet(SCHEDULE_FILE_ID, DAY2_SHEET_NAME),
    ]);
    day1Rows = getScheduleTableRows(rows1, 0);
    day2Rows = getScheduleTableRows(rows2, 6);
  } catch (err) {
    console.error("[ProgramPage] Failed to load schedule from Drive:", err);
  }

  return (
    <>
      <TopNav />
      <SideNav />
      <ProgramTablePage day1Rows={day1Rows} day2Rows={day2Rows} lastUpdated={lastUpdated} />
      <div className="lg:ml-64">
        <Footer />
      </div>
    </>
  );
}
