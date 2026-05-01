// ---------------------------------------------------------------------------
// Event normalizer
//
// Converts raw Google Sheets rows (SheetRow[][]) into a NormalizedEvent.
//
// Column convention (0-based index within a heat range):
//   0 → lane
//   1 → bib
//   2 → athleteName
//   3 → team
//   4 → result
//   5 → note
//
// Rank is computed server-side by sorting on result after normalization.
// ---------------------------------------------------------------------------

import type { Athlete, Heat, NormalizedEvent, EventStatus } from "./types";
import type { EventConfig } from "./eventConfig";
import type { SheetRow } from "./googleSheets";

/**
 * Normalizes raw sheet data for a single heat into a Heat object.
 *
 * @param heatNumber  1-based heat index.
 * @param rows        Raw rows from Google Sheets for this heat's range.
 */
export function normalizeHeat(heatNumber: number, rows: SheetRow[]): Heat {
  const athletes: Athlete[] = rows
    .filter((row) => row.length > 0 && row[0]?.trim() !== "")
    .map((row) => ({
      lane: row[0] ?? "",
      bib: row[1] ?? "",
      athleteName: row[2] ?? "",
      team: row[3] ?? "",
      result: row[4] ?? "",
      rank: "", // computed below
      note: row[5] ?? "",
    }));

  // Assign ranks based on result value (lower = better for track, higher = better for field)
  // TODO: Adjust sorting direction per discipline (track: ascending, field: descending)
  const ranked = assignRanks(athletes);

  return {
    heat: heatNumber,
    athletes: ranked,
  };
}

/**
 * Assigns rank strings to athletes based on their result values.
 * Athletes with empty or non-numeric results (DNS, DNF, DQ) are ranked last.
 */
function assignRanks(athletes: Athlete[]): Athlete[] {
  const withResult = athletes.filter(
    (a) => a.result !== "" && isNumericResult(a.result)
  );
  const withoutResult = athletes.filter(
    (a) => a.result === "" || !isNumericResult(a.result)
  );

  // Sort ascending (track events) — field events will need descending
  withResult.sort((a, b) => parseResult(a.result) - parseResult(b.result));

  return [
    ...withResult.map((a, i) => ({ ...a, rank: String(i + 1) })),
    ...withoutResult.map((a) => ({ ...a, rank: "" })),
  ];
}

function isNumericResult(result: string): boolean {
  return !isNaN(parseFloat(result.replace(",", ".")));
}

function parseResult(result: string): number {
  return parseFloat(result.replace(",", "."));
}

/**
 * Determines the display status of an event based on its heats data.
 */
export function deriveEventStatus(heats: Heat[]): EventStatus {
  const allAthletes = heats.flatMap((h) => h.athletes);
  if (allAthletes.length === 0) return "Yaklaşan";

  const hasResults = allAthletes.some((a) => a.result !== "");
  const allHaveResults = allAthletes
    .filter((a) => !["DNS", "DNF", "DQ"].includes(a.note))
    .every((a) => a.result !== "");

  if (allHaveResults) return "Sonuçlandı";
  if (hasResults) return "Sonuç bekleniyor";
  return "Seriler hazır";
}

/**
 * Assembles a fully normalized event from a config and per-heat raw rows.
 *
 * @param config  The event's static configuration.
 * @param heatRows  Array of raw row sets, one per heat, in config order.
 */
export function normalizeEvent(
  config: EventConfig,
  heatRows: SheetRow[][]
): NormalizedEvent {
  const heats: Heat[] = config.heats.map((heatCfg, i) =>
    normalizeHeat(heatCfg.heat, heatRows[i] ?? [])
  );

  return {
    slug: config.slug,
    title: config.title,
    day: config.day,
    scheduledTime: config.scheduledTime,
    round: config.round,
    category: config.category,
    status: deriveEventStatus(heats),
    heats,
  };
}

// ---------------------------------------------------------------------------
// Mock data factory — used until Google Sheets is connected
// ---------------------------------------------------------------------------

export function getMockEvent(config: EventConfig): NormalizedEvent {
  const mockAthletes: Athlete[] = [
    { lane: "1", bib: "101", athleteName: "Ahmet Yılmaz", team: "Boğaziçi Üniversitesi", result: "11.23", rank: "2", note: "" },
    { lane: "2", bib: "102", athleteName: "Mehmet Demir", team: "İTÜ", result: "10.94", rank: "1", note: "Q" },
    { lane: "3", bib: "103", athleteName: "Ali Kaya", team: "ODTÜ", result: "11.45", rank: "3", note: "" },
    { lane: "4", bib: "104", athleteName: "Hasan Çelik", team: "Bilkent", result: "", rank: "", note: "DNS" },
  ];

  const heats: Heat[] = config.heats.map((heatCfg, i) => ({
    heat: heatCfg.heat,
    athletes: mockAthletes.map((a) => ({ ...a, lane: String(i * 4 + parseInt(a.lane)) })),
  }));

  return {
    slug: config.slug,
    title: config.title,
    day: config.day,
    scheduledTime: config.scheduledTime,
    round: config.round,
    category: config.category,
    status: "Seriler hazır",
    heats,
  };
}
