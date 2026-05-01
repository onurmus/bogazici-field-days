// ---------------------------------------------------------------------------
// Event discovery — server-only
//
// Given a URL slug, finds the correct Drive XLSX file and sheet name by:
//   1. Re-reading the schedule XLSX to find the event metadata for this slug.
//   2. Using the event name → Drive file lookup in eventConfig.ts to find
//      the filename base.
//   3. Listing the Drive folder to find the actual file ID for that filename.
//   4. Getting the sheet names from the XLSX and selecting the right one
//      based on the gender keyword in the slug / category.
//
// Everything is resolved at runtime — no hardcoded times, titles, or IDs.
// Next.js ISR caches the result for revalidate seconds so Drive isn't hit
// on every request.
// ---------------------------------------------------------------------------

import { fetchXlsxSheet, listDriveFolder, fetchXlsxSheetNames } from "./googleSheets";
import { normalizeScheduleRows, SCHEDULE_FILE_ID, DAY1_SHEET_NAME } from "./normalizeSchedule";
import { DAY1_FOLDER_ID, getDriveFileBase, getCategoryKey, GENDER_KEYWORDS } from "./eventConfig";
import type { ScheduleEntry } from "./types";

export interface DiscoveredEvent {
  /** Matching schedule entry (metadata: title, time, category, etc.) */
  scheduleEntry: ScheduleEntry;
  /** Google Drive file ID of the XLSX */
  driveFileId: string;
  /** Sheet name containing the result/heat data */
  heatsSheet: string;
  /** Sheet names available in the file (for tab rendering) */
  allSheets: string[];
  /**
   * true → field event (jump or throw): use FieldEventDetailPage.
   * false → track event (sprint/distance): use EventDetailPage (heats).
   */
  isField: boolean;
}

/**
 * Resolves everything needed to render an event detail page for a given slug.
 * Returns null if the slug is not found in the schedule or no Drive file matches.
 */
export async function discoverEvent(slug: string): Promise<DiscoveredEvent | null> {
  // 1. Read the schedule to find metadata for this slug
  const scheduleRows = await fetchXlsxSheet(SCHEDULE_FILE_ID, DAY1_SHEET_NAME);
  const allEntries = normalizeScheduleRows(scheduleRows, 1);
  const entry = allEntries.find((e) => e.slug === slug);
  if (!entry) return null;

  // 2. Find the Drive filename base for this event name
  // Strip the appended category suffix (e.g. " Erkekler", " Kadınlar") from
  // the display title to recover the raw event name for the lookup.
  const rawEventName = entry.title
    .replace(/\s+(Erkekler|Kadınlar|Karma)$/i, "")
    .trim();
  const resolvedBase = getDriveFileBase(rawEventName);
  if (!resolvedBase) return null;

  // 3. List the Drive folder to find the actual file ID
  // Drive API returns NFD-encoded filenames (decomposed Unicode), so we
  // must normalize both sides to NFC before comparing.
  const nfc = (s: string) => s.normalize("NFC").toLowerCase();
  const files = await listDriveFolder(DAY1_FOLDER_ID);
  const file = files.find(
    (f) =>
      nfc(f.name) === nfc(`${resolvedBase}.xlsx`) ||
      nfc(f.name).startsWith(nfc(resolvedBase))
  );
  if (!file) return null;

  // 4. Get sheet names and find the right one for this category
  const allSheets = await fetchXlsxSheetNames(file.id);
  const categoryKey = getCategoryKey(entry.category);
  const genderWords = GENDER_KEYWORDS[categoryKey] ?? ["erkek"];

  // Find the seçme (qualifying heats) sheet matching the gender
  const heatsSheet = allSheets.find((s) => {
    const lower = s.toLowerCase();
    const hasGender = genderWords.some((w) => lower.includes(w));
    // Prefer the start-list sheet (seçme), not the results or final sheet
    const isHeats = lower.includes("seçme") && !lower.includes("sonuç");
    return hasGender && isHeats;
  })
    // Fallback: any sheet matching gender keyword
    ?? allSheets.find((s) => {
      const lower = s.toLowerCase();
      return genderWords.some((w) => lower.includes(w));
    });

  if (!heatsSheet) return null;

  // Field events are explicitly identified by their Drive file base name.
  // (Hurdles also lack a "Seçme" sheet, so sheet-name heuristics are unreliable.)
  const { FIELD_EVENT_BASES } = await import("./eventConfig");
  const isField = FIELD_EVENT_BASES.has(resolvedBase);

  return {
    scheduleEntry: entry,
    driveFileId: file.id,
    heatsSheet,
    allSheets,
    isField,
  };
}

/**
 * Builds a full list of all discoverable event slugs from the Drive folder
 * and the schedule. Used for generateStaticParams (optional).
 */
export async function listDiscoverableSlugs(): Promise<string[]> {
  const scheduleRows = await fetchXlsxSheet(SCHEDULE_FILE_ID, DAY1_SHEET_NAME);
  const allEntries = normalizeScheduleRows(scheduleRows, 1);
  const files = await listDriveFolder(DAY1_FOLDER_ID);
  const fileNames = new Set(files.map((f) => f.name.toLowerCase()));

  return allEntries
    .filter((e) => {
      const base = getDriveFileBase(e.title.replace(e.category, "").trim())
        ?? getDriveFileBase(e.title);
      return base && fileNames.has(`${base.toLowerCase()}.xlsx`);
    })
    .map((e) => e.slug);
}
