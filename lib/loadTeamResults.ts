// ---------------------------------------------------------------------------
// Loader: fetches all 4 team-results XLSX files from Drive and returns
// the raw TeamResultRow[] array. Consumers can filter + aggregate with
// buildTeamStandings() from normalizeTeamResults.ts.
// ---------------------------------------------------------------------------

import { listDriveFolder, fetchXlsxSheet, fetchXlsxSheetNames } from "./googleSheets";
import { TEAM_RESULTS_FOLDER_ID } from "./eventConfig";
import { parseTeamResultsSheet, parseFileMetadata } from "./normalizeTeamResults";
import type { TeamResultRow } from "./normalizeTeamResults";

export type { TeamResultRow } from "./normalizeTeamResults";
export { buildTeamStandings } from "./normalizeTeamResults";

export async function loadAllTeamResults(): Promise<TeamResultRow[]> {
  const files = await listDriveFolder(TEAM_RESULTS_FOLDER_ID);
  console.log(`[loadTeamResults] Found ${files.length} file(s) in folder ${TEAM_RESULTS_FOLDER_ID}:`, files.map((f) => f.name));

  if (files.length === 0) {
    console.warn("[loadTeamResults] No files found. Check that the service account has access to the folder.");
    return [];
  }

  // Fetch sheets for all files in parallel
  const fileData = await Promise.all(
    files.map(async (file) => {
      const meta = parseFileMetadata(file.name);
      if (!meta) {
        console.warn(`[loadTeamResults] Could not parse metadata from filename: "${file.name}"`);
        return null;
      }
      try {
        const sheetNames = await fetchXlsxSheetNames(file.id);
        console.log(`[loadTeamResults] "${file.name}" → sheets:`, sheetNames);
        // Use the first sheet (each file has one sheet)
        const sheet = sheetNames[0];
        if (!sheet) {
          console.warn(`[loadTeamResults] "${file.name}" has no sheets`);
          return null;
        }
        const rows = await fetchXlsxSheet(file.id, sheet);
        console.log(`[loadTeamResults] "${file.name}" sheet "${sheet}": ${rows.length} rows`);
        if (rows.length > 0) console.log(`[loadTeamResults]   header row:`, rows[0]);
        if (rows.length > 1) console.log(`[loadTeamResults]   first data row:`, rows[1]);
        return { rows, meta };
      } catch (err) {
        console.error(`[loadTeamResults] Failed to fetch "${file.name}":`, err);
        return null;
      }
    }),
  );

  const allRows: TeamResultRow[] = [];
  for (const item of fileData) {
    if (!item) continue;
    const parsed = parseTeamResultsSheet(item.rows, item.meta.day, item.meta.gender);
    console.log(`[loadTeamResults] Parsed ${parsed.length} team rows from day=${item.meta.day} gender=${item.meta.gender}`);
    allRows.push(...parsed);
  }
  console.log(`[loadTeamResults] Total team rows: ${allRows.length}`);
  return allRows;
}
