// ---------------------------------------------------------------------------
// Event normalizer for XLSX-based event files
//
// XLSX structure (e.g. "100m Erkek Seçme" sheet):
//   Row 0   : Competition title header
//   Row 2   : Race name (col 2)
//   Row 3   : Category (col 2)
//   Row 4   : "1. SERİ" (col 0) + "6.SERİ" (col 8)  ← heat-pair header
//   Row 5   : Column headers (Kulvar No, Göğüs No, Doğum Tarihi, Name, Team,
//             Derece, Seri Geliş) — repeated for right heat at col 8
//   Row 6+  : Athlete data (same layout as col headers)
//   …repeated for each heat pair (2. SERİ / 7.SERİ etc.)
//
// Columns within each 7-column block (left at offset 0, right at offset 8):
//   +0 : Kulvar No  (lane)
//   +1 : Göğüs No  (bib)
//   +2 : Doğum Tarihi (birth date — not displayed)
//   +3 : Adı ve Soyadı (athlete name)
//   +4 : Takımı / Tasnif Statüsü (team)
//   +5 : Derece (result)
//   +6 : Seri Geliş (heat rank)
// ---------------------------------------------------------------------------

import type { Athlete, Heat, NormalizedEvent, EventStatus, ResultNote, ScheduleEntry } from "./types";
import type { SheetRow } from "./googleSheets";

// ---------------------------------------------------------------------------
// XLSX heat-sheet parser
// ---------------------------------------------------------------------------

const LEFT_OFFSET = 0;
const RIGHT_OFFSET = 8;

/**
 * Parses a "Seçme" (qualifying heats) XLSX sheet and returns a sorted array
 * of Heat objects, one per heat.
 *
 * Heats are laid out in pairs side-by-side (left/right).
 * A heat-pair block starts with a row whose col-0 matches "X. SERİ".
 */
export function parseXlsxSeçmeSheet(rows: SheetRow[]): Heat[] {
  const heats: Heat[] = [];

  // Find every row that starts a heat pair (col 0 = "X. SERİ" or "X.SERİ")
  const blockStarts: number[] = [];
  rows.forEach((row, i) => {
    const cell = String(row[LEFT_OFFSET] ?? "").trim();
    if (/^\d+\.?\s*SERİ$/i.test(cell)) blockStarts.push(i);
  });

  blockStarts.forEach((start, blockIdx) => {
    const end = blockStarts[blockIdx + 1] ?? rows.length;
    const pairHeaderRow = rows[start];

    // Extract heat numbers from the pair header
    const leftLabel = String(pairHeaderRow[LEFT_OFFSET] ?? "").trim();
    const leftNum = parseInt(leftLabel.match(/\d+/)?.[0] ?? "0", 10);

    const rightLabel = String(pairHeaderRow[RIGHT_OFFSET] ?? "").trim();
    const rightMatch = rightLabel.match(/\d+/);
    const rightNum = rightMatch ? parseInt(rightMatch[0], 10) : 0;

    // Athletes occupy rows from start+2 onward (skip pair header + col headers)
    const athleteRows = rows.slice(start + 2, end);

    // Left heat
    const leftAthletes = extractAthletes(athleteRows, LEFT_OFFSET);
    if (leftNum > 0 && leftAthletes.length > 0) {
      heats.push({ heat: leftNum, athletes: leftAthletes });
    }

    // Right heat
    if (rightNum > 0) {
      const rightAthletes = extractAthletes(athleteRows, RIGHT_OFFSET);
      if (rightAthletes.length > 0) {
        heats.push({ heat: rightNum, athletes: rightAthletes });
      }
    }
  });

  // Return heats in ascending order
  return heats.sort((a, b) => a.heat - b.heat);
}

function extractAthletes(rows: SheetRow[], offset: number): Athlete[] {
  return rows
    .filter((row) => {
      const lane = String(row[offset] ?? "").trim();
      return lane !== "" && !isNaN(Number(lane));
    })
    .filter((row) => String(row[offset + 3] ?? "").trim() !== "") // must have a name
    .map((row) => ({
      lane: String(row[offset]).trim(),
      bib: String(row[offset + 1] ?? "").trim(),
      athleteName: String(row[offset + 3] ?? "").trim(),
      team: String(row[offset + 4] ?? "").trim(),
      result: String(row[offset + 5] ?? "").trim(),
      rank: String(row[offset + 6] ?? "").trim(),
      note: "" as ResultNote,
    }));
}

// ---------------------------------------------------------------------------
// NormalizedEvent builder
// ---------------------------------------------------------------------------

/**
 * Builds a NormalizedEvent from a live ScheduleEntry (metadata) + raw XLSX rows (heats).
 * All metadata comes from the schedule — nothing is hardcoded.
 */
export function normalizeEventFromXlsx(
  entry: ScheduleEntry,
  heatsRows: SheetRow[]
): NormalizedEvent {
  const heats = parseXlsxSeçmeSheet(heatsRows);
  const status = deriveEventStatus(heats);
  return {
    slug: entry.slug,
    title: entry.title,
    day: entry.day,
    scheduledTime: entry.scheduledTime,
    round: entry.round,
    category: entry.category,
    status,
    heats,
  };
}

// ---------------------------------------------------------------------------
// Status derivation
// ---------------------------------------------------------------------------

/**
 * Derives the display status of an event based on athlete result data.
 */
export function deriveEventStatus(heats: Heat[]): EventStatus {
  const allAthletes = heats.flatMap((h) => h.athletes);
  if (allAthletes.length === 0) return "Yaklaşan";

  const scoringAthletes = allAthletes.filter(
    (a) => !["DNS", "DNF", "DQ"].includes(a.note)
  );
  const hasAnyResult = allAthletes.some((a) => a.result !== "");
  const allHaveResults = scoringAthletes.every((a) => a.result !== "");

  if (scoringAthletes.length > 0 && allHaveResults) return "Sonuçlandı";
  if (hasAnyResult) return "Sonuç bekleniyor";
  return "Seriler hazır";
}

// ---------------------------------------------------------------------------
// Mock fallback (used when Drive is unavailable)
// ---------------------------------------------------------------------------

export function getMockEvent(entry: ScheduleEntry): NormalizedEvent {
  return {
    slug: entry.slug,
    title: entry.title,
    day: entry.day,
    scheduledTime: entry.scheduledTime,
    round: entry.round,
    category: entry.category,
    status: "Seriler hazır",
    heats: [
      {
        heat: 1,
        athletes: [
          { lane: "1", bib: "101", athleteName: "Sporcu Adı", team: "Üniversite", result: "", rank: "", note: "" },
          { lane: "2", bib: "102", athleteName: "Sporcu Adı", team: "Üniversite", result: "", rank: "", note: "" },
        ],
      },
    ],
  };
}
