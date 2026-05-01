// ---------------------------------------------------------------------------
// Field event normalizer — for jumps (long jump, triple jump) and throws
// (shot put, javelin, discus).
//
// XLSX structure (e.g. "Gülle Erkek" sheet):
//   Row 0-1 : Competition title header
//   Row 2   : Race name (col 2)
//   Row 3   : Category (col 2)
//   Row 4   : Column headers:
//             SIRA NO | GÖĞÜS NO | DOĞUM TARİHİ | ADI VE SOYADI | TAKIMI |
//             ATMALAR [span] | SONUÇ | [RÜZGAR — jumps only] | SIRALAMA | PUAN
//   Row 5   : Attempt sub-headers: blank×5, then "1","2","3","4"…
//   Row 6+  : Athlete data rows
//
// For throws: SONUÇ at col ATTEMPT_START + N, SIRALAMA next, PUAN next.
// For jumps : same but RÜZGAR column between SONUÇ and SIRALAMA.
// ---------------------------------------------------------------------------

import type {
  FieldAttempt,
  FieldAthleteResult,
  NormalizedFieldEvent,
  EventStatus,
  ScheduleEntry,
} from "./types";
import type { SheetRow } from "./googleSheets";

const ATTEMPT_START_COL = 5;

/** Check whether row 4 contains a "RÜZGAR" header → jump event */
function detectIsJump(rows: SheetRow[]): boolean {
  const header = rows[4] ?? [];
  return header.some(
    (cell) => typeof cell === "string" && cell.toUpperCase().includes("RÜZGAR")
  );
}

/** Count attempt columns by reading numeric sub-headers in row 5 */
function detectAttemptCount(rows: SheetRow[]): number {
  const sub = rows[5] ?? [];
  let count = 0;
  for (let i = ATTEMPT_START_COL; i < sub.length; i++) {
    const v = String(sub[i] ?? "").trim();
    if (/^\d+$/.test(v)) count++;
    else if (count > 0) break;
  }
  return count > 0 ? count : 4;
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

export function parseFieldEventSheet(rows: SheetRow[]): {
  results: FieldAthleteResult[];
  isJump: boolean;
  attemptCount: number;
} {
  const isJump = detectIsJump(rows);
  const attemptCount = detectAttemptCount(rows);

  const sonucCol = ATTEMPT_START_COL + attemptCount;
  const rüzgarCol = isJump ? sonucCol + 1 : -1;
  const siralamaCol = isJump ? sonucCol + 2 : sonucCol + 1;

  const results: FieldAthleteResult[] = [];

  for (let ri = 6; ri < rows.length; ri++) {
    const row = rows[ri];
    if (!row || row.length === 0) continue;

    const entryOrder = String(row[0] ?? "").trim();
    const bib = String(row[1] ?? "").trim();
    const athleteName = String(row[3] ?? "").trim();
    const team = String(row[4] ?? "").trim();

    // Skip empty / separator rows
    if (!athleteName) continue;

    const attempts: FieldAttempt[] = [];
    for (let ai = 0; ai < attemptCount; ai++) {
      const val = String(row[ATTEMPT_START_COL + ai] ?? "").trim();
      attempts.push({ value: val });
    }

    const best = String(row[sonucCol] ?? "").trim();
    const bestWind =
      isJump && rüzgarCol >= 0
        ? String(row[rüzgarCol] ?? "").trim() || undefined
        : undefined;
    const rank = String(row[siralamaCol] ?? "").trim();

    results.push({
      rank,
      entryOrder,
      bib,
      athleteName,
      team,
      attempts,
      best,
      bestWind,
    });
  }

  return { results, isJump, attemptCount };
}

// ---------------------------------------------------------------------------
// Status derivation
// ---------------------------------------------------------------------------

function deriveFieldEventStatus(results: FieldAthleteResult[]): EventStatus {
  if (results.length === 0) return "Yaklaşan";
  const hasRanking = results.some((r) => r.rank !== "");
  if (hasRanking) return "Sonuçlandı";
  const hasAnyAttempt = results.some((r) =>
    r.attempts.some((a) => a.value !== "")
  );
  if (hasAnyAttempt) return "Sonuç bekleniyor";
  return "Yaklaşan";
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function normalizeFieldEvent(
  entry: ScheduleEntry,
  rows: SheetRow[]
): NormalizedFieldEvent {
  const { results, isJump, attemptCount } = parseFieldEventSheet(rows);
  return {
    slug: entry.slug,
    title: entry.title,
    day: entry.day,
    scheduledTime: entry.scheduledTime,
    round: entry.round,
    category: entry.category,
    status: deriveFieldEventStatus(results),
    isJump,
    attemptCount,
    results,
  };
}

export function getMockFieldEvent(entry: ScheduleEntry): NormalizedFieldEvent {
  return {
    slug: entry.slug,
    title: entry.title,
    day: entry.day,
    scheduledTime: entry.scheduledTime,
    round: entry.round,
    category: entry.category,
    status: "Yaklaşan",
    isJump: false,
    attemptCount: 4,
    results: [],
  };
}
