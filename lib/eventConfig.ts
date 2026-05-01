// ---------------------------------------------------------------------------
// Config-driven event structure
//
// Each entry describes:
//   - where to find the event data in Google Sheets
//   - how each heat maps to a specific sheet range
//   - enough metadata for the schedule page (no API call needed)
//
// Replace placeholder spreadsheetId values with real IDs once available.
// ---------------------------------------------------------------------------

export interface HeatRange {
  /** 1-based heat number */
  heat: number;
  /**
   * A1-notation range that covers this heat, e.g. "Erkekler!A1:F20".
   * Columns are expected to map to: lane, bib, athleteName, team, result, note.
   */
  range: string;
}

export interface EventConfig {
  /** URL-safe identifier used as the dynamic route segment */
  slug: string;
  /** Human-readable title shown in the UI (Turkish) */
  title: string;
  day: 1 | 2;
  scheduledTime: string;
  /** E.g. "Seçmeler", "Final" */
  round: string;
  /** E.g. "Erkekler", "Kadınlar" */
  category: string;
  /** Google Spreadsheet ID for this event */
  spreadsheetId: string;
  /** Name of the primary sheet/tab */
  sheetName: string;
  /** Per-heat range definitions */
  heats: HeatRange[];
}

/**
 * Central registry of all events.
 * Add one entry per event/discipline/category combination.
 *
 * TODO: Replace PLACEHOLDER_SPREADSHEET_ID values with real spreadsheet IDs.
 */
export const EVENT_CONFIGS: EventConfig[] = [
  {
    slug: "100m-erkekler",
    title: "100m Erkekler",
    day: 1,
    scheduledTime: "11:20",
    round: "Seçmeler",
    category: "Erkekler",
    spreadsheetId: "PLACEHOLDER_SPREADSHEET_ID",
    sheetName: "Erkekler",
    heats: [
      { heat: 1, range: "Erkekler!A2:F20" },
      { heat: 2, range: "Erkekler!H2:M20" },
    ],
  },
  {
    slug: "100m-kadinlar",
    title: "100m Kadınlar",
    day: 1,
    scheduledTime: "11:40",
    round: "Seçmeler",
    category: "Kadınlar",
    spreadsheetId: "PLACEHOLDER_SPREADSHEET_ID",
    sheetName: "Kadınlar",
    heats: [
      { heat: 1, range: "Kadınlar!A2:F20" },
    ],
  },
  {
    slug: "400m-erkekler",
    title: "400m Erkekler",
    day: 1,
    scheduledTime: "13:00",
    round: "Seçmeler",
    category: "Erkekler",
    spreadsheetId: "PLACEHOLDER_SPREADSHEET_ID",
    sheetName: "Erkekler",
    heats: [
      { heat: 1, range: "Erkekler!A2:F20" },
      { heat: 2, range: "Erkekler!H2:M20" },
    ],
  },
  {
    slug: "uzun-atlama-erkekler",
    title: "Uzun Atlama Erkekler",
    day: 2,
    scheduledTime: "10:00",
    round: "Final",
    category: "Erkekler",
    spreadsheetId: "PLACEHOLDER_SPREADSHEET_ID",
    sheetName: "Erkekler",
    heats: [
      { heat: 1, range: "Erkekler!A2:F30" },
    ],
  },
];

/** Look up a single event config by slug. Returns undefined if not found. */
export function getEventConfig(slug: string): EventConfig | undefined {
  return EVENT_CONFIGS.find((e) => e.slug === slug);
}
