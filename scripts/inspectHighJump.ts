import { fetchXlsxSheetNames, fetchXlsxSheet, listDriveFolder } from "../lib/googleSheets";
import { DAY2_FOLDER_ID } from "../lib/eventConfig";

async function main() {
  const files = await listDriveFolder(DAY2_FOLDER_ID);
  const f = files.find((f) => f.name.toLowerCase().includes("ksek"));
  if (!f) { console.log("not found"); return; }
  console.log("File:", f.name, f.id);
  const sheets = await fetchXlsxSheetNames(f.id);
  console.log("Sheets:", sheets);
  for (const s of sheets) {
    const rows = await fetchXlsxSheet(f.id, s);
    console.log("\n=== Sheet:", s, "===");
    rows.slice(0, 15).forEach((r, i) => console.log(i, JSON.stringify(r)));
    // Also show a few data rows
    if (rows.length > 15) {
      console.log("...");
      rows.slice(15, 25).forEach((r, i) => console.log(15 + i, JSON.stringify(r)));
    }
  }
}
main().catch(console.error);
