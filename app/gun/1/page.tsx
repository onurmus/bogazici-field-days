// ---------------------------------------------------------------------------
// Day 1 Schedule page (Server Component)
// ---------------------------------------------------------------------------

import { fetchXlsxSheet } from "@/lib/googleSheets";
import {
  normalizeScheduleRows,
  getMockSchedule,
  SCHEDULE_FILE_ID,
  DAY1_SHEET_NAME,
} from "@/lib/normalizeSchedule";
import TopNav from "@/components/TopNav";
import SideNav from "@/components/SideNav";
import Footer from "@/components/Footer";
import SchedulePage from "@/components/SchedulePage";

export const revalidate = 60;

export const metadata = { title: "1. Gün – BÜ  2026" };

export default async function Gun1Page() {
  let schedule = getMockSchedule();
  const now = new Date();
  const lastUpdated = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  try {
    const rows = await fetchXlsxSheet(SCHEDULE_FILE_ID, DAY1_SHEET_NAME);
    schedule = normalizeScheduleRows(rows, 1);
  } catch (err) {
    console.error("[Gun1Page] Failed to load Day 1 schedule from Drive, using mock data:", err);
  }

  return (
    <>
      <TopNav />
      <SideNav />
      <SchedulePage schedule={schedule} lastUpdated={lastUpdated} day={1} />
      <div className="lg:ml-64">
        <Footer />
      </div>
    </>
  );
}
