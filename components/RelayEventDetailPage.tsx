"use client";

import Link from "next/link";
import type { NormalizedRelayEvent, RelayHeat } from "@/lib/types";
import StatusBadge from "./StatusBadge";

interface Props {
  event: NormalizedRelayEvent;
  updatedAt?: string;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function HeatSection({ heats }: { heats: RelayHeat[] }) {
  const populated = heats.filter((h) => h.entries.length > 0);
  if (!populated.length) return null;
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {populated.map((heat) => (
        <section
          key={heat.name}
          className="bg-white border-4 border-zinc-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
        >
          {/* Heat header */}
          <div className="bg-zinc-900 text-white px-5 py-4 flex justify-between items-center gap-4">
            <h2
              className="font-black text-2xl uppercase tracking-tight"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {heat.name}
            </h2>
            <span
              className="font-black uppercase text-xs tracking-widest text-yellow-400"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {heat.entries.some((e) => e.result) ? "Sonuç var" : "Sonuç bekleniyor"}
            </span>
          </div>

          {/* Teams table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-200 border-b-4 border-zinc-900">
                  {["Kulvar", "Takım", "Sporcular", "Derece", "Sıra"].map((col, i, arr) => (
                    <th
                      key={col}
                      className={`p-3 font-black uppercase text-xs ${i < arr.length - 1 ? "border-r-2 border-zinc-900" : ""}`}
                      style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heat.entries.map((entry, idx) => (
                  <tr
                    key={entry.lane}
                    className={`border-b-2 border-zinc-200 align-top ${idx % 2 === 0 ? "bg-white" : "bg-stone-50"}`}
                  >
                    {/* Lane */}
                    <td className="p-3 font-black text-zinc-400 border-r-2 border-zinc-200 w-12">
                      {entry.lane}
                    </td>
                    {/* Team */}
                    <td className="p-3 font-black border-r-2 border-zinc-200 min-w-[120px]"
                      style={{ fontFamily: "var(--font-space-grotesk)" }}>
                      {entry.teamName}
                    </td>
                    {/* Runners */}
                    <td className="p-3 border-r-2 border-zinc-200">
                      {entry.runners.length > 0 ? (
                        <ol className="list-none space-y-0.5">
                          {entry.runners.map((r, ri) => (
                            <li key={ri} className="text-sm flex gap-2 items-baseline">
                              <span className="text-zinc-400 font-bold w-4 shrink-0">{ri + 1}.</span>
                              <span className="font-bold">{r.name || "—"}</span>
                              {r.bib && (
                                <span className="text-xs text-zinc-400">#{r.bib}</span>
                              )}
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <span className="text-zinc-400 text-sm">—</span>
                      )}
                    </td>
                    {/* Result */}
                    <td className="p-3 font-black border-r-2 border-zinc-200 whitespace-nowrap"
                      style={{ fontFamily: "var(--font-space-grotesk)" }}>
                      {entry.result || "—"}
                    </td>
                    {/* Heat rank */}
                    <td className="p-3 font-bold text-zinc-500 whitespace-nowrap"
                      style={{ fontFamily: "var(--font-space-grotesk)" }}>
                      {entry.heatRank || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function RelayEventDetailPage({ event, updatedAt }: Props) {
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

      {/* ── Heats / results ───────────────────────────────────────── */}
      <HeatSection heats={event.heats} />

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
    </div>
  );
}
