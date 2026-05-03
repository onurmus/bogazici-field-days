"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { AthleteIndexEntry } from "@/lib/buildAthleteIndex";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeQuery(q: string): string {
  return q.toLowerCase().trim().replace(/\s+/g, " ");
}

function matchesQuery(athlete: AthleteIndexEntry, nq: string): boolean {
  if (!nq) return false;
  const name = athlete.name.toLowerCase();
  const team = athlete.team.toLowerCase();
  const bib = athlete.bib.toLowerCase();
  return (
    name.includes(nq) ||
    team.includes(nq) ||
    bib === nq ||
    bib === nq.replace(/^#/, "") ||
    `#${bib}` === nq
  );
}

function getTopTeams(athletes: AthleteIndexEntry[]): string[] {
  const counts = new Map<string, number>();
  for (const a of athletes) {
    if (a.team) counts.set(a.team, (counts.get(a.team) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([team]) => team);
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status, result }: { status: string; result: string }) {
  if (status === "Sonuçlandı") {
    return (
      <span className="inline-block bg-[#e63b2e] text-white px-2 py-0.5 font-bold text-xs uppercase border border-black">
        SONUÇLANDI{result ? `: ${result}` : ""}
      </span>
    );
  }
  return (
    <span className="inline-block bg-[#f5f0e8] border-2 border-black px-2 py-0.5 font-bold text-xs uppercase">
      {status.toUpperCase()}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Event row
// ---------------------------------------------------------------------------

function EventRow({ event }: { event: AthleteIndexEntry["events"][number] }) {
  const dayTime = `${event.day}. GÜN${event.scheduledTime ? ` — ${event.scheduledTime}` : ""}`;

  return (
    <div className="border-2 border-black p-4 bg-[#f2ede5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="space-y-1">
        <p className="font-bold text-xl uppercase italic leading-tight">
          {event.title}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs font-bold uppercase text-gray-500">
          <span>{dayTime}</span>
          {event.heatInfo && <span>{event.heatInfo}</span>}
        </div>
      </div>
      <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto shrink-0">
        <StatusBadge status={event.status} result={event.result} />
        <Link
          href={`/events/${event.slug}`}
          className="w-full sm:w-auto text-center px-4 py-2 bg-yellow-400 border-2 border-black font-bold text-xs uppercase hover:bg-yellow-300 transition-colors active:translate-x-0.5 active:translate-y-0.5"
        >
          ETKİNLİK DETAYI
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Athlete card
// ---------------------------------------------------------------------------

function AthleteCard({ athlete }: { athlete: AthleteIndexEntry }) {
  const allDone = athlete.events.length > 0 &&
    athlete.events.every((e) => e.status === "Sonuçlandı");

  return (
    <article
      className={[
        "bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6",
        allDone ? "opacity-70 grayscale contrast-125" : "",
      ].join(" ")}
    >
      {/* Header */}
      <header className="flex justify-between items-start gap-4 pb-4 border-b-4 border-black mb-6">
        <div className="min-w-0">
          <h2 className="font-black text-4xl uppercase leading-none tracking-tighter break-words">
            {athlete.name}
          </h2>
          <p className="font-bold text-[#0055ff] uppercase mt-1 text-sm">
            {athlete.team}
          </p>
        </div>
        {athlete.bib && (
          <div className="shrink-0 bg-black text-white px-3 py-1 font-black text-2xl border-2 border-black">
            #{athlete.bib}
          </div>
        )}
      </header>

      {/* Events */}
      {allDone ? (
        <p className="font-bold text-center py-4 border-2 border-dashed border-gray-400 uppercase text-gray-400">
          TÜM BRANŞLAR TAMAMLANDI
        </p>
      ) : (
        <div className="space-y-4">
          <h3 className="font-black text-xs tracking-[0.2em] uppercase text-gray-500">
            KAYITLI BRANŞLAR
          </h3>
          <div className="space-y-3">
            {athlete.events.map((event, idx) => (
              <EventRow key={`${event.slug}-${idx}`} event={event} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function AthleteSearchPage({
  athletes,
}: {
  athletes: AthleteIndexEntry[];
}) {
  const [query, setQuery] = useState("");

  const topTeams = useMemo(() => getTopTeams(athletes), [athletes]);

  const results = useMemo(() => {
    const nq = normalizeQuery(query);
    if (!nq) return [];
    return athletes.filter((a) => matchesQuery(a, nq));
  }, [athletes, query]);

  const hasQuery = query.trim().length > 0;

  return (
    <main
      className="max-w-2xl mx-auto px-4 py-8 space-y-8"
      style={{ fontFamily: "var(--font-space-grotesk)" }}
    >
      {/* Search input */}
      <section className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sporcu adı, takım veya göğüs numarası ara"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full h-16 px-4 pr-12 bg-white text-xl font-bold border-b-4 border-black focus:ring-0 focus:outline-none placeholder:text-gray-400 placeholder:font-normal placeholder:text-sm placeholder:uppercase"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className="material-symbols-outlined text-4xl">search</span>
          </div>
        </div>

        {/* Suggested searches */}
        {!hasQuery && topTeams.length > 0 && (
          <div className="space-y-2">
            <p className="font-bold text-xs tracking-widest uppercase text-gray-500">
              Önerilen Aramalar
            </p>
            <div className="flex flex-wrap gap-2">
              {topTeams.map((team) => (
                <button
                  key={team}
                  onClick={() => setQuery(team)}
                  className="px-3 py-1 bg-white border-2 border-black font-bold text-sm uppercase hover:bg-yellow-400 transition-colors"
                >
                  {team}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Results */}
      {hasQuery && (
        <>
          {results.length === 0 ? (
            /* Empty state */
            <section className="p-8 border-4 border-dashed border-gray-400 flex flex-col items-center justify-center text-center space-y-4">
              <span className="material-symbols-outlined text-6xl text-gray-400">
                person_search
              </span>
              <p className="font-bold text-xl uppercase text-gray-400">
                Sporcu bulunamadı.
              </p>
              <p className="text-sm text-gray-500 max-w-xs">
                Lütfen ad, soyad veya takım adı ile tekrar arayın.
              </p>
              <button
                onClick={() => setQuery("")}
                className="px-6 py-2 bg-[#e8e3da] border-2 border-black font-bold text-sm uppercase hover:bg-yellow-400 transition-colors"
              >
                Aramayı Temizle
              </button>
            </section>
          ) : (
            <div className="space-y-6">
              {results.map((athlete) => (
                <AthleteCard key={`${athlete.bib}-${athlete.name}`} athlete={athlete} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
