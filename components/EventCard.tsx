import Link from "next/link";
import type { ScheduleEntry } from "@/lib/types";
import StatusBadge from "./StatusBadge";

interface Props {
  entry: ScheduleEntry;
}

/** Pick a Material Symbol icon and background color based on event name keywords */
function getEventIcon(title: string): { icon: string; bg: string; color: string } {
  const t = title.toLowerCase();
  if (t.includes("gülle") || t.includes("disk") || t.includes("cirit") || t.includes("atma")) {
    return { icon: "sports_handball", bg: "bg-orange-100", color: "text-orange-600" };
  }
  if (t.includes("uzun") || t.includes("üç adım") || t.includes("atlama")) {
    return { icon: "sprint", bg: "bg-blue-100", color: "text-blue-600" };
  }
  if (t.includes("yüksek")) {
    return { icon: "height", bg: "bg-purple-100", color: "text-purple-600" };
  }
  if (t.includes("engelli")) {
    return { icon: "directions_run", bg: "bg-red-100", color: "text-red-600" };
  }
  if (t.includes("bayrak") || t.includes("4x")) {
    return { icon: "flag", bg: "bg-green-100", color: "text-green-600" };
  }
  if (t.includes("1500") || t.includes("3000") || t.includes("5000")) {
    return { icon: "timer", bg: "bg-stone-200", color: "text-zinc-600" };
  }
  // Default track sprint
  return { icon: "directions_run", bg: "bg-yellow-100", color: "text-yellow-600" };
}

export default function EventCard({ entry }: Props) {
  const { icon, bg, color } = getEventIcon(entry.title);

  return (
    <Link
      href={`/events/${entry.slug}`}
      className="bg-white neo-border p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-[#faf7f2] transition-colors group"
    >
      {/* Left: icon + info */}
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 w-full">
        <div className={`w-16 h-16 ${bg} flex items-center justify-center neo-border shrink-0`}>
          <span className={`material-symbols-outlined ${color} text-3xl`}>{icon}</span>
        </div>
        <div>
          <h3
            className="text-2xl md:text-3xl font-black uppercase leading-none mb-1"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {entry.title}
          </h3>
          <div
            className="flex flex-wrap items-center gap-2 md:gap-4 font-bold text-zinc-500 text-sm uppercase tracking-wide"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            <span>{entry.round}</span>
            <span className="w-1 h-1 bg-zinc-400 rounded-full" />
            <span>{entry.heatCount} Seri</span>
          </div>
        </div>
      </div>

      {/* Right: status + arrow */}
      <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end shrink-0">
        <StatusBadge status={entry.status} />
        <button className="w-12 h-12 bg-zinc-900 text-white neo-border flex items-center justify-center group-hover:bg-blue-600 transition-colors shrink-0">
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </Link>
  );
}
