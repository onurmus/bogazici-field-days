"use client";

import { useState } from "react";
import type { ScheduleEntry, EventStatus } from "@/lib/types";
import EventCard from "./EventCard";

interface Props {
  schedule: ScheduleEntry[];
  lastUpdated?: string;
  day: 1 | 2;
}

const FILTER_CATEGORIES = [
  { key: "all",         label: "Tümü" },
  { key: "pist",        label: "Pist" },
  { key: "atmalar",     label: "Atmalar" },
  { key: "atlamalar",   label: "Atlamalar" },
  { key: "kadin",       label: "Kadınlar" },
  { key: "erkek",       label: "Erkekler" },
  { key: "sonuclanan",  label: "Sonuçlananlar" },
] as const;

type FilterKey = (typeof FILTER_CATEGORIES)[number]["key"];

function filterEntry(entry: ScheduleEntry, filter: FilterKey, search: string): boolean {
  const title = entry.title.toLowerCase();
  const searchMatch = !search || title.includes(search.toLowerCase()) || entry.category.toLowerCase().includes(search.toLowerCase());

  if (!searchMatch) return false;

  switch (filter) {
    case "all": return true;
    case "kadin": return entry.category.toLowerCase().includes("kadın");
    case "erkek": return entry.category.toLowerCase().includes("erkek");
    case "sonuclanan": return entry.status === "Sonuçlandı";
    case "pist": {
      const t = title;
      return (
        t.includes("metre") || t.includes("100m") || t.includes("200m") ||
        t.includes("400m") || t.includes("800m") || t.includes("1500m") ||
        t.includes("3000m") || t.includes("5000m") || t.includes("engelli") ||
        t.includes("bayrak") || t.includes("4x")
      );
    }
    case "atmalar": {
      const t = title;
      return t.includes("gülle") || t.includes("disk") || t.includes("cirit") || t.includes("atma");
    }
    case "atlamalar": {
      const t = title;
      return t.includes("uzun") || t.includes("üç adım") || t.includes("yüksek") || t.includes("atlama");
    }
    default: return true;
  }
}

/** Group schedule entries by scheduledTime, preserving order */
function groupByTime(entries: ScheduleEntry[]): Map<string, ScheduleEntry[]> {
  const map = new Map<string, ScheduleEntry[]>();
  for (const entry of entries) {
    const key = entry.scheduledTime || "??:??";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(entry);
  }
  return map;
}

/** Count how many entries have a given status */
function countByStatus(entries: ScheduleEntry[], status: EventStatus) {
  return entries.filter((e) => e.status === status).length;
}

/** Find the next upcoming event (first non-Sonuçlandı entry) */
function nextEvent(entries: ScheduleEntry[]): ScheduleEntry | undefined {
  return entries.find((e) => e.status !== "Sonuçlandı");
}

export default function SchedulePage({ schedule, lastUpdated, day }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");

  const dayEntries = schedule;
  const filtered = dayEntries.filter((e) => filterEntry(e, activeFilter, search));
  const grouped = groupByTime(filtered);

  const totalCount = dayEntries.length;
  const finishedCount = countByStatus(dayEntries, "Sonuçlandı");
  const next = nextEvent(dayEntries);

  return (
    <div className="flex min-h-screen">
      {/* Main content — offset for sidebar on desktop */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8 lg:p-12">

        {/* ── Page Header ── */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-yellow-400 neo-border px-4 py-1 mb-3">
                <span className="material-symbols-outlined text-base">calendar_today</span>
                <span
                  className="text-sm font-black uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {day}. Gün
                </span>
              </div>
              <h1
                className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-none mb-2"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Boğaziçi Üniversitesi Atletizm Günleri
              </h1>
              <p className="text-lg md:text-2xl font-bold text-blue-600">
                Field Day Yarışma Programı ve Sonuçları
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
              <div className="flex items-center gap-2 px-3 py-2 bg-white neo-border font-bold text-sm">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span>Canlı sonuçlar Google Drive üzerinden güncellenir</span>
              </div>
              {lastUpdated && (
                <span className="font-bold text-sm uppercase tracking-widest text-zinc-500">
                  Son Güncelleme: {lastUpdated}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ── Bento Stats ── */}
        {/* <section className="mb-16">
          <h2
            className="text-3xl md:text-4xl font-black uppercase mb-8 border-b-8 border-zinc-900 inline-block"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Bugünkü Yarışlar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 text-white p-8 neo-border neo-shadow-blue flex flex-col justify-between min-h-[140px]">
              <span className="text-sm font-bold uppercase tracking-widest opacity-80" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Toplam Branş
              </span>
              <span className="text-6xl font-black leading-none" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                {String(totalCount).padStart(2, "0")}
              </span>
            </div>
            <div className="bg-blue-600 text-white p-8 neo-border neo-shadow flex flex-col justify-between min-h-[140px]">
              <span className="text-sm font-bold uppercase tracking-widest opacity-80" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Sonuçlanan Branş
              </span>
              <span className="text-6xl font-black leading-none" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                {String(finishedCount).padStart(2, "0")}
              </span>
            </div>
            <div className="bg-yellow-400 text-zinc-900 p-8 neo-border neo-shadow flex flex-col justify-between min-h-[140px]">
              <span className="text-sm font-bold uppercase tracking-widest opacity-80" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Sıradaki Yarış
              </span>
              {next ? (
                <div>
                  <span className="block text-2xl md:text-3xl font-black leading-tight uppercase" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                    {next.title}
                  </span>
                  <span className="text-xl font-bold">({next.scheduledTime})</span>
                </div>
              ) : (
                <span className="text-2xl font-black uppercase" style={{ fontFamily: "var(--font-space-grotesk)" }}>Tamamlandı</span>
              )}
            </div>
          </div>
        </section> */}

        {/* ── Controls ── */}
        <section className="mb-12 space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Search */}
            <div className="flex-1 w-full relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Branş, sporcu veya takım ara"
                className="w-full bg-white neo-border px-6 py-4 font-bold text-lg focus:ring-0 focus:outline-none placeholder:text-zinc-400"
                style={{ fontFamily: "var(--font-inter)" }}
              />
              <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-3xl text-zinc-400">search</span>
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-3">
            {FILTER_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveFilter(cat.key)}
                className={
                  activeFilter === cat.key
                    ? "px-5 py-2 bg-zinc-900 text-white neo-border font-black uppercase text-sm neo-shadow-blue"
                    : "px-5 py-2 bg-white hover:bg-blue-50 neo-border font-black uppercase text-sm transition-all hover:-translate-y-0.5"
                }
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Schedule grouped by time ── */}
        <div className="space-y-12">
          {grouped.size === 0 ? (
            <p className="py-16 text-center font-bold text-zinc-400 uppercase" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Bu filtreye uygun yarışma bulunamadı.
            </p>
          ) : (
            Array.from(grouped.entries()).map(([time, entries]) => (
              <div key={time} className="relative">
                {/* Time header */}
                <div className="flex items-center gap-4 mb-6">
                  <span
                    className="text-3xl md:text-4xl font-black bg-white neo-border px-4 py-1 neo-shadow shrink-0"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {time}
                  </span>
                  <div className="h-1 bg-zinc-900 flex-1" />
                </div>
                {/* Event cards */}
                <div className="grid grid-cols-1 gap-6">
                  {entries.map((entry) => (
                    <EventCard key={entry.slug} entry={entry} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Banner ── */}
        {/* <section className="mt-20">
          <div className="neo-border neo-shadow-yellow bg-zinc-900 overflow-hidden relative min-h-[280px] flex items-center">
            <div className="relative z-10 p-8 md:p-16 max-w-2xl">
              <h2
                className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6 leading-none"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Rekorlarınızı{" "}
                <br />
                <span className="text-yellow-400 italic">Burada Yazın.</span>
              </h2>
              <button
                className="bg-yellow-400 text-zinc-900 font-black uppercase py-4 px-10 neo-border neo-shadow text-lg hover:translate-y-0.5 hover:shadow-none transition-all"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Tüm Rekorları Gör
              </button>
            </div>
          </div>
        </section> */}
      </main>
    </div>
  );
}
