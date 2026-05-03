// ---------------------------------------------------------------------------
// Athlete index builder — server-only
//
// Reads all event XLSX files from both Drive folders and aggregates each
// athlete's registered events into a single searchable index.
//
// This module does NOT modify any existing event-management logic; it only
// reads the same data sources that the event detail pages already use.
// ---------------------------------------------------------------------------

import { fetchXlsxSheet, fetchXlsxSheetNames, listDriveFolder } from "./googleSheets";
import {
  normalizeScheduleRows,
  SCHEDULE_FILE_ID,
  DAY1_SHEET_NAME,
  DAY2_SHEET_NAME,
} from "./normalizeSchedule";
import {
  DAY1_FOLDER_ID,
  DAY2_FOLDER_ID,
  getDriveFileBase,
  getDay2DriveFileBase,
  resolveCompositeEventBase,
  getCategoryKey,
  GENDER_KEYWORDS,
  FIELD_EVENT_BASES,
  RELAY_EVENT_BASES,
  HIGH_JUMP_EVENT_BASES,
} from "./eventConfig";
import {
  parseXlsxSeçmeSheet,
  parseXlsxFinalSheet,
  deriveEventStatus,
} from "./normalizeEvent";
import { parseFieldEventSheet } from "./normalizeFieldEvent";
import { parseHighJumpSheet } from "./normalizeHighJumpEvent";
import { parseRelaySheet } from "./normalizeRelayEvent";
import type { ScheduleEntry, EventStatus } from "./types";
import type { SheetRow } from "./googleSheets";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface AthleteEventEntry {
  slug: string;
  title: string;
  day: 1 | 2;
  scheduledTime: string;
  /** Human-readable heat/lane summary, e.g. "Seri: 1, Kulvar: 4" */
  heatInfo: string;
  /** Athlete's personal result or best mark */
  result: string;
  status: EventStatus;
}

export interface AthleteIndexEntry {
  bib: string;
  name: string;
  team: string;
  events: AthleteEventEntry[];
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

const nfc = (s: string) => s.normalize("NFC").toLowerCase();
const shl = (s: string) => s.toLowerCase().normalize("NFC");

/** Mirrors the sheet-selection logic from discoverEvent.ts */
function selectSheetName(
  allSheets: string[],
  genderWords: string[],
  eventType: "track" | "field" | "highjump" | "relay",
  isFinal: boolean,
  isAmator: boolean,
): string | undefined {
  if (isFinal) {
    return (
      allSheets.find(
        (s) =>
          genderWords.some((w) => shl(s).includes(w)) && shl(s).includes("final"),
      ) ?? allSheets.find((s) => genderWords.some((w) => shl(s).includes(w)))
    );
  }
  if (eventType === "relay") {
    return allSheets.find((s) => {
      const lower = shl(s);
      const hasGender = genderWords.some((w) => lower.includes(w));
      const sheetIsAmator = lower.includes("amatör") || lower.includes("amator");
      return hasGender && (isAmator ? sheetIsAmator : !sheetIsAmator);
    });
  }
  // track / field / highjump — prefer start-list sheet (seçme), not result sheet
  const primary = allSheets.find((s) => {
    const lower = shl(s);
    return (
      genderWords.some((w) => lower.includes(w)) &&
      (eventType === "track"
        ? lower.includes("seçme") && !lower.includes("sonuç")
        : true)
    );
  });
  if (primary) return primary;
  return allSheets.find((s) => genderWords.some((w) => shl(s).includes(w)));
}

function detectFinalSheet(rows: SheetRow[]): boolean {
  return rows.some((row) => /^Final\s+[A-Z]\b/i.test((row[0] ?? "").trim()));
}

function deriveFieldStatus(
  results: { rank: string; attempts: { value: string }[] }[],
): EventStatus {
  if (results.length === 0) return "Yaklaşan";
  if (results.some((r) => r.rank)) return "Sonuçlandı";
  if (results.some((r) => r.attempts.some((a) => a.value))) return "Sonuç bekleniyor";
  return "Yaklaşan";
}

function deriveRelayStatus(
  heats: { entries: { result: string }[] }[],
): EventStatus {
  for (const heat of heats) {
    for (const e of heat.entries) {
      if (e.result) return "Sonuçlandı";
    }
  }
  return "Yaklaşan";
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

interface EventPlan {
  scheduleEntry: ScheduleEntry;
  fileId: string;
  eventType: "track" | "field" | "highjump" | "relay";
  genderWords: string[];
  isFinal: boolean;
  isAmator: boolean;
  isKadinErkek: boolean;
}

export async function buildAthleteIndex(): Promise<AthleteIndexEntry[]> {
  // ── Round 1: fetch schedules + Drive folder listings in parallel ──────────
  const [rows1, rows2, day1Files, day2Files] = await Promise.all([
    fetchXlsxSheet(SCHEDULE_FILE_ID, DAY1_SHEET_NAME),
    fetchXlsxSheet(SCHEDULE_FILE_ID, DAY2_SHEET_NAME),
    listDriveFolder(DAY1_FOLDER_ID),
    listDriveFolder(DAY2_FOLDER_ID),
  ]);

  const day1Entries = normalizeScheduleRows(rows1, 1);
  const day2Entries = normalizeScheduleRows(rows2, 2, "Yaklaşan", 6);

  const day1FileMap = new Map(day1Files.map((f) => [nfc(f.name), f.id]));
  const day2FileMap = new Map(day2Files.map((f) => [nfc(f.name), f.id]));

  // ── Build event plans ─────────────────────────────────────────────────────
  const plans: EventPlan[] = [];

  function makePlan(entry: ScheduleEntry, folderId: string): void {
    const isDay1 = folderId === DAY1_FOLDER_ID;
    const fileMap = isDay1 ? day1FileMap : day2FileMap;
    const resolveBase = isDay1
      ? (n: string) => getDriveFileBase(n) ?? resolveCompositeEventBase(n)
      : (n: string) => getDay2DriveFileBase(n) ?? resolveCompositeEventBase(n);

    const rawEventName = entry.title
      .replace(/\s+(Erkekler|Kadınlar|Karma|Kadın-Erkek)$/i, "")
      .trim();
    const resolvedBase = resolveBase(rawEventName);
    if (!resolvedBase) return;

    const fileId = fileMap.get(nfc(`${resolvedBase}.xlsx`));
    if (!fileId) return;

    const isHighJump = HIGH_JUMP_EVENT_BASES.has(resolvedBase);
    const isField = FIELD_EVENT_BASES.has(resolvedBase);
    const isRelay = RELAY_EVENT_BASES.has(resolvedBase);
    const eventType: EventPlan["eventType"] = isHighJump
      ? "highjump"
      : isField
        ? "field"
        : isRelay
          ? "relay"
          : "track";

    const rawLower = rawEventName.toLowerCase().normalize("NFC");
    const isFinal = rawLower.includes("final");
    const isAmator = rawLower.includes("amatör") || rawLower.includes("amator");
    const isKadinErkek = /kad[iı]n-?erkek/i.test(entry.category);

    const categoryKey = getCategoryKey(entry.category);
    const genderWords = GENDER_KEYWORDS[categoryKey] ?? ["erkek"];

    plans.push({
      scheduleEntry: entry,
      fileId,
      eventType,
      genderWords,
      isFinal,
      isAmator,
      isKadinErkek,
    });
  }

  for (const e of day1Entries) makePlan(e, DAY1_FOLDER_ID);
  for (const e of day2Entries) makePlan(e, DAY2_FOLDER_ID);

  if (plans.length === 0) return [];

  // ── Round 2: fetch sheet names for each unique fileId ─────────────────────
  const uniqueFileIds = [...new Set(plans.map((p) => p.fileId))];
  const sheetNameResults = await Promise.all(
    uniqueFileIds.map((id) => fetchXlsxSheetNames(id)),
  );
  const sheetNamesMap = new Map(
    uniqueFileIds.map((id, i) => [id, sheetNameResults[i]]),
  );

  // ── Select sheets per plan ────────────────────────────────────────────────
  interface PlanWithSheet {
    plan: EventPlan;
    sheetName: string;
  }
  const plansWithSheets: PlanWithSheet[] = [];

  for (const plan of plans) {
    const allSheets = sheetNamesMap.get(plan.fileId) ?? [];
    const sheetName = selectSheetName(
      allSheets,
      plan.genderWords,
      plan.eventType,
      plan.isFinal,
      plan.isAmator,
    );
    if (sheetName) {
      plansWithSheets.push({ plan, sheetName });
    }
    // For mixed-gender events also fetch the Erkek sheet
    if (plan.isKadinErkek) {
      const erkekWords = GENDER_KEYWORDS["erkek"] ?? ["erkek"];
      const erkekSheet =
        allSheets.find(
          (s) =>
            erkekWords.some((w) => shl(s).includes(w)) &&
            shl(s).includes("seçme") &&
            !shl(s).includes("sonuç"),
        ) ?? allSheets.find((s) => erkekWords.some((w) => shl(s).includes(w)));
      if (erkekSheet && erkekSheet !== sheetName) {
        plansWithSheets.push({ plan, sheetName: erkekSheet });
      }
    }
  }

  // ── Round 3: fetch all sheets (deduplicated) ──────────────────────────────
  const downloadKeys = [
    ...new Set(plansWithSheets.map((p) => `${p.plan.fileId}::${p.sheetName}`)),
  ];
  const sheetDataArray = await Promise.all(
    downloadKeys.map((key) => {
      const sep = key.indexOf("::");
      const fileId = key.slice(0, sep);
      const sheetName = key.slice(sep + 2);
      return fetchXlsxSheet(fileId, sheetName);
    }),
  );
  const sheetDataMap = new Map(
    downloadKeys.map((key, i) => [key, sheetDataArray[i]]),
  );

  // ── Build athlete index ───────────────────────────────────────────────────
  const athleteMap = new Map<string, AthleteIndexEntry>();

  function athleteKey(bib: string, name: string, team: string): string {
    return bib.trim() || `${team}::${name}`.toLowerCase().trim();
  }

  function upsert(
    bib: string,
    name: string,
    team: string,
    event: AthleteEventEntry,
  ): void {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const key = athleteKey(bib, trimmedName, team);
    if (!athleteMap.has(key)) {
      athleteMap.set(key, {
        bib: bib.trim(),
        name: trimmedName,
        team: team.trim(),
        events: [],
      });
    }
    const entry = athleteMap.get(key)!;
    if (!entry.bib && bib.trim()) entry.bib = bib.trim();
    if (!entry.team && team.trim()) entry.team = team.trim();
    if (!entry.events.some((e) => e.slug === event.slug)) {
      entry.events.push(event);
    }
  }

  for (const { plan, sheetName } of plansWithSheets) {
    const key = `${plan.fileId}::${sheetName}`;
    const rows = sheetDataMap.get(key);
    if (!rows || rows.length === 0) continue;

    const se = plan.scheduleEntry;
    const base: Omit<AthleteEventEntry, "heatInfo" | "result" | "status"> = {
      slug: se.slug,
      title: se.title,
      day: se.day,
      scheduledTime: se.scheduledTime,
    };

    try {
      if (plan.eventType === "track") {
        const isFinal = detectFinalSheet(rows);
        const heats = isFinal ? parseXlsxFinalSheet(rows) : parseXlsxSeçmeSheet(rows);
        const status = deriveEventStatus(heats);
        for (const heat of heats) {
          const label = heat.label ?? `${heat.heat}. Seri`;
          for (const a of heat.athletes) {
            upsert(a.bib, a.athleteName, a.team, {
              ...base,
              heatInfo: `Seri: ${label}, Kulvar: ${a.lane}`,
              result: a.result,
              status,
            });
          }
        }
      } else if (plan.eventType === "highjump") {
        const { results } = parseHighJumpSheet(rows);
        const status = deriveFieldStatus(
          results.map((r) => ({
            rank: r.rank,
            attempts: r.heights.flatMap((h) =>
              h.attempts.map((a) => ({ value: a })),
            ),
          })),
        );
        for (const r of results) {
          upsert(r.bib, r.athleteName, r.team, {
            ...base,
            heatInfo: "",
            result: r.best,
            status,
          });
        }
      } else if (plan.eventType === "field") {
        const { results } = parseFieldEventSheet(rows);
        const status = deriveFieldStatus(results);
        for (const r of results) {
          upsert(r.bib, r.athleteName, r.team, {
            ...base,
            heatInfo: "",
            result: r.best,
            status,
          });
        }
      } else {
        // relay
        const { heats } = parseRelaySheet(rows);
        const status = deriveRelayStatus(heats);
        for (const heat of heats) {
          for (const entry of heat.entries) {
            for (const runner of entry.runners) {
              upsert(runner.bib, runner.name, entry.teamName, {
                ...base,
                heatInfo: entry.lane ? `Kulvar: ${entry.lane}` : "",
                result: entry.result,
                status,
              });
            }
          }
        }
      }
    } catch {
      // Skip sheets that fail to parse due to unexpected format
    }
  }

  return [...athleteMap.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "tr"),
  );
}
