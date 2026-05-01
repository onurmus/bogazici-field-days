// ---------------------------------------------------------------------------
// Structural configuration — the ONLY hardcoded knowledge about events.
//
// What IS stored here (structural, rarely changes):
//   • Google Drive folder IDs for each competition day
//   • A small lookup: schedule event name → Drive XLSX filename base
//     (needed to link a schedule entry to the correct XLSX file on Drive)
//
// What is NOT stored here (comes from Google Drive/Sheets dynamically):
//   • Scheduled times
//   • Event titles / display names
//   • Categories (Erkek / Kadın / KARMA)
//   • Number of heats
//   • Athlete start lists
//   • Results
//
// To add a new event: upload the XLSX to the Drive folder and add one line
// to EVENT_NAME_TO_DRIVE_FILE mapping the schedule name to the filename base.
// ---------------------------------------------------------------------------

/** Google Drive folder containing Day 1 event XLSX files */
export const DAY1_FOLDER_ID = "1Nf4UAetwA28IZsoPixKLT_ELxJqndOOQ";

/** Google Drive folder containing Day 2 event XLSX files (set when ready) */
export const DAY2_FOLDER_ID = "";

/**
 * Maps normalized schedule event names (uppercase) to Drive XLSX filename
 * bases (i.e. filename without the .xlsx extension, case-sensitive as on Drive).
 *
 * The schedule XLSX might say "100 Metre" or "100 METRE" — we uppercase-trim
 * both keys and values when doing lookups, so case doesn't matter here.
 *
 * When an event name from the schedule isn't found here, no detail-page link
 * is generated for that event (it will still appear on the schedule page).
 */
export const EVENT_NAME_TO_DRIVE_FILE: Record<string, string> = {
  // Track — short sprints
  "100 METRE":              "100m",
  "200 METRE":              "200m",
  "400 METRE":              "400m",
  // Distance
  "800 METRE":              "800m",
  "1500 METRE":             "1500m",
  "1500 METRE AMATOR":      "1500m Amatör",  // normalized (ö→o)
  "3000 METRE":             "3000m",
  "5000 METRE":             "5000m",
  // Hurdles — must come BEFORE plain "100 METRE" prefix would match
  "100 METRE ENGELLI":      "100_110 Engel",
  "110 METRE ENGELLI":      "100_110 Engel",
  "100 M ENGEL":            "100_110 Engel",
  "110 M ENGEL":            "100_110 Engel",
  "100/110 M ENGEL":        "100_110 Engel",
  // Field — throws
  "GULLE ATMA":             "Gülle Atma",    // normalized (ü→u)
  "GULLE ATMA AMATOR":      "Gülle Atma Amatör",
  "CIRIT":                  "Cirit",
  "CIRIT ATMA":             "Cirit",
  "DISK ATMA":              "Disk",
  "CEKIC ATMA":             "Çekiç",
  // Field — jumps
  "UC ADIM":                "Üçadım",
  "UCADIM":                 "Üçadım",
  "UC ADIM ATLAMA":         "Üçadım",
  "UZUN ATLAMA":            "Uzun Atlama",
  "YUKSEK ATLAMA":          "Yüksek Atlama",
  // Relay
  "4X100":                  "4x100m",
  "4 X 100":                "4x100m",
  "BAYRAK":                 "4x100m",
};

/**
 * Drive file base names that correspond to relay events (4x100, 4x400).
 * These are routed to RelayEventDetailPage instead of EventDetailPage.
 */
export const RELAY_EVENT_BASES = new Set([
  "4x100m",
  "4x400m",
]);

/**
 * Drive file base names that correspond to field events (throws & jumps).
 * These are routed to FieldEventDetailPage instead of EventDetailPage.
 */
export const FIELD_EVENT_BASES = new Set([
  "Gülle Atma",
  "Gülle Atma Amatör",
  "Cirit",
  "Disk",
  "Çekiç",
  "Üçadım",
  "Uzun Atlama",
  "Yüksek Atlama",
]);

/** Normalize Turkish characters for map key lookup */
function normalizeTurkish(s: string): string {
  return s
    .toUpperCase()
    .replace(/Ş/g, "S")
    .replace(/I/g, "I")
    .replace(/İ/g, "I")
    .replace(/Ğ/g, "G")
    .replace(/Ü/g, "U")
    .replace(/Ö/g, "O")
    .replace(/Ç/g, "C")
    .trim();
}

/**
 * Given a normalized event name (from the schedule), returns the Drive XLSX
 * filename base, or undefined if the event has no detail page.
 *
 * Exact match only — no prefix guessing to avoid "100 Metre" matching
 * "100 Metre Engelli".
 */
export function getDriveFileBase(eventName: string): string | undefined {
  const key = normalizeTurkish(eventName).replace(/\s+/g, " ");
  // Exact match
  if (EVENT_NAME_TO_DRIVE_FILE[key]) return EVENT_NAME_TO_DRIVE_FILE[key];
  // Also try collapsing spaces (handles "100METRE" edge cases)
  const compacted = key.replace(/\s+/g, "");
  for (const [k, v] of Object.entries(EVENT_NAME_TO_DRIVE_FILE)) {
    if (normalizeTurkish(k).replace(/\s+/g, "") === compacted) return v;
  }
  return undefined;
}

/**
 * Pattern-based resolver for composite events that share a Drive file with
 * regular events but need distinct slugs (so they can't be in
 * EVENT_NAME_TO_DRIVE_FILE without causing slug collisions).
 *
 * Examples:
 *   "100m Final A" → "100m"  (same file as heats, different sheet)
 *   "4x100 Metre Bayrak" → "4x100m"
 *   "4x100 Metre Karma Bayrak" → "4x100m"
 */
export function resolveCompositeEventBase(eventName: string): string | undefined {
  const norm = normalizeTurkish(eventName).replace(/\s+/g, " ");
  if (/^100M? FINAL/.test(norm)) return "100m";
  if (/^4X100/.test(norm)) return "4x100m";
  if (/^4X400/.test(norm)) return "4x400m";
  return undefined;
}

/**
 * Keywords that identify the gender/category within a sheet name.
 * Used to select the correct sheet from an XLSX file.
 */
export const GENDER_KEYWORDS: Record<string, string[]> = {
  erkek:  ["erkek", "men"],
  kadin:  ["kadın", "kadin", "women"],
  karma:  ["karma", "mixed"],
};

/**
 * Given a category string from the schedule (e.g. "Erkek", "Kadın", "KARMA"),
 * returns the gender key used in slug generation ("erkek" | "kadin" | "karma").
 */
export function getCategoryKey(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes("kadın") || lower.includes("kadin") || lower.includes("women")) return "kadin";
  if (lower.includes("karma") || lower.includes("mixed")) return "karma";
  return "erkek"; // default / "Erkek"
}
