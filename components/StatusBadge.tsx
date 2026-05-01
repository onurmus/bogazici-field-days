import type { EventStatus } from "@/lib/types";

interface Props {
  status: EventStatus;
}

const BADGE: Record<EventStatus, { bg: string; text: string; label: string }> = {
  "Yaklaşan":          { bg: "bg-stone-200",   text: "text-zinc-600",  label: "Yaklaşan" },
  "Seriler hazır":     { bg: "bg-blue-100",    text: "text-blue-700",  label: "Seriler Hazır" },
  "Sonuç bekleniyor":  { bg: "bg-yellow-400",  text: "text-zinc-900",  label: "Sonuç Bekleniyor" },
  "Sonuçlandı":        { bg: "bg-green-500",   text: "text-white",     label: "Sonuçlandı" },
};

export default function StatusBadge({ status }: Props) {
  const { bg, text, label } = BADGE[status] ?? BADGE["Yaklaşan"];
  return (
    <span
      className={`inline-block px-4 py-2 ${bg} ${text} font-black uppercase text-xs neo-border whitespace-nowrap`}
      style={{ fontFamily: "var(--font-space-grotesk)" }}
    >
      {label}
    </span>
  );
}
