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
import { DAY1_FOLDER_ID, getDriveFileBase, resolveCompositeEventBase, getCategoryKey, GENDER_KEYWORDS, FIELD_EVENT_BASES, RELAY_EVENT_BASES } from "./eventConfig";
import type { ScheduleEntry } from "./types";

export interface DiscoveredEvent {
  /** Matching schedule entry (metadata: title, time, category, etc.) */
  scheduleEntry: ScheduleEntry;
  /** Google Drive file ID of the XLSX */
  driveFileId: string;
  /** Sheet name containing the result/heat data */
  heatsSheet: string;
  /**
   * For mixed-gender (Kadın-Erkek) events only: the Erkek sheet name.
   * When set, the page renders two separate sections — one per gender.
   */
  additionalSheet?: string;
  /** Sheet names available in the file (for tab rendering) */
  allSheets: string[];
  /**
   * true → field event (jump or throw): use FieldEventDetailPage.
   * false → track/relay event.
   */
  isField: boolean;
  /**
   * true → relay event (4×100, 4×400): use RelayEventDetailPage.
   * false → track or field event.
   */
  isRelay: boolean;
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
    .replace(/\s+(Erkekler|Kadınlar|Karma|Kadın-Erkek)$/i, "")
    .trim();
  // First try the exact map, then the pattern-based fallback for composite
  // events (finals, relay variants) that share a Drive file with other events
  const resolvedBase =
    getDriveFileBase(rawEventName) ?? resolveCompositeEventBase(rawEventName);
  if (!resolvedBase) return null;

  // 3. List the Drive folder to find the actual file ID
  // Drive API returns NFD-encoded filenames (decomposed Unicode), so we
  // must normalize both sides to NFC before comparing.
  const nfc = (s: string) => s.normalize("NFC").toLowerCase();
  const files = await listDriveFolder(DAY1_FOLDER_ID);
  // Exact match only — never use startsWith, as it would cause "Gülle Atma" to
  // accidentally match "Gülle Atma Amatör.xlsx" (and "1500m" → "1500m Amatör.xlsx").
  const file = files.find(
    (f) => nfc(f.name) === nfc(`${resolvedBase}.xlsx`)
  );
  if (!file) return null;

  // 4. Get sheet names and find the right one for this category
  const allSheets = await fetchXlsxSheetNames(file.id);
  const categoryKey = getCategoryKey(entry.category);
  const genderWords = GENDER_KEYWORDS[categoryKey] ?? ["erkek"];

  // Determine event type up-front so the sheet picker can use it
  const isField = FIELD_EVENT_BASES.has(resolvedBase);
  const isRelay = RELAY_EVENT_BASES.has(resolvedBase);

  // Flags derived from the raw event name
  const rawLower = rawEventName.toLowerCase().normalize("NFC");
  const isFinal = rawLower.includes("final");
  const isAmator = rawLower.includes("amatör") || rawLower.includes("amator");

  // nfc-lowercased sheet name helper
  const sheetLower = (s: string) => s.toLowerCase().normalize("NFC");

  let heatsSheet: string | undefined;

  if (isFinal) {
    // Final heats: prefer a sheet that contains both "final" and the gender keyword
    heatsSheet = allSheets.find((s) => {
      const sl = sheetLower(s);
      return genderWords.some((w) => sl.includes(w)) && sl.includes("final");
    });
  } else if (isRelay) {
    // Relay: sheets are named ERKEKLER / KADINLAR / KARMA / AMATÖR ERKEK / AMATÖR KADIN
    // For amatör slugs, require the sheet name to also contain "amatör"/"amator"
    heatsSheet = allSheets.find((s) => {
      const sl = sheetLower(s);
      const hasGender = genderWords.some((w) => sl.includes(w));
      const sheetIsAmator = sl.includes("amatör") || sl.includes("amator");
      return hasGender && (isAmator ? sheetIsAmator : !sheetIsAmator);
    });
  } else {
    // Regular track events: prefer start-list (seçme) sheet for the gender,
    // excluding result sheets ("seçme sonuç")
    heatsSheet = allSheets.find((s) => {
      const sl = sheetLower(s);
      return (
        genderWords.some((w) => sl.includes(w)) &&
        sl.includes("seçme") &&
        !sl.includes("sonuç")
      );
    });
  }

  // Fallback: any sheet matching the gender keyword
  if (!heatsSheet) {
    heatsSheet = allSheets.find((s) =>
      genderWords.some((w) => sheetLower(s).includes(w))
    );
  }

  if (!heatsSheet) return null;

  // For mixed-gender (Kadın-Erkek) events, also find the Erkek sheet so the
  // page can render two sections (Kadınlar + Erkekler) side by side.
  const isKadinErkek = /kad[iı]n-?erkek/i.test(entry.category);
  let additionalSheet: string | undefined;
  if (isKadinErkek) {
    const erkekWords = GENDER_KEYWORDS["erkek"] ?? ["erkek"];
    let erkekSheet = allSheets.find((s) => {
      const sl = sheetLower(s);
      return (
        erkekWords.some((w) => sl.includes(w)) &&
        sl.includes("seçme") &&
        !sl.includes("sonuç")
      );
    });
    if (!erkekSheet) {
      erkekSheet = allSheets.find((s) =>
        erkekWords.some((w) => sheetLower(s).includes(w))
      );
    }
    additionalSheet = erkekSheet;
  }

  return {
    scheduleEntry: entry,
    driveFileId: file.id,
    heatsSheet,
    additionalSheet,
    allSheets,
    isField,
    isRelay,
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
