"use client";

import { useState, useMemo } from "react";
import type { TeamResultRow, DayFilter, GenderFilter } from "@/lib/normalizeTeamResults";
import { buildTeamStandings } from "@/lib/normalizeTeamResults";

// ---------------------------------------------------------------------------
// Row colours per rank (matching Stitch design)
// ---------------------------------------------------------------------------
const RANK_BG: Record<number, string> = {
  1: "bg-yellow-400",
  2: "bg-[#e8e3da]",
  3: "bg-[#d4a96a]",
};

const RANK_POINTS_COLOR: Record<number, string> = {
  1: "text-black",
  2: "text-[#0055ff]",
  3: "text-[#e63b2e]",
};

// ---------------------------------------------------------------------------
// Filter label banner
// ---------------------------------------------------------------------------
function filterLabel(day: DayFilter, gender: GenderFilter): string {
  const dayPart = day === "all" ? "1. GÜN + 2. GÜN" : `${day}. GÜN`;
  const genderPart = gender === "erkek" ? "ERKEKLER" : "KADINLAR";
  return `${genderPart} — ${dayPart}`;
}

// ---------------------------------------------------------------------------
// Filter chip button
// ---------------------------------------------------------------------------
function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-5 py-2 border-2 border-black font-black text-sm uppercase shrink-0 transition-none",
        active ? "bg-yellow-400" : "bg-white hover:bg-yellow-100",
      ].join(" ")}
      style={{ fontFamily: "var(--font-space-grotesk)" }}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Leaderboard row
// ---------------------------------------------------------------------------
function LeaderboardRow({
  rank,
  team,
  total,
  isLast,
}: {
  rank: number;
  team: string;
  total: number;
  isLast: boolean;
}) {
  const rowBg = RANK_BG[rank] ?? (rank % 2 === 0 ? "bg-white" : "bg-[#f5f0e8]");
  const pointsColor = RANK_POINTS_COLOR[rank] ?? "text-black";
  const badgeBg = rank <= 3 ? "bg-black text-white" : "bg-[#1a1a1a1a] text-black";

  return (
    <div
      className={[
        rowBg,
        "flex items-center gap-4 p-4 md:p-6",
        isLast ? "" : "border-b-2 border-black",
      ].join(" ")}
    >
      {/* Rank badge */}
      <div
        className={[
          "w-12 h-12 md:w-16 md:h-16 shrink-0 flex items-center justify-center text-2xl md:text-3xl font-black border-2 border-black",
          badgeBg,
        ].join(" ")}
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        {rank}
      </div>

      {/* Team name */}
      <div className="flex-1 min-w-0">
        <h3
          className="font-black text-xl md:text-2xl uppercase leading-tight truncate"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          {team}
        </h3>
      </div>

      {/* Points */}
      <div className="text-right shrink-0">
        <span
          className={["font-black text-3xl md:text-4xl", pointsColor].join(" ")}
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          {total}
        </span>
        <span
          className="font-bold text-xs block"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          PUAN
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function TeamResultsPage({ rows }: { rows: TeamResultRow[] }) {
  const [dayFilter, setDayFilter] = useState<DayFilter>("all");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("erkek");

  const standings = useMemo(
    () => buildTeamStandings(rows, dayFilter, genderFilter),
    [rows, dayFilter, genderFilter],
  );

  const isEmpty = rows.length === 0;

  return (
    <main
      className="max-w-2xl mx-auto px-4 py-12 space-y-8"
      style={{ fontFamily: "var(--font-space-grotesk)" }}
    >
      {/* Page heading */}
      <div>
        <h1 className="font-black text-5xl md:text-7xl uppercase tracking-tighter leading-none mb-3">
          TAKIM SIRALAMASI
        </h1>
        <div className="inline-block bg-[#e63b2e] text-white px-4 py-1 border-2 border-black font-bold text-sm tracking-widest">
          {filterLabel(dayFilter, genderFilter)}
        </div>
      </div>

      {/* Filter bar — sticky */}
      <div className="sticky top-[72px] z-30 bg-[#f5f0e8]/95 backdrop-blur-sm pt-4 pb-2 space-y-3">
        {/* Day filter */}
        <div className="flex gap-3 overflow-x-auto pb-1">
          <FilterChip active={dayFilter === "all"} onClick={() => setDayFilter("all")}>TÜMÜ</FilterChip>
          <FilterChip active={dayFilter === 1} onClick={() => setDayFilter(1)}>1. GÜN</FilterChip>
          <FilterChip active={dayFilter === 2} onClick={() => setDayFilter(2)}>2. GÜN</FilterChip>
        </div>
        {/* Gender filter */}
        <div className="flex gap-3 overflow-x-auto pb-1">
          <FilterChip active={genderFilter === "erkek"} onClick={() => setGenderFilter("erkek")}>ERKEKLER</FilterChip>
          <FilterChip active={genderFilter === "kadin"} onClick={() => setGenderFilter("kadin")}>KADINLAR</FilterChip>
        </div>
      </div>

      {/* Leaderboard */}
      {isEmpty ? (
        <div className="border-4 border-dashed border-gray-400 p-12 flex flex-col items-center text-center gap-4">
          <span className="material-symbols-outlined text-6xl text-gray-400">
            format_list_numbered
          </span>
          <p className="font-black text-xl uppercase text-gray-400">
            SONUÇ BULUNAMADI.
          </p>
          <p className="text-sm text-gray-500">
            Takım sonuçları henüz yüklenmedi veya erişilemiyor.
          </p>
        </div>
      ) : standings.length === 0 ? (
        <div className="border-4 border-dashed border-gray-400 p-12 flex flex-col items-center text-center gap-4">
          <span className="material-symbols-outlined text-6xl text-gray-400">
            format_list_numbered
          </span>
          <p className="font-black text-xl uppercase text-gray-400">
            SONUÇ BULUNAMADI.
          </p>
        </div>
      ) : (
        <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          {standings.map((s, idx) => (
            <LeaderboardRow
              key={s.team}
              rank={s.rank}
              team={s.team}
              total={s.total}
              isLast={idx === standings.length - 1}
            />
          ))}
        </div>
      )}
    </main>
  );
}
