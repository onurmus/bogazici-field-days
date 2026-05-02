// ---------------------------------------------------------------------------
// Core domain types for Boğaziçi Üniversitesi Atletizm Günleri
// ---------------------------------------------------------------------------

/** Status values displayed to the user (in Turkish) */
export type EventStatus =
  | "Yaklaşan"
  | "Seriler hazır"
  | "Sonuç bekleniyor"
  | "Sonuçlandı";

/** Special result notations used in athletics */
export type ResultNote = "Q" | "q" | "PB" | "DNS" | "DNF" | "DQ" | string;

/** A single athlete entry within a heat */
export interface Athlete {
  lane: string;
  bib: string;
  athleteName: string;
  team: string;
  result: string;
  rank: string;
  note: ResultNote;
}

/** A single heat/series within an event */
export interface Heat {
  heat: number;
  /** Optional display label — e.g. "Final A", "Final B". Shown instead of "N. Seri" when present. */
  label?: string;
  scheduledTime?: string;
  athletes: Athlete[];
}

/** A normalized event as returned from the API */
export interface NormalizedEvent {
  slug: string;
  title: string;
  day: 1 | 2;
  scheduledTime: string;
  round: string;
  category: string;
  status: EventStatus;
  heats: Heat[];
}

/** A single attempt in a field event (jump or throw) */
export interface FieldAttempt {
  /** Distance string: "7.88", "X", or "" (not yet attempted) */
  value: string;
  /** Wind reading — only present for jump events */
  wind?: string;
}

/** A single athlete's result row in a field event */
export interface FieldAthleteResult {
  rank: string;        // final ranking ("1", "2"…) — may be "" before results
  entryOrder: string;  // start-list order (SIRA NO)
  bib: string;
  athleteName: string;
  team: string;
  attempts: FieldAttempt[];
  best: string;        // best valid distance (SONUÇ col)
  bestWind?: string;   // wind for best jump (RÜZGAR col, jumps only)
}

/** One height group in a high jump result */
export interface HighJumpHeight {
  /** e.g. "1.45", "1.80" */
  height: string;
  /** Up to 3 attempt values: "O", "X", "-", or "" (not attempted) */
  attempts: string[];
}

/** A single athlete's result row in a high jump event */
export interface HighJumpAthleteResult {
  rank: string;
  entryOrder: string;
  bib: string;
  athleteName: string;
  team: string;
  heights: HighJumpHeight[];
  /** Best cleared height from the Sonuç column */
  best: string;
}

/** A normalized high jump event */
export interface NormalizedHighJumpEvent {
  slug: string;
  title: string;
  day: 1 | 2;
  scheduledTime: string;
  round: string;
  category: string;
  status: EventStatus;
  /** Ordered list of all height labels from the sheet */
  heights: string[];
  results: HighJumpAthleteResult[];
}

/** A normalized field event (jumps + throws) */
export interface NormalizedFieldEvent {
  slug: string;
  title: string;
  day: 1 | 2;
  scheduledTime: string;
  round: string;
  category: string;
  status: EventStatus;
  /** true = long/triple jump → show wind; false = throws */
  isJump: boolean;
  attemptCount: number;
  results: FieldAthleteResult[];
}

/** A single team's entry in a relay result list */
export interface RelayTeamResult {
  rank: string;      // overall finish rank ("1", "2"…) — "" before results
  bib: string;       // Göğüs No
  teamName: string;  // Takımı
  time: string;      // Derece
  placing: string;   // Sıralama column
  points: string;    // PUAN column
}

/** A single lane entry in a relay start-list heat */
export interface RelayHeatEntry {
  lane: string;
  /** Comma-joined bib numbers (legacy / compat) */
  bib: string;
  teamName: string;
  /** Individual runners in leg order */
  runners: { bib: string; name: string }[];
  /** Derece — finish time for this team */
  result: string;
  /** Seri Geliş — rank within the heat */
  heatRank: string;
}

/** One heat in a relay start list */
export interface RelayHeat {
  name: string;           // "1.SERİ", "2.SERİ" etc.
  entries: RelayHeatEntry[];
}

/** A normalized relay event (4×100, 4×400) */
export interface NormalizedRelayEvent {
  slug: string;
  title: string;
  day: 1 | 2;
  scheduledTime: string;
  round: string;
  category: string;
  status: EventStatus;
  results: RelayTeamResult[];
  heats: RelayHeat[];
}

/** A lightweight event summary used on the schedule/home page */
export interface ScheduleEntry {
  slug: string;
  title: string;
  day: 1 | 2;
  scheduledTime: string;
  round: string;
  category: string;
  status: EventStatus;
  heatCount: number;
}
