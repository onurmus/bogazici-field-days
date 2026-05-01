// ---------------------------------------------------------------------------
// Home / Schedule page (Server Component)
// Fetches live schedule from Google Drive XLSX, falls back to mock on error.
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

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function Home() {
  let schedule = getMockSchedule();
  const now = new Date();
  const lastUpdated = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  try {
    const rows = await fetchXlsxSheet(SCHEDULE_FILE_ID, DAY1_SHEET_NAME);
    schedule = normalizeScheduleRows(rows, 1);
  } catch (err) {
    console.error("[Home] Failed to load schedule from Drive, using mock data:", err);
  }

  return (
    <>
      <TopNav />
      <SideNav />
      <SchedulePage schedule={schedule} lastUpdated={lastUpdated} />
      <div className="lg:ml-64">
        <Footer />
      </div>
    </>
  );
}
