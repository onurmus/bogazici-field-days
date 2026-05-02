// ---------------------------------------------------------------------------
// High Jump Event Detail Page
//
// Displays results in a height-matrix table:
//   Columns: ATLET (sticky) | [heights...] | SONUÇ
//   Each height cell shows combined attempt string (O / XO / XXX / - / …)
//   Current height column is highlighted yellow.
//   Table scrolls horizontally on narrow screens.
// ---------------------------------------------------------------------------

import Link from "next/link";
import type { NormalizedHighJumpEvent, HighJumpHeight } from "@/lib/types";
import StatusBadge from "./StatusBadge";

interface Props {
  event: NormalizedHighJumpEvent;
  updatedAt?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Combines up to 3 attempt strings into a compact display value and a status.
 */
function parseAttempts(attempts: string[]): {
  display: string;
  status: "cleared" | "failed" | "skipped" | "in-progress" | "pending";
} {
  const vals = attempts.filter((a) => a !== "");
  if (vals.length === 0) return { display: "", status: "pending" };

  const cleared = vals.some((a) => a.toUpperCase() === "O");
  if (cleared) return { display: vals.join(""), status: "cleared" };

  if (vals[0] === "-") return { display: "−", status: "skipped" };

  const xCount = vals.filter((a) => a.toUpperCase() === "X").length;
  if (xCount === 3) return { display: "XXX", status: "failed" };

  // Some X's but not 3, no O — still in progress
  return { display: vals.join(""), status: "in-progress" };
}

/**
 * Find the index of the current active height:
 * first height where at least one athlete has a non-empty attempt
 * but not all athletes have made a final decision.
 */
function findCurrentHeightIndex(
  results: NormalizedHighJumpEvent["results"]
): number {
  const numHeights = results[0]?.heights.length ?? 0;
  for (let hi = 0; hi < numHeights; hi++) {
    const hasActivity = results.some((r) =>
      r.heights[hi]?.attempts.some((a) => a !== "")
    );
    if (!hasActivity) continue;

    const allDecided = results.every((r) => {
      const h: HighJumpHeight | undefined = r.heights[hi];
      if (!h) return true;
      const cleared = h.attempts.some((a) => a.toUpperCase() === "O");
      const failed = h.attempts.filter((a) => a.toUpperCase() === "X").length === 3;
      const skipped = h.attempts.some((a) => a === "-");
      return cleared || failed || skipped;
    });

    if (!allDecided) return hi;
  }
  return -1;
}

/**
 * Returns the height indices that should be visible (attempted + 1 ahead).
 * Always returns at least a few columns so the empty table isn't just 2 cols.
 */
function visibleHeightRange(
  results: NormalizedHighJumpEvent["results"],
  total: number
): { start: number; end: number } {
  if (results.length === 0) return { start: 0, end: Math.min(total - 1, 5) };

  let first = total;
  let last = -1;
  for (const r of results) {
    for (let hi = 0; hi < r.heights.length; hi++) {
      if (r.heights[hi].attempts.some((a) => a !== "")) {
        if (hi < first) first = hi;
        if (hi > last) last = hi;
      }
    }
  }
  if (last === -1) return { start: 0, end: Math.min(total - 1, 5) };
  return {
    start: Math.max(0, first),
    end: Math.min(total - 1, last + 2),
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function AttemptCell({
  attempts,
  isCurrent,
}: {
  attempts: string[];
  isCurrent: boolean;
}) {
  const { display, status } = parseAttempts(attempts);

  const textColor =
    status === "cleared"
      ? "text-green-700 font-black"
      : status === "failed"
      ? "text-red-600 font-black"
      : status === "skipped"
      ? "text-zinc-400"
      : status === "in-progress"
      ? "text-amber-700 font-black"
      : "text-zinc-200"; // pending

  const cellBg = isCurrent
    ? "bg-yellow-100"
    : "";

  return (
    <td
      className={`text-center px-2 py-3 text-sm border-r border-zinc-200 ${cellBg}`}
      style={{ minWidth: "3rem" }}
    >
      <span className={textColor}>{display || "—"}</span>
    </td>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function HighJumpEventDetailPage({ event, updatedAt }: Props) {
  const { title, round, status, scheduledTime, day, heights, results } = event;

  const currentHi = findCurrentHeightIndex(results);
  const hasData = results.some((r) => r.heights.some((h) => h.attempts.some((a) => a !== "")));

  // Sort: ranked athletes first (by rank), then unranked by best height desc, then entry order
  const sorted = [...results].sort((a, b) => {
    const ra = parseInt(a.rank) || 9999;
    const rb = parseInt(b.rank) || 9999;
    if (ra !== rb) return ra - rb;
    const ba = parseFloat(a.best.replace(",", ".")) || 0;
    const bb = parseFloat(b.best.replace(",", ".")) || 0;
    if (ba !== bb) return bb - ba;
    return parseInt(a.entryOrder) - parseInt(b.entryOrder);
  });

  const { start: visStart, end: visEnd } = visibleHeightRange(results, heights.length);
  const visibleHeights = heights.slice(visStart, visEnd + 1);
  const visibleStart = visStart;

  return (
    <main
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-24"
      style={{ fontFamily: "var(--font-space-grotesk)" }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 group mb-4">
            <span className="material-symbols-outlined text-xl transition-transform group-hover:-translate-x-1">
              arrow_back
            </span>
            <span className="font-bold uppercase tracking-widest border-b-2 border-zinc-900 text-base">
              Programa Dön
            </span>
          </Link>

          <h1 className="text-6xl md:text-8xl font-black uppercase leading-[0.85] tracking-tighter text-zinc-900">
            {title}
          </h1>

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

        <div className="bg-red-600 text-white px-6 py-3 border-4 border-zinc-900 neo-shadow font-black uppercase text-2xl rotate-[-2deg] shrink-0">
          <StatusBadge status={status} />
        </div>
      </div>

      {/* ── Section title ──────────────────────────────────────────── */}
      <div className="flex items-end justify-between mb-4 gap-4">
        <div>
          <h2
            className="text-2xl font-black uppercase border-b-4 border-zinc-900 inline-block pb-1"
          >
            Puan Tablosu
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Güncel yükseklik denemeleri ve sıralama.{" "}
            <span className="text-green-700 font-black">O</span>: Başarılı,{" "}
            <span className="text-red-600 font-black">X</span>: Başarısız,{" "}
            <span className="text-zinc-400 font-bold">−</span>: Pas
          </p>
        </div>
        {currentHi >= 0 && (
          <div className="shrink-0 flex items-center gap-2 bg-yellow-400 neo-border px-4 py-2">
            <span className="material-symbols-outlined text-base">trending_up</span>
            <span className="font-black uppercase text-sm">
              Aktif Yükseklik: {heights[currentHi]}m
            </span>
          </div>
        )}
      </div>

      {/* ── Results table ──────────────────────────────────────────── */}
      {!hasData && results.length === 0 ? (
        <div className="py-20 text-center font-bold text-zinc-400 uppercase neo-border bg-white">
          Henüz sonuç bulunmamaktadır
        </div>
      ) : (
        <div className="neo-border bg-white neo-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-900 text-white">
                  {/* Sticky athlete column */}
                  <th
                    className="text-left px-4 py-3 font-black uppercase tracking-wider border-r border-zinc-700 whitespace-nowrap"
                    style={{ minWidth: "200px" }}
                  >
                    Atlet
                  </th>
                  {/* Height columns */}
                  {visibleHeights.map((h, idx) => {
                    const hi = visibleStart + idx;
                    const isCurrent = hi === currentHi;
                    return (
                      <th
                        key={h}
                        className={`px-2 py-3 font-black text-center border-r border-zinc-700 whitespace-nowrap ${
                          isCurrent ? "bg-yellow-400 text-zinc-900" : ""
                        }`}
                        style={{ minWidth: "3rem" }}
                      >
                        {h}
                      </th>
                    );
                  })}
                  {/* Result column */}
                  <th className="px-4 py-3 font-black text-center uppercase tracking-wider whitespace-nowrap">
                    Sonuç
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((athlete, rowIdx) => (
                  <tr
                    key={athlete.entryOrder || athlete.bib || rowIdx}
                    className={rowIdx % 2 === 0 ? "bg-white" : "bg-stone-50"}
                  >
                    {/* Athlete cell */}
                    <td className="px-4 py-3 border-r border-zinc-200 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {/* Rank badge */}
                        {athlete.rank ? (
                          <span
                            className={`w-7 h-7 flex items-center justify-center font-black text-xs border-2 border-zinc-900 shrink-0 ${
                              athlete.rank === "1"
                                ? "bg-yellow-400"
                                : athlete.rank === "2"
                                ? "bg-zinc-300"
                                : athlete.rank === "3"
                                ? "bg-amber-600 text-white"
                                : "bg-white"
                            }`}
                          >
                            {athlete.rank}
                          </span>
                        ) : (
                          <span className="w-7 h-7 flex items-center justify-center font-black text-xs border-2 border-zinc-200 text-zinc-400 shrink-0">
                            {athlete.entryOrder || "—"}
                          </span>
                        )}
                        <div>
                          <div className="font-black uppercase text-sm leading-tight">
                            {athlete.athleteName}
                          </div>
                          <div className="text-zinc-500 text-xs font-bold uppercase leading-tight">
                            {athlete.team}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Height attempt cells */}
                    {visibleHeights.map((_, idx) => {
                      const hi = visibleStart + idx;
                      const hData = athlete.heights[hi];
                      return (
                        <AttemptCell
                          key={hi}
                          attempts={hData?.attempts ?? []}
                          isCurrent={hi === currentHi}
                        />
                      );
                    })}

                    {/* Best result */}
                    <td className="px-4 py-3 text-center">
                      {athlete.best ? (
                        <span className="font-black text-base">{athlete.best}m</span>
                      ) : (
                        <span className="text-zinc-300 font-bold">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Height range note */}
          {heights.length > visibleHeights.length && (
            <div className="px-4 py-2 border-t border-zinc-200 bg-stone-50 text-xs text-zinc-400 font-bold uppercase tracking-wider">
              Gösterilen yükseklikler: {heights[visStart]} – {heights[visEnd]} m
              &nbsp;/&nbsp; Toplam: {heights[0]} – {heights[heights.length - 1]} m
            </div>
          )}
        </div>
      )}
    </main>
  );
}
