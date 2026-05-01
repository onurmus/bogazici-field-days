/**
 * One-shot script to inspect a Google Spreadsheet's structure.
 * Run with:  node --env-file=.env.local --experimental-strip-types scripts/inspectSheet.ts <spreadsheetId>
 *
 * Prints:
 *   - All sheet/tab names
 *   - First 30 rows of each tab (as JSON)
 */

import { google } from "googleapis";

const SPREADSHEET_ID = process.argv[2] ?? "1nnIwiViEq_Ri41gzAf9KY32NKf8U1fW6";

async function main() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not set");

  const credentials = JSON.parse(raw);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  // 1. List all tabs
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    fields: "sheets.properties",
  });

  const sheetInfos = (meta.data.sheets ?? []).map((s) => ({
    title: s.properties?.title ?? "",
    index: s.properties?.index ?? 0,
    rowCount: s.properties?.gridProperties?.rowCount ?? 0,
    colCount: s.properties?.gridProperties?.columnCount ?? 0,
  }));

  console.log("\n=== SHEET TABS ===");
  console.log(JSON.stringify(sheetInfos, null, 2));

  // 2. Read first 40 rows of each tab
  const ranges = sheetInfos.map((s) => `'${s.title}'!A1:Z40`);
  const batchRes = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SPREADSHEET_ID,
    ranges,
  });

  console.log("\n=== TAB CONTENTS (first 40 rows each) ===");
  (batchRes.data.valueRanges ?? []).forEach((vr, i) => {
    console.log(`\n--- Tab: ${sheetInfos[i]?.title} ---`);
    (vr.values ?? []).forEach((row, rowIdx) => {
      console.log(`  [${rowIdx}]`, row);
    });
  });
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
