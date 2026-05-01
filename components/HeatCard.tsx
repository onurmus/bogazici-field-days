import type { Heat } from "@/lib/types";

interface Props {
  heat: Heat;
}

export default function HeatCard({ heat }: Props) {
  const hasResults = heat.athletes.some((a) => a.result !== "");

  return (
    <section className="bg-white neo-border neo-shadow overflow-hidden">
      {/* Heat header */}
      <div className="bg-zinc-900 text-white px-5 py-4 flex justify-between items-center gap-4">
        <h2
          className="font-black text-2xl uppercase tracking-tight"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          {heat.heat}. Seri
        </h2>
        <div className="flex items-center gap-3 shrink-0">
          {heat.scheduledTime && (
            <span
              className="font-black uppercase text-sm px-2 py-0.5 bg-white text-zinc-900 neo-border"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {heat.scheduledTime}
            </span>
          )}
          <span
            className="font-black uppercase text-xs tracking-widest text-yellow-400"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {hasResults ? "Sonuç var" : "Sonuç bekleniyor"}
          </span>
        </div>
      </div>

      {/* Athletes table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-200 border-b-4 border-zinc-900">
              {["Kulvar", "No", "Sporcu", "Takım / Üniversite", "Derece", "Sıra"].map((col, i, arr) => (
                <th
                  key={col}
                  className={`p-3 font-black uppercase text-xs neo-border-none ${i < arr.length - 1 ? "border-r-2 border-zinc-900" : ""}`}
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ fontFamily: "var(--font-inter)" }}>
            {heat.athletes.map((athlete, idx) => {
              const isLast = idx === heat.athletes.length - 1;
              return (
                <tr
                  key={idx}
                  className={`hover:bg-yellow-50 ${!isLast ? "border-b-2 border-zinc-900" : ""}`}
                >
                  <td className="p-3 border-r-2 border-zinc-900 font-black" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                    {athlete.lane}
                  </td>
                  <td className="p-3 border-r-2 border-zinc-900 text-sm">
                    {athlete.bib || "—"}
                  </td>
                  <td className="p-3 border-r-2 border-zinc-900 font-bold uppercase text-sm">
                    {athlete.athleteName || "—"}
                  </td>
                  <td className="p-3 border-r-2 border-zinc-900 text-xs text-zinc-600">
                    {athlete.team || "—"}
                  </td>
                  <td className="p-3 border-r-2 border-zinc-900 text-center font-mono font-bold">
                    {athlete.result || "—"}
                  </td>
                  <td className="p-3 text-center font-bold">
                    {athlete.rank || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
