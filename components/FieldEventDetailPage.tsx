// ---------------------------------------------------------------------------
// Field Event Detail Page — Stitch design "atlama_sonu_lar_uzun_atlama"
//
// Used for: long jump, triple jump, javelin, discus throw, shot put.
// Layout:
//   1. Back link + giant title + status badge (rotated, red)
//   2. Hero bento (3 cards): best result | track record | wind (jumps only)
//   3. Full results table with all attempt columns + BEST (yellow)
// ---------------------------------------------------------------------------

import Link from "next/link";
import type { NormalizedFieldEvent, FieldAthleteResult } from "@/lib/types";
import StatusBadge from "./StatusBadge";

interface Props {
  event: NormalizedFieldEvent;
  updatedAt?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Find the best result across all athletes (highest numeric value) */
function computeBestResult(results: FieldAthleteResult[]): {
  value: string;
  wind: string | undefined;
  athlete: string;
} | null {
  let best: { num: number; value: string; wind: string | undefined; athlete: string } | null =
    null;
  for (const r of results) {
    const num = parseFloat(r.best.replace(",", "."));
    if (!isNaN(num) && (best === null || num > best.num)) {
      best = { num, value: r.best, wind: r.bestWind, athlete: r.athleteName };
    }
  }
  return best ? { value: best.value, wind: best.wind, athlete: best.athlete } : null;
}

/** Return attempt cell content: value + optional wind/NM note */
function AttemptCell({
  value,
  isJump,
}: {
  value: string;
  isJump: boolean;
}) {
  if (!value) {
    return <span className="text-zinc-300">—</span>;
  }
  const isInvalid = value.toUpperCase() === "X" || value.toUpperCase() === "NM";
  return (
    <span className="flex flex-col items-center leading-tight">
      <span className={isInvalid ? "text-red-600 font-black" : ""}>{value}</span>
      {isInvalid && isJump && (
        <span className="text-[10px] text-red-500 font-bold">NM</span>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FieldEventDetailPage({ event, updatedAt }: Props) {
  const { title, round, status, scheduledTime, day, results, isJump, attemptCount } = event;

  const topResult = computeBestResult(results);
  const hasResults = results.some((r) => r.best !== "");
  const hasAttempts = results.some((r) => r.attempts.some((a) => a.value !== ""));
  const hasAnyData = hasResults || hasAttempts;

  // Sorted results: ranked first (by rank number), then unranked by entry order
  const sortedResults = [...results].sort((a, b) => {
    const ra = parseInt(a.rank) || 9999;
    const rb = parseInt(b.rank) || 9999;
    if (ra !== rb) return ra - rb;
    return parseInt(a.entryOrder) - parseInt(b.entryOrder);
  });

  return (
    <main
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-24"
      style={{ fontFamily: "var(--font-space-grotesk)" }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          {/* Back link */}
          <Link href="/" className="inline-flex items-center gap-2 group mb-4">
            <span className="material-symbols-outlined text-xl transition-transform group-hover:-translate-x-1">
              arrow_back
            </span>
            <span className="font-bold uppercase tracking-widest border-b-2 border-zinc-900 text-base">
              Programa Dön
            </span>
          </Link>

          {/* Giant title */}
          <h1 className="text-6xl md:text-8xl font-black uppercase leading-[0.85] tracking-tighter text-zinc-900">
            {title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 font-bold text-base uppercase opacity-60 mt-4">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xl">calendar_today</span>
              {day}. Gün — {scheduledTime}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xl">flag</span>
              {round}
            </span>
            {updatedAt && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xl">update</span>
                {updatedAt}&apos;te güncellendi
              </span>
            )}
          </div>
        </div>

        {/* Status badge — rotated, red, big */}
        <div className="bg-red-600 text-white px-6 py-3 border-4 border-zinc-900 neo-shadow font-black uppercase text-2xl rotate-[-2deg] shrink-0">
          <StatusBadge status={status} />
        </div>
      </div>

      {/* ── Hero bento ─────────────────────────────────────────────── */}
      {/* <div className={`grid grid-cols-1 ${isJump ? "md:grid-cols-4" : "md:grid-cols-3"} gap-4 mb-12`}>
        <div className="md:col-span-2 relative overflow-hidden border-4 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,85,255,1)] bg-zinc-900 min-h-[200px] flex flex-col justify-end">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <span className="material-symbols-outlined text-white" style={{ fontSize: "180px" }}>
              {isJump ? "sprint" : "sports_handball"}
            </span>
          </div>
          <div className="relative p-6 md:p-8">
            <p className="text-zinc-400 text-base font-bold uppercase tracking-wider mb-1">
              Günün Derecesi
            </p>
            {topResult ? (
              <>
                <p className="text-7xl font-black text-white leading-none">
                  {topResult.value}m
                </p>
                <p className="text-zinc-400 font-bold uppercase mt-2 text-sm">
                  {topResult.athlete}
                </p>
              </>
            ) : (
              <p className="text-5xl font-black text-zinc-500 leading-none">—</p>
            )}
          </div>
        </div>

        <div className="bg-[#ffcc00] border-4 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] p-8 flex flex-col justify-center">
          <span className="material-symbols-outlined text-6xl mb-4">military_tech</span>
          <h3 className="text-3xl font-black uppercase leading-none">Pist Rekoru</h3>
          <p className="mt-4 text-lg font-bold opacity-60">—</p>
        </div>

        {isJump && (
          <div className="bg-[#0055ff] text-white border-4 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] p-8 flex flex-col justify-center">
            <span
              className="material-symbols-outlined text-6xl mb-4"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              air
            </span>
            <h3 className="text-3xl font-black uppercase leading-none">Rüzgar Durumu</h3>
            <p className="mt-4 text-lg font-bold">
              {topResult?.wind ?? "—"}
            </p>
          </div>
        )}
      </div> */}

      {/* ── Results table ──────────────────────────────────────────── */}
      {results.length === 0 ? (
        <div className="py-20 text-center border-4 border-zinc-900 bg-white">
          <p className="font-black text-2xl uppercase text-zinc-400">
            Henüz liste yok.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border-4 border-zinc-900 shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] bg-white">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-900 text-white border-b-4 border-zinc-900">
              <tr className="uppercase font-black text-sm tracking-widest">
                <th className="p-4 border-r-2 border-white/20">Rank</th>
                <th className="p-4 border-r-2 border-white/20">Göğüs</th>
                <th className="p-4 border-r-2 border-white/20">Sporcu</th>
                <th className="p-4 border-r-2 border-white/20">Takım</th>
                {Array.from({ length: attemptCount }, (_, i) => (
                  <th key={i} className="p-4 text-center border-r border-white/20">
                    {i + 1}
                  </th>
                ))}
                <th className="p-4 bg-[#ffcc00] text-zinc-900 text-center font-black">
                  En İyi
                </th>
              </tr>
            </thead>
            <tbody className="font-bold divide-y-4 divide-zinc-900">
              {sortedResults.map((r, idx) => {
                const rankDisplay = r.rank
                  ? String(parseInt(r.rank)).padStart(2, "0")
                  : String(idx + 1).padStart(2, "0");
                const isLeader = idx === 0 && hasResults;

                return (
                  <tr
                    key={r.bib || r.entryOrder}
                    className="hover:bg-yellow-50 transition-colors"
                  >
                    <td className="p-4 border-r-4 border-zinc-900 text-2xl font-black">
                      {rankDisplay}
                    </td>
                    <td className="p-4 border-r-4 border-zinc-900">{r.bib}</td>
                    <td className="p-4 border-r-4 border-zinc-900 uppercase">
                      {r.athleteName}
                    </td>
                    <td className="p-4 border-r-4 border-zinc-900 uppercase opacity-60">
                      {r.team}
                    </td>
                    {r.attempts.map((attempt, ai) => (
                      <td
                        key={ai}
                        className={`p-4 text-center border-r border-zinc-900/10 ${
                          ai === attemptCount - 1 ? "border-r-4 border-zinc-900" : ""
                        }`}
                      >
                        <AttemptCell value={attempt.value} isJump={isJump} />
                      </td>
                    ))}
                    <td
                      className={`p-4 text-center font-black ${
                        isLeader
                          ? "bg-[#ffcc00] text-3xl"
                          : "bg-yellow-50 text-2xl text-zinc-700"
                      }`}
                    >
                      {r.best || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Start list note when no results yet */}
      {!hasAnyData && results.length > 0 && (
        <p className="mt-4 text-sm font-bold uppercase text-zinc-500 text-center">
          Yarışma başlamadı — başlangıç listesi gösteriliyor
        </p>
      )}
    </main>
  );
}
