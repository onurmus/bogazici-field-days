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
