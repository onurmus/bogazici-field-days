// ---------------------------------------------------------------------------
// Schedule normalizer
//
// Source: "Program - Field Day 2026.xlsx" (Drive file ID: 1nnIwiViEq_Ri41gzAf9KY32NKf8U1fW6)
//
// Sheet: "1. Gün Saatli Program"
// Column layout (0-based, header row is index 2, data starts at index 3):
//   A (0) — Yarışma Alanı    : warm-up / check-in area time (often empty or redundant)
//   B (1) — Yarışma Saati    : scheduled race time (HH:MM or HH.MM, may be empty on continuation rows)
//   C (2) — Yarışma Adı      : event name (e.g. "100 Metre   ", "Gülle Atma ")
//   D (3) — Seri No          : heat label (e.g. "1. Seri", may be empty for field events)
//   E (4) — Kategori         : category (e.g. "Kadın", "Erkek", "KARMA", "Kadın-Erkek")
//
// Normalization strategy:
//   1. Skip rows where event name (col C) is empty.
//   2. Normalize event names (trim, collapse spaces).
//   3. Normalize times (replace "." separator with ":").
//   4. Group consecutive rows with the same (eventName, category) into one ScheduleEntry.
//   5. The group's scheduledTime = first non-empty time in the group.
//   6. Count heats per group (rows with a non-empty Seri No value, or 1 for field events).
//   7. Generate a URL-safe slug from (eventName, category).
//
// TODO: Once the file is converted to native Google Sheets, switch from
//       fetchXlsxSheet → fetchSheetRange and remove the XLSX dependency.
// ---------------------------------------------------------------------------

import type { ScheduleEntry, EventStatus } from "./types";
import type { SheetRow } from "./googleSheets";

export const SCHEDULE_FILE_ID = "1nnIwiViEq_Ri41gzAf9KY32NKf8U1fW6";
export const DAY1_SHEET_NAME = "1. Gün Saatli Program";
// Day 2 data is in columns G–K of the "2. Gün Saatli Program" sheet (offset 6).
export const DAY2_SHEET_NAME = "2. Gün Saatli Program";

// Header row index (0-based). Rows 0–2 are title/header rows.
const DATA_START_ROW = 3;

interface RawRow {
  areaTime: string;     // col A
  raceTime: string;     // col B
  eventName: string;    // col C
  heatLabel: string;    // col D
  category: string;     // col E
}

function parseRawRows(rows: SheetRow[]): RawRow[] {
  return rows.slice(DATA_START_ROW).map((row) => ({
    areaTime:  normalizeTime(row[0] ?? ""),
    raceTime:  normalizeTime(row[1] ?? ""),
    eventName: normalizeEventName(row[2] ?? ""),
    heatLabel: (row[3] ?? "").trim(),
    category:  (row[4] ?? "").trim(),
  }));
}

/** Normalise time strings: "14.00 " → "14:00", "14:00" stays, "" stays */
function normalizeTime(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  // Replace dot decimal separator with colon, e.g. "14.00" → "14:00"
  return s.replace(/^(\d{1,2})\.(\d{2})\s*$/, "$1:$2");
}

/** Trim and collapse multiple spaces, e.g. "100 Metre   " → "100 Metre" */
function normalizeEventName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

/** Build a URL-safe slug from event name + category */
function makeSlug(eventName: string, category: string): string {
  const base = `${eventName} ${category}`
    .toLowerCase()
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base;
}

/**
 * Groups raw rows by (eventName, category) and produces ScheduleEntry objects.
 * Consecutive rows with the same (eventName, category) are merged into one entry.
 */
export function normalizeScheduleRows(
  rows: SheetRow[],
  day: 1 | 2,
  status: EventStatus = "Yaklaşan"
): ScheduleEntry[] {
  const rawRows = parseRawRows(rows).filter((r) => r.eventName !== "");

  const groups: Map<string, { entry: ScheduleEntry; heatCount: number }> =
    new Map();

  for (const row of rawRows) {
    const key = `${row.eventName}||${row.category}`;
    if (!groups.has(key)) {
      groups.set(key, {
        entry: {
          slug: makeSlug(row.eventName, row.category),
          title: `${row.eventName}${row.category ? " " + row.category : ""}`,
          day,
          scheduledTime: row.raceTime || row.areaTime,
          round: "Seçmeler", // default; can be overridden from config
          category: row.category,
          status,
          heatCount: 0,
        },
        heatCount: 0,
      });
    }
    const group = groups.get(key)!;
    // Update scheduledTime if we didn't have one yet
    if (!group.entry.scheduledTime && (row.raceTime || row.areaTime)) {
      group.entry.scheduledTime = row.raceTime || row.areaTime;
    }
    // Count heats: rows with an explicit heat label count as a heat;
    // rows without one (field events) count as 1 heat total for the group.
    if (row.heatLabel) {
      group.heatCount += 1;
    } else if (group.heatCount === 0) {
      group.heatCount = 1;
    }
    group.entry.heatCount = group.heatCount;
  }

  return Array.from(groups.values()).map((g) => g.entry);
}

// ---------------------------------------------------------------------------
// Mock fallback (used when Google Drive is not reachable in local dev)
// ---------------------------------------------------------------------------

import { EVENT_CONFIGS } from "./eventConfig";

export function getMockSchedule(): ScheduleEntry[] {
  return EVENT_CONFIGS.map((cfg) => ({
    slug: cfg.slug,
    title: cfg.title,
    day: cfg.day,
    scheduledTime: cfg.scheduledTime,
    round: cfg.round,
    category: cfg.category,
    status: "Yaklaşan" as const,
    heatCount: cfg.heats.length,
  }));
}
