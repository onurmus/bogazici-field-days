import { fetchXlsxSheet } from "../lib/googleSheets";
import { normalizeScheduleRows, SCHEDULE_FILE_ID, DAY2_SHEET_NAME } from "../lib/normalizeSchedule";

async function main() {
  const rows = await fetchXlsxSheet(SCHEDULE_FILE_ID, DAY2_SHEET_NAME);
  const schedule = normalizeScheduleRows(rows, 2, "Yaklaşan", 6);
  console.log(`\nParsed ${schedule.length} schedule entries from Day 2:\n`);
  schedule.forEach((e) =>
    console.log(
      `  ${(e.scheduledTime || "??:??").padEnd(6)}  ${e.title.padEnd(45)} heats:${e.heatCount}  slug:${e.slug}`
    )
  );
}
main().catch((err) => { console.error(err.message); process.exit(1); });
