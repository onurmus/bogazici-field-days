import { fetchXlsxSheet } from "@/lib/googleSheets";
import { normalizeScheduleRows, SCHEDULE_FILE_ID, DAY1_SHEET_NAME } from "@/lib/normalizeSchedule";
import { discoverEvent } from "@/lib/discoverEvent";

async function main() {
  // 1. Show a few schedule slugs
  const rows = await fetchXlsxSheet(SCHEDULE_FILE_ID, DAY1_SHEET_NAME);
  const entries = normalizeScheduleRows(rows, 1);
  console.log("\n=== Schedule slugs (first 10) ===");
  entries.slice(0, 10).forEach((e) => console.log(`  ${e.slug}  →  "${e.title}"  (${e.category})  ${e.scheduledTime}`));

  // 2. Try to discover 100m-erkekler
  console.log("\n=== Discovering 100m-erkekler ===");
  const d = await discoverEvent("100m-erkekler");
  if (d) {
    console.log("  ✓ Found!");
    console.log("  Title:", d.scheduleEntry.title);
    console.log("  Time:", d.scheduleEntry.scheduledTime);
    console.log("  Category:", d.scheduleEntry.category);
    console.log("  Drive file:", d.driveFileId);
    console.log("  Sheet:", d.heatsSheet);
    console.log("  All sheets:", d.allSheets);
  } else {
    console.log("  ✗ Not found");
  }
}
main().catch(console.error);
