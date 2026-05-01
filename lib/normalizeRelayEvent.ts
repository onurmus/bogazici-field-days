// ---------------------------------------------------------------------------
// Relay event XLSX parser
//
// Sheet layout (same file, different sheets per gender/category):
//   Row 0-1 : file header / empty
//   Row 2   : "Yarışma :" | "4x100 METRE"
//   Row 3   : "Kategori :" | "ERKEKLER"
//   Row 4   : "START LİSTESİ" | … | "SONUÇ LİSTESİ"
//   Row 5   : "1.SERİ" (first heat label in col 0)
//   Row 6   : Column headers for left (start list) and right (results)
//   Row 7+  : Data rows (may interleave heat-2 header, etc.)
//
// Left side (cols 0–6): per-heat start list
//   0 = Kulvar No, 1 = Göğüs No, 3 = Adı ve Soyadı, 4 = Takımı, 5 = Derece, 6 = Seri Geliş
//
// Right side (cols 8–15): SONUÇ LİSTESİ (sequential, independent of heats)
//   8 = Sıra No, 9 = Göğüs No, 11 = Adı ve Soyadı, 12 = Takımı,
//   13 = Derece, 14 = Sıralama, 15 = PUAN
// ---------------------------------------------------------------------------

import type {
  ScheduleEntry,
  NormalizedRelayEvent,
  RelayTeamResult,
  RelayHeat,
  RelayHeatEntry,
  EventStatus,
} from "./types";

// Right-side column indices
const R_RANK = 8;
const R_BIB = 9;
const R_TEAM = 12;
const R_TIME = 13;
const R_PLACING = 14;
const R_POINTS = 15;

// Left-side column indices
const L_LANE = 0;
const L_BIB = 1;
const L_TEAM = 4;

type Row = (string | number | null | undefined)[];

function str(v: unknown): string {
  return String(v ?? "").trim();
}

export function parseRelaySheet(rows: unknown[][]): {
  results: RelayTeamResult[];
  heats: RelayHeat[];
} {
  const results: RelayTeamResult[] = [];
  const heats: RelayHeat[] = [];
  let currentHeat: RelayHeat | null = null;

  // Data rows start at row 5 (first heat label), row 6 is headers
  for (let i = 5; i < rows.length; i++) {
    const row = rows[i] as Row;
    const cell0 = str(row[L_LANE]);

    // Detect heat divider rows: "1.SERİ", "2.SERİ", etc.
    if (/^\d+\.\s*(SER[İI]|SERI)$/i.test(cell0)) {
      currentHeat = { name: cell0, entries: [] };
      heats.push(currentHeat);
      continue;
    }

    // Skip column-header repeat rows
    if (/kulvar/i.test(cell0)) continue;

    // Left side: lane entries (col 0 is a lane number)
    if (/^\d+$/.test(cell0) && currentHeat) {
      const teamName = str(row[L_TEAM]);
      if (teamName) {
        const entry: RelayHeatEntry = {
          lane: cell0,
          bib: str(row[L_BIB]),
          teamName,
        };
        currentHeat.entries.push(entry);
      }
    }

    // Right side: result entry (col 8 is a numeric rank)
    const rank = str(row[R_RANK]);
    if (/^\d+$/.test(rank)) {
      results.push({
        rank,
        bib: str(row[R_BIB]),
        teamName: str(row[R_TEAM]),
        time: str(row[R_TIME]),
        placing: str(row[R_PLACING]),
        points: str(row[R_POINTS]),
      });
    }
  }

  return { results, heats };
}

function deriveStatus(
  results: RelayTeamResult[],
  heats: RelayHeat[]
): EventStatus {
  if (results.some((r) => r.time)) return "Sonuçlandı";
  const hasEntries = heats.some((h) => h.entries.some((e) => e.teamName));
  if (hasEntries) return "Seriler hazır";
  return "Yaklaşan";
}

export function normalizeRelayEvent(
  entry: ScheduleEntry,
  rows: unknown[][]
): NormalizedRelayEvent {
  const { results, heats } = parseRelaySheet(rows);
  return {
    slug: entry.slug,
    title: entry.title,
    day: entry.day,
    scheduledTime: entry.scheduledTime,
    round: entry.round,
    category: entry.category,
    status: deriveStatus(results, heats),
    results,
    heats,
  };
}

export function getMockRelayEvent(entry: ScheduleEntry): NormalizedRelayEvent {
  return {
    slug: entry.slug,
    title: entry.title,
    day: entry.day,
    scheduledTime: entry.scheduledTime,
    round: entry.round,
    category: entry.category,
    status: "Yaklaşan",
    results: [],
    heats: [],
  };
}
