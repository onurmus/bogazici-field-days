// Run with: npx tsx --env-file=.env.local scripts/testTeamResults.ts
import { loadAllTeamResults, buildTeamStandings } from "@/lib/loadTeamResults";
import { listDriveFolder, fetchXlsxSheetNames, fetchXlsxSheet } from "@/lib/googleSheets";
import { TEAM_RESULTS_FOLDER_ID } from "@/lib/eventConfig";

async function main() {
  console.log("\n=== STEP 1: List folder contents ===");
  const files = await listDriveFolder(TEAM_RESULTS_FOLDER_ID);
  if (files.length === 0) {
    console.error("❌  No files found in folder:", TEAM_RESULTS_FOLDER_ID);
    console.error("    → Does the service account have Viewer access to this folder?");
    return;
  }
  files.forEach((f) => console.log(" •", JSON.stringify(f.name), "id:", f.id));

  console.log("\n=== STEP 2: Inspect first file ===");
  const first = files[0];
  const sheetNames = await fetchXlsxSheetNames(first.id);
  console.log("Sheets:", sheetNames);
  const rows = await fetchXlsxSheet(first.id, sheetNames[0]);
  console.log(`Rows: ${rows.length}`);
  rows.slice(0, 5).forEach((r, i) => console.log(`  [${i}]`, JSON.stringify(r)));

  console.log("\n=== STEP 3: Full load + standings ===");
  const allRows = await loadAllTeamResults();
  console.log("Total TeamResultRow entries:", allRows.length);

  if (allRows.length > 0) {
    const standings = buildTeamStandings(allRows, "all", "all");
    console.log("\nTop 5 (combined):");
    standings.slice(0, 5).forEach((s) => console.log(`  ${s.rank}. ${s.team} — ${s.total} puan`));
  }
}

main().catch(console.error);
