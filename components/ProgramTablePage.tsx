// ---------------------------------------------------------------------------
// Program Table Page — a faithful tabular view of the schedule spreadsheet.
//
// Shows one row per heat so athletes can see the exact start time for their
// specific heat. Two day tabs switch between 1. Gün and 2. Gün data.
// ---------------------------------------------------------------------------

"use client";

import { useState } from "react";
import Link from "next/link";
import type { RawScheduleRow } from "@/lib/normalizeSchedule";

interface Props {
  day1Rows: RawScheduleRow[];
  day2Rows: RawScheduleRow[];
  lastUpdated?: string;
}

const COLUMNS = [
  { key: "areaTime",  label: "Yarışma Alanı",  nowrap: true  },
  { key: "raceTime",  label: "Yarışma Saati",  nowrap: true  },
  { key: "eventName", label: "Yarışma Adı",    nowrap: false },
  { key: "heatLabel", label: "Seri No",         nowrap: true  },
  { key: "category",  label: "Kategori",        nowrap: true  },
] as const;

function CategoryBadge({ category }: { category: string }) {
  const lower = category.toLowerCase();
  const bg =
    lower.includes("erkek") && !lower.includes("kadın") && !lower.includes("kadin")
      ? "bg-blue-100 border-blue-400"
      : lower.includes("kadın") || lower.includes("kadin")
      ? "bg-pink-100 border-pink-400"
      : "bg-yellow-100 border-yellow-400";
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-black uppercase border-2 ${bg}`}
      style={{ fontFamily: "var(--font-space-grotesk)" }}
    >
      {category}
    </span>
  );
}

export default function ProgramTablePage({ day1Rows, day2Rows, lastUpdated }: Props) {
  const [activeDay, setActiveDay] = useState<1 | 2>(1);
  const rows = activeDay === 1 ? day1Rows : day2Rows;

  return (
    <div className="lg:ml-64 px-4 md:px-8 pt-24 lg:pt-10 pb-24">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1
          className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Yarışma Programı
        </h1>
        {lastUpdated && (
          <p
            className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-2"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Son güncelleme: {lastUpdated}
          </p>
        )}
      </div>

      {/* ── Day tabs ─────────────────────────────────────────────────── */}
      <div
        className="flex border-4 border-zinc-900 bg-white w-fit mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        {([1, 2] as const).map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={
              activeDay === day
                ? "px-8 py-3 bg-zinc-900 text-white font-black uppercase text-base transition-colors"
                : "px-8 py-3 hover:bg-stone-200 font-black uppercase text-base transition-colors"
            }
          >
            {day}. Gün
          </button>
        ))}
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto border-4 border-zinc-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <table
          className="w-full border-collapse text-sm"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          <thead>
            <tr className="bg-zinc-900 text-white text-xs uppercase tracking-widest">
              {COLUMNS.map((col, i) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left font-bold ${col.nowrap ? "whitespace-nowrap" : ""} ${i < COLUMNS.length - 1 ? "border-r-2 border-zinc-700" : ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-4 py-16 text-center font-bold text-zinc-400 uppercase"
                >
                  Program verisi yüklenemedi
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b-2 border-zinc-200 transition-colors ${
                    i % 2 === 0 ? "bg-white" : "bg-stone-50"
                  } hover:bg-yellow-50`}
                >
                  {/* Yarışma Alanı */}
                  <td className="px-4 py-3 font-bold text-zinc-500 border-r-2 border-zinc-200 whitespace-nowrap">
                    {row.areaTime || "—"}
                  </td>

                  {/* Yarışma Saati */}
                  <td className="px-4 py-3 font-black border-r-2 border-zinc-200 whitespace-nowrap">
                    {row.raceTime || "—"}
                  </td>

                  {/* Yarışma Adı — links to detail page when slug is available */}
                  <td className="px-4 py-3 border-r-2 border-zinc-200">
                    {row.slug ? (
                      <Link
                        href={`/events/${row.slug}`}
                        className="font-bold text-blue-600 underline underline-offset-2 decoration-2 hover:text-blue-800 hover:bg-yellow-100 px-1 -mx-1 transition-colors inline-flex items-center gap-1"
                      >
                        {row.eventName}
                        <span className="material-symbols-outlined text-base leading-none opacity-60">arrow_forward</span>
                      </Link>
                    ) : (
                      <span className="font-bold">{row.eventName}</span>
                    )}
                  </td>

                  {/* Seri No */}
                  <td className="px-4 py-3 text-zinc-500 border-r-2 border-zinc-200 whitespace-nowrap">
                    {row.heatLabel || "—"}
                  </td>

                  {/* Kategori */}
                  <td className="px-4 py-3">
                    <CategoryBadge category={row.category} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
