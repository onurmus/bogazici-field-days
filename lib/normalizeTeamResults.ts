// ---------------------------------------------------------------------------
// Team results XLSX normalizer
//
// File format (4 files: Erkekler/Kadınlar × 1. Gün/2. Gün):
//   Row 0   : File/competition title (ignored)
//   Row 1   : Column headers:
//             col 0 = "Üniversite" (team name)
//             Then repeating triplets per event branch: Sporcu | Derece | Puan
//             Last col = "Toplam" (total points)
//   Row 2+  : Data rows — one row per team
// ---------------------------------------------------------------------------

import type { SheetRow } from "./googleSheets";

export type TeamGender = "erkek" | "kadin";
export type TeamDay = 1 | 2;

export interface TeamBranchEntry {
  branch: string;
  sporcu: string;
  derece: string;
  puan: number;
}

export interface TeamResultRow {
  team: string;
  day: TeamDay;
  gender: TeamGender;
  branches: TeamBranchEntry[];
  total: number;
}

/** Aggregated standing across selected day/gender filters */
export interface TeamStanding {
  rank: number;
  team: string;
  total: number;
  /** Breakdown only included when a single day+gender is selected */
  branches?: TeamBranchEntry[];
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

function toNum(v: unknown): number {
  const n = parseFloat(String(v ?? "").replace(",", ".").trim());
  return isNaN(n) ? 0 : n;
}

function str(v: unknown): string {
  return String(v ?? "").trim();
}

/**
 * Detect the header row index.
 * Actual format: col 0 = rank label (SIRA/Sıra), col 1 = team label
 * (ÜNİVERSİTE / OKUL / İli-Okulu etc.)
 */
function findHeaderRow(rows: SheetRow[]): number {
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const col0 = str(rows[i][0]).toLowerCase().replace(/\s+/g, "");
    const col1 = str(rows[i][1]).toLowerCase();
    const isRankCol = col0 === "sıra" || col0 === "sira" || col0 === "no" || col0 === "s.no";
    const isTeamCol =
      col1.includes("niversite") ||
      col1.includes("okul") ||
      col1.includes("ili") ||
      col1.includes("tak");
    if (isRankCol && isTeamCol) return i;
  }
  return 1; // fallback
}

export function parseTeamResultsSheet(
  rows: SheetRow[],
  day: TeamDay,
  gender: TeamGender,
): TeamResultRow[] {
  if (rows.length < 2) return [];

  const headerIdx = findHeaderRow(rows);
  const headerRow = rows[headerIdx];

  // Find total column: last column whose header contains "puan" or "toplam".
  // Day-1 files end with "1. Gün Puan"; Day-2 files end with "Toplam Puan".
  let totalCol = -1;
  for (let col = headerRow.length - 1; col >= 0; col--) {
    const h = str(headerRow[col]).toLowerCase();
    if (h.includes("puan") || h.includes("toplam")) {
      totalCol = col;
      break;
    }
  }
  if (totalCol === -1) totalCol = headerRow.length - 1;

  // Some files have a sub-header row immediately after the main header
  // (e.g. Erkekler 1. Gün has DERECE/PUAN labels in row 2). Skip it.
  let dataStartIdx = headerIdx + 1;
  if (dataStartIdx < rows.length) {
    const nextRow = rows[dataStartIdx];
    const hasSubHeader = nextRow.some((cell) => {
      const s = str(cell).toLowerCase();
      return s === "derece" || s === "puan";
    });
    if (hasSubHeader) dataStartIdx++;
  }

  const results: TeamResultRow[] = [];

  for (let ri = dataStartIdx; ri < rows.length; ri++) {
    const row = rows[ri];
    if (!row || row.length === 0) continue;

    // Team name is always in col 1 (col 0 = rank number)
    const team = str(row[1]);
    if (!team) continue;

    // Skip rows that look like repeated headers or footers
    const teamLower = team.toLowerCase();
    if (
      teamLower.includes("niversite") ||
      teamLower === "okul" ||
      teamLower.includes("ili-okulu") ||
      teamLower === "toplam" ||
      teamLower === "total"
    ) continue;

    const total = toNum(row[totalCol]);
    if (total === 0) continue; // skip teams with no points

    results.push({ team, day, gender, branches: [], total });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

export type DayFilter = "all" | 1 | 2;
export type GenderFilter = "all" | "erkek" | "kadin";

/**
 * Aggregates raw team result rows into a ranked standings list, applying
 * optional day and gender filters.
 */
export function buildTeamStandings(
  rows: TeamResultRow[],
  dayFilter: DayFilter = "all",
  genderFilter: GenderFilter = "all",
): TeamStanding[] {
  const filtered = rows.filter((r) => {
    if (dayFilter !== "all" && r.day !== dayFilter) return false;
    if (genderFilter !== "all" && r.gender !== genderFilter) return false;
    return true;
  });

  // Sum totals per team
  const totals = new Map<string, number>();
  for (const r of filtered) {
    totals.set(r.team, (totals.get(r.team) ?? 0) + r.total);
  }

  const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);

  return sorted.map(([team, total], idx) => ({
    rank: idx + 1,
    team,
    total,
  }));
}

// ---------------------------------------------------------------------------
// File name → day + gender mapping
// ---------------------------------------------------------------------------

export function parseFileMetadata(filename: string): { day: TeamDay; gender: TeamGender } | null {
  const base = filename.replace(/\.xlsx$/i, "").toLowerCase();
  const day: TeamDay = base.includes("2") ? 2 : 1;
  const gender: TeamGender = base.includes("kad") ? "kadin" : "erkek";
  return { day, gender };
}
