"use client";

import { useState } from "react";
import type { NormalizedEvent } from "@/lib/types";
import EventHeader from "./EventHeader";
import HeatCard from "./HeatCard";

interface Props {
  event: NormalizedEvent;
  updatedAt: string;
}

type Tab = "seriler" | "sonuclar" | "siralama";

const TABS: { key: Tab; label: string }[] = [
  { key: "seriler",  label: "Seriler ve Sonuçlar" },
  // { key: "sonuclar", label: "Sonuçlar" },
  // { key: "siralama", label: "Genel Sıralama" },
];

export default function EventDetailPage({ event, updatedAt }: Props) {
  const [tab, setTab] = useState<Tab>("seriler");

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-24">
      <EventHeader event={event} updatedAt={updatedAt} />

      {/* Tabs */}
      <div
        className="flex border-b-4 border-zinc-900 mb-10 overflow-x-auto bg-stone-200"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        {TABS.map((t, i) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={[
              "px-8 py-4 font-black text-xl uppercase tracking-tight",
              i < TABS.length - 1 ? "border-r-4 border-zinc-900" : "",
              tab === t.key
                ? "bg-yellow-400 text-zinc-900"
                : "hover:bg-blue-600 hover:text-white transition-colors",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "seriler" && (
        <div className="grid md:grid-cols-2 gap-8">
          {event.heats.length === 0 ? (
            <p
              className="col-span-2 py-16 text-center font-bold uppercase text-zinc-400"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Henüz seri bilgisi yok.
            </p>
          ) : (
            event.heats.map((heat) => (
              <HeatCard key={heat.heat} heat={heat} />
            ))
          )}
        </div>
      )}

      {tab === "sonuclar" && (
        <div className="py-16 text-center">
          <p
            className="font-black text-2xl uppercase text-zinc-400"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Sonuçlar henüz yok.
          </p>
        </div>
      )}

      {tab === "siralama" && (
        <div className="py-16 text-center">
          <p
            className="font-black text-2xl uppercase text-zinc-400"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Genel sıralama henüz yok.
          </p>
        </div>
      )}
    </main>
  );
}
