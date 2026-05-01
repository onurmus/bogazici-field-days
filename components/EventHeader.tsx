import Link from "next/link";
import type { NormalizedEvent } from "@/lib/types";
import StatusBadge from "./StatusBadge";

interface Props {
  event: NormalizedEvent;
  updatedAt?: string;
}

export default function EventHeader({ event, updatedAt }: Props) {
  return (
    <div className="mb-10">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 group mb-6"
      >
        <span className="material-symbols-outlined bg-zinc-900 text-white p-1 neo-border group-hover:bg-blue-600 transition-colors">
          arrow_back
        </span>
        <span
          className="font-black text-lg uppercase tracking-tight group-hover:underline decoration-2"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Programa Dön
        </span>
      </Link>

      {/* Header card */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white neo-border neo-shadow p-6 md:p-8">
        <div>
          {/* Pills row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className="bg-blue-600 text-white px-3 py-1 text-sm font-black uppercase tracking-widest neo-border"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {event.round}
            </span>
            <StatusBadge status={event.status} />
          </div>

          {/* Title */}
          <h1
            className="text-5xl md:text-7xl font-black uppercase leading-none tracking-tighter mb-4"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {event.title}
          </h1>

          {/* Meta row */}
          <div
            className="flex flex-wrap items-center gap-4 font-black text-lg uppercase opacity-70"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xl">calendar_today</span>
              {event.day}. Gün — {event.scheduledTime}
            </span>
            {updatedAt && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xl">update</span>
                {updatedAt}&apos;te güncellendi
              </span>
            )}
          </div>
        </div>

        {/* Track image placeholder */}
        <div
          className="shrink-0 w-24 h-24 bg-zinc-800 neo-border neo-shadow-yellow hidden md:block"
          aria-hidden
        />
      </div>
    </div>
  );
}
