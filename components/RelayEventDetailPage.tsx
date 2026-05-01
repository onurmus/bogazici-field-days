// ---------------------------------------------------------------------------
// Relay Event Detail Page — Stitch design "bayrak_yarışı_sonuçlar"
//
// Used for: 4×100m, 4×400m relay events.
// Layout:
//   1. Back link + giant title + status badge
//   2. Bento grid: Race info card | Tournament record card
//   3. Results table (ranked teams) OR start list (pre-race)
// ---------------------------------------------------------------------------

"use client";

import Link from "next/link";
import type { NormalizedRelayEvent, RelayTeamResult, RelayHeat } from "@/lib/types";
import StatusBadge from "./StatusBadge";

interface Props {
  event: NormalizedRelayEvent;
  updatedAt?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a time string like "42.45" or "3:45.67" into a number for comparison */
function parseTime(t: string): number {
  if (!t) return Infinity;
  const parts = t.replace(",", ".").split(":");
  if (parts.length === 2) {
    return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
  }
  return parseFloat(parts[0]);
}

/** Find the fastest (winning) time across all results */
function winningTime(results: RelayTeamResult[]): string {
  const ranked = results.filter((r) => r.rank === "1" || r.time);
  if (!ranked.length) return "—";
  const best = ranked.reduce((a, b) => (parseTime(a.time) <= parseTime(b.time) ? a : b));
  return best.time || "—";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ResultRow({
  result,
  isFirst,
}: {
  result: RelayTeamResult;
  isFirst: boolean;
}) {
  const isDQ = /^(DQ|DNS|DNF)$/i.test(result.time);
  const rankDisplay = isDQ ? "—" : result.rank;

  return (
    <div
      className={`grid grid-cols-12 border-b-4 border-[#1a1a1a] p-4 md:p-6 items-center transition-colors ${
        isDQ ? "bg-red-50" : isFirst ? "bg-[#ffcc00]/20" : "hover:bg-[#f5f0e8]"
      }`}
    >
      {/* Rank */}
      <div
        className="col-span-1 font-black"
        style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "clamp(1.5rem,3vw,2.5rem)" }}
      >
        {isFirst ? (
          <span className="text-[#0055ff]">{rankDisplay}</span>
        ) : (
          <span className={isDQ ? "opacity-30" : ""}>{rankDisplay}</span>
        )}
      </div>

      {/* Team name */}
      <div className="col-span-7 md:col-span-8">
        <p
          className={`font-black text-xl md:text-2xl uppercase ${isDQ ? "opacity-30" : ""}`}
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          {result.teamName || "—"}
        </p>
        {result.bib && (
          <p className="text-xs opacity-50 font-bold mt-0.5">#{result.bib}</p>
        )}
      </div>

      {/* Time */}
      <div className="col-span-3 md:col-span-2 text-right">
        {isDQ ? (
          <span
            className="font-black text-2xl text-red-600"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {result.time}
          </span>
        ) : (
          <span
            className={`font-black ${isFirst ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"}`}
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {result.time || "—"}
          </span>
        )}
        {result.points && !isDQ && (
          <p
            className="text-xs font-bold opacity-60 mt-0.5"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {result.points} puan
          </p>
        )}
      </div>
    </div>
  );
}

function StartListSection({ heats }: { heats: RelayHeat[] }) {
  if (!heats.length || !heats.some((h) => h.entries.length > 0)) return null;
  return (
    <div className="mt-8">
      <h2
        className="font-black text-2xl uppercase mb-4"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        Start Listesi
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {heats.map((heat) => (
          <div
            key={heat.name}
            className="border-4 border-[#1a1a1a] bg-white shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
          >
            <div className="bg-[#1a1a1a] text-white px-4 py-2 font-black uppercase text-sm"
              style={{ fontFamily: "var(--font-space-grotesk)" }}>
              {heat.name}
            </div>
            {heat.entries.map((entry) => (
              <div
                key={entry.lane}
                className="flex items-center gap-3 px-4 py-2 border-b border-zinc-200 last:border-0"
              >
                <span className="font-black text-zinc-400 w-6 text-right"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  {entry.lane}
                </span>
                <span className="font-bold">{entry.teamName}</span>
                {entry.bib && (
                  <span className="text-xs opacity-50 ml-auto">#{entry.bib}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function RelayEventDetailPage({ event, updatedAt }: Props) {
  const hasResults = event.results.some((r) => r.time);
  const firstPlace = event.results.find((r) => r.rank === "1");
  const fastest = hasResults ? winningTime(event.results) : null;

  return (
    <div className="md:ml-64 pt-24 pb-24 md:pb-12 px-4 md:px-12 max-w-7xl mx-auto">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="mb-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-black text-base uppercase border-b-4 border-[#1a1a1a] mb-8 hover:bg-[#ffcc00] px-2 py-1 transition-colors"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          ← Programa Dön
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h1
            className="font-black uppercase leading-none tracking-tighter"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontSize: "clamp(2.5rem, 8vw, 6rem)",
            }}
          >
            {event.title}
          </h1>
          <div className="flex-shrink-0">
            <StatusBadge status={event.status} />
          </div>
        </div>

        {updatedAt && (
          <p className="text-xs opacity-40 font-bold uppercase mt-3"
            style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Son güncelleme: {updatedAt}
          </p>
        )}
      </div>

      {/* ── Bento info grid ────────────────────────────────────────── */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="md:col-span-2 bg-white border-4 border-[#1a1a1a] p-6 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] relative overflow-hidden">
          <div className="absolute -right-8 -top-8 opacity-5 select-none pointer-events-none">
            <span style={{ fontSize: "160px", lineHeight: 1 }}>⏱</span>
          </div>
          <p
            className="font-bold text-sm uppercase opacity-50 mb-2"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Yarış Bilgisi
          </p>
          <h3
            className="font-black text-3xl uppercase mb-4"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {event.scheduledTime && `${event.scheduledTime} — `}{event.category}
          </h3>
          {hasResults && fastest && (
            <div>
              <p
                className="font-bold text-sm uppercase opacity-50 mb-1"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                En Hızlı Takım
              </p>
              <p className="font-black text-4xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                {fastest}
              </p>
              {firstPlace?.teamName && (
                <p className="font-bold text-base uppercase mt-1 opacity-70"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  {firstPlace.teamName}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-[#ffcc00] border-4 border-[#1a1a1a] p-6 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between">
          <div>
            <p
              className="font-bold text-sm uppercase mb-2"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Turnuva Rekoru
            </p>
            <p
              className="font-black text-4xl mb-2"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              —
            </p>
          </div>
          <p
            className="font-bold uppercase text-sm border-t-2 border-[#1a1a1a] pt-2"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Bilgi mevcut değil
          </p>
        </div>
      </div> */}

      {/* ── Results table ─────────────────────────────────────────── */}
      {hasResults ? (
        <div className="border-4 border-[#1a1a1a] bg-white shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] overflow-hidden">
          {/* Table header */}
          <div
            className="grid grid-cols-12 bg-[#1a1a1a] text-white p-4 font-bold uppercase text-xs tracking-widest"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            <div className="col-span-1">Sıra</div>
            <div className="col-span-8">Takım</div>
            <div className="col-span-3 text-right">Derece</div>
          </div>

          {/* Result rows — sort by rank (numeric), then by time for unranked */}
          {[...event.results]
            .sort((a, b) => {
              const ra = parseInt(a.rank) || Infinity;
              const rb = parseInt(b.rank) || Infinity;
              if (ra !== rb) return ra - rb;
              return parseTime(a.time) - parseTime(b.time);
            })
            .map((result, idx) => (
              <ResultRow key={idx} result={result} isFirst={result.rank === "1"} />
            ))}
        </div>
      ) : (
        <>
          {/* Pre-race: show start list */}
          <StartListSection heats={event.heats} />

          {!event.heats.some((h) => h.entries.length > 0) && (
            <div className="border-4 border-[#1a1a1a] bg-white p-12 text-center shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
              <p
                className="font-black text-2xl uppercase opacity-40"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Sonuçlar henüz açıklanmadı
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
