// ---------------------------------------------------------------------------
// Google Sheets / Google Drive adapter
//
// Supports two modes:
//   1. Native Google Sheets (mimeType: application/vnd.google-apps.spreadsheet)
//      → uses the Sheets API with fetchSheetRange / fetchSheetRangesBatch
//   2. XLSX file stored in Google Drive
//      → uses the Drive API to download the file, then parses with SheetJS
//      → use fetchXlsxSheet / fetchXlsxSheetsBatch
//
// The Day 1 schedule file "Program - Field Day 2026.xlsx" is currently in XLSX
// format. To use the Sheets API directly, open it in Google Drive and choose
// File → Save as Google Sheets, then update the spreadsheetId in eventConfig.ts.
//
// Authentication: Service Account key in GOOGLE_SERVICE_ACCOUNT_KEY (.env.local)
// ---------------------------------------------------------------------------

import { google } from "googleapis";
import * as XLSX from "xlsx";

export type SheetRow = string[];

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

function getSheetsClient() {
  const credentials = getCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  return google.sheets({ version: "v4", auth });
}

function getDriveClient() {
  const credentials = getCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  return google.drive({ version: "v3", auth });
}

function getCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set. Add it to .env.local."
    );
  }
  return JSON.parse(raw);
}

// ---------------------------------------------------------------------------
// Sheets API (native Google Sheets files only)
// ---------------------------------------------------------------------------

/**
 * Fetches a single A1-notation range from a native Google Spreadsheet.
 */
export async function fetchSheetRange(
  spreadsheetId: string,
  range: string
): Promise<SheetRow[]> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  return (res.data.values ?? []) as SheetRow[];
}

/**
 * Fetches multiple ranges in a single batchGet call.
 * More efficient than multiple fetchSheetRange calls.
 */
export async function fetchSheetRangesBatch(
  spreadsheetId: string,
  ranges: string[]
): Promise<SheetRow[][]> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges,
  });
  return (res.data.valueRanges ?? []).map(
    (vr) => (vr.values ?? []) as SheetRow[]
  );
}

/**
 * Returns all sheet/tab names in a native Google Spreadsheet.
 */
export async function fetchSheetNames(spreadsheetId: string): Promise<string[]> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });
  return (res.data.sheets ?? [])
    .map((s) => s.properties?.title ?? "")
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Drive API (XLSX files)
// ---------------------------------------------------------------------------

async function downloadWorkbook(fileId: string): Promise<XLSX.WorkBook> {
  const drive = getDriveClient();
  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" }
  );
  const workbook = XLSX.read(Buffer.from(res.data as ArrayBuffer), {
    type: "buffer",
    cellDates: false,
  });
  return workbook;
}

/**
 * Reads a named sheet from an XLSX Drive file and returns rows as string arrays.
 * All cell values are coerced to strings; empty cells become "".
 *
 * @param fileId     Google Drive file ID of the .xlsx file.
 * @param sheetName  Name of the tab/sheet to read.
 */
export async function fetchXlsxSheet(
  fileId: string,
  sheetName: string
): Promise<SheetRow[]> {
  const workbook = await downloadWorkbook(fileId);
  const ws = workbook.Sheets[sheetName];
  if (!ws) return [];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    defval: "",
    raw: true,
  });
  return rows.map((row) =>
    (row as unknown[]).map((cell) => {
      if (cell === "" || cell == null) return "";
      // Excel serial time fractions (e.g. 0.5208) → "HH:MM"
      if (typeof cell === "number" && cell > 0 && cell < 1) {
        return excelTimeToHHMM(cell);
      }
      // Excel date serials (e.g. 46145) → leave as-is for now
      return String(cell).trim();
    })
  );
}

/**
 * Reads multiple named sheets from the same XLSX Drive file.
 * Returns one SheetRow[] per sheet name, in order.
 */
export async function fetchXlsxSheetsBatch(
  fileId: string,
  sheetNames: string[]
): Promise<SheetRow[][]> {
  const workbook = await downloadWorkbook(fileId);
  return sheetNames.map((name) => {
    const ws = workbook.Sheets[name];
    if (!ws) return [];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
      header: 1,
      defval: "",
      raw: true,
    });
    return rows.map((row) =>
      (row as unknown[]).map((cell) => {
        if (cell === "" || cell == null) return "";
        if (typeof cell === "number" && cell > 0 && cell < 1) {
          return excelTimeToHHMM(cell);
        }
        return String(cell).trim();
      })
    );
  });
}

// ---------------------------------------------------------------------------
// Drive folder listing
// ---------------------------------------------------------------------------

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

/**
 * Lists all non-trashed files directly inside a Google Drive folder.
 * Useful for auto-discovering event XLSX files without hardcoding their IDs.
 */
export async function listDriveFolder(folderId: string): Promise<DriveFile[]> {
  const drive = getDriveClient();
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id, name, mimeType)",
    orderBy: "name",
    pageSize: 100,
  });
  return (res.data.files ?? []).map((f) => ({
    id: f.id ?? "",
    name: f.name ?? "",
    mimeType: f.mimeType ?? "",
  }));
}

/**
 * Returns the sheet/tab names inside an XLSX Drive file without reading cell data.
 * Useful for event discovery when building EventConfig entries dynamically.
 */
export async function fetchXlsxSheetNames(fileId: string): Promise<string[]> {
  const workbook = await downloadWorkbook(fileId);
  return workbook.SheetNames;
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/** Convert an Excel fractional-day serial (0–1) to "HH:MM" */
function excelTimeToHHMM(fraction: number): string {
  const totalMinutes = Math.round(fraction * 24 * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
