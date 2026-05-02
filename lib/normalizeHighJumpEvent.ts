// ---------------------------------------------------------------------------
// High jump event normalizer
//
// XLSX structure (e.g. "Yüksek Erkek" sheet):
//   Row 0-1 : Competition title header
//   Row 2   : Race name (col 2)
//   Row 3   : Category (col 2)
//   Row 4   : Column headers:
//             SIRA NO | GÖĞÜS NO | DOĞUM TARİHİ | ADI VE SOYADI | TAKIMI |
//             1.45 | "" | "" | 1.50 | "" | "" | ... | Sonuç | Sıra
//             Each height occupies exactly 3 columns (one per attempt).
//   Row 5+  : Athlete data rows
// ---------------------------------------------------------------------------

import type {
  HighJumpHeight,
  HighJumpAthleteResult,
  NormalizedHighJumpEvent,
  EventStatus,
  ScheduleEntry,
} from "./types";
import type { SheetRow } from "./googleSheets";

const META_COLS = 5; // SIRA NO, GÖĞÜS NO, DOĞUM TARİHİ, ADI VE SOYADI, TAKIMI

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

export function parseHighJumpSheet(rows: SheetRow[]): {
  heights: string[];
  results: HighJumpAthleteResult[];
} {
  const headerRow = rows[4] ?? [];

  // Read height labels from row 4: non-empty numeric-looking values at col 5+ every 3 cols
  const heights: string[] = [];
  const heightStartCols: number[] = [];
  let sonucCol = -1;
  let siraCol = -1;

  for (let col = META_COLS; col < headerRow.length; col++) {
    const cell = String(headerRow[col] ?? "").trim();
    if (!cell) continue;
    if (/^\d+[.,]\d+$/.test(cell)) {
      heights.push(cell.replace(",", "."));
      heightStartCols.push(col);
    } else {
      const lower = cell.toLowerCase().normalize("NFC");
      if (lower.includes("sonu")) {
        sonucCol = col;
      } else if (lower.startsWith("s") && lower.includes("ra")) {
        siraCol = col;
      }
    }
  }

  // Derive sonucCol / siraCol if not found from headers
  if (sonucCol === -1 && heightStartCols.length > 0) {
    sonucCol = heightStartCols[heightStartCols.length - 1] + 3;
  }
  if (siraCol === -1 && sonucCol !== -1) {
    siraCol = sonucCol + 1;
  }

  const results: HighJumpAthleteResult[] = [];

  for (let ri = 5; ri < rows.length; ri++) {
    const row = rows[ri];
    if (!row || row.length === 0) continue;

    const athleteName = String(row[3] ?? "").trim();
    if (!athleteName) continue;

    // Skip footer/official rows (Müsabaka Direktörü, Hakem, etc.)
    const nameLower = athleteName.toLowerCase();
    if (
      nameLower.includes("direktör") ||
      nameLower.includes("hakem") ||
      nameLower.includes("sekreter") ||
      nameLower.includes("lider") ||
      nameLower.includes("müsabaka")
    )
      continue;

    const entryOrder = String(row[0] ?? "").trim();
    const bib = String(row[1] ?? "").trim();
    const team = String(row[4] ?? "").trim();

    const heightResults: HighJumpHeight[] = heights.map((h, i) => {
      const startCol = heightStartCols[i];
      return {
        height: h,
        attempts: [
          String(row[startCol] ?? "").trim(),
          String(row[startCol + 1] ?? "").trim(),
          String(row[startCol + 2] ?? "").trim(),
        ],
      };
    });

    const best = sonucCol >= 0 ? String(row[sonucCol] ?? "").trim() : "";
    const rank = siraCol >= 0 ? String(row[siraCol] ?? "").trim() : "";

    results.push({ rank, entryOrder, bib, athleteName, team, heights: heightResults, best });
  }

  return { heights, results };
}

// ---------------------------------------------------------------------------
// Status derivation
// ---------------------------------------------------------------------------

function deriveStatus(results: HighJumpAthleteResult[]): EventStatus {
  if (results.length === 0) return "Yaklaşan";
  if (results.some((r) => r.rank !== "")) return "Sonuçlandı";
  if (results.some((r) => r.heights.some((h) => h.attempts.some((a) => a !== ""))))
    return "Sonuç bekleniyor";
  return "Yaklaşan";
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function normalizeHighJumpEvent(
  entry: ScheduleEntry,
  rows: SheetRow[]
): NormalizedHighJumpEvent {
  const { heights, results } = parseHighJumpSheet(rows);
  return {
    slug: entry.slug,
    title: entry.title,
    day: entry.day,
    scheduledTime: entry.scheduledTime,
    round: entry.round,
    category: entry.category,
    status: deriveStatus(results),
    heights,
    results,
  };
}

export function getMockHighJumpEvent(entry: ScheduleEntry): NormalizedHighJumpEvent {
  return {
    slug: entry.slug,
    title: entry.title,
    day: entry.day,
    scheduledTime: entry.scheduledTime,
    round: entry.round,
    category: entry.category,
    status: "Yaklaşan",
    heights: [],
    results: [],
  };
}
