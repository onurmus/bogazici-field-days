// ---------------------------------------------------------------------------
// HeatCard — displays one heat/series with its athlete list.
// ---------------------------------------------------------------------------

import type { Heat } from "@/lib/types";

interface Props {
  heat: Heat;
}

const NOTE_STYLES: Record<string, string> = {
  Q: "font-bold text-green-700",
  q: "font-bold text-green-600",
  PB: "font-bold text-blue-600",
  DNS: "text-gray-400",
  DNF: "text-gray-400",
  DQ: "text-red-500",
};

export default function HeatCard({ heat }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between bg-gray-50 px-4 py-2">
        <span className="text-sm font-semibold text-gray-700">
          {heat.heat}. Seri
        </span>
        {heat.scheduledTime && (
          <span className="text-xs text-gray-500">{heat.scheduledTime}</span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
              <th className="px-3 py-2 text-center">Kul.</th>
              <th className="px-3 py-2 text-center">No</th>
              <th className="px-3 py-2">Sporcu</th>
              <th className="px-3 py-2">Takım</th>
              <th className="px-3 py-2 text-right">Derece</th>
              <th className="px-3 py-2 text-center">Sıra</th>
              <th className="px-3 py-2 text-center">Not</th>
            </tr>
          </thead>
          <tbody>
            {heat.athletes.map((athlete, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
              >
                <td className="px-3 py-2 text-center text-gray-500">
                  {athlete.lane}
                </td>
                <td className="px-3 py-2 text-center text-gray-500">
                  {athlete.bib}
                </td>
                <td className="px-3 py-2 font-medium text-gray-900">
                  {athlete.athleteName}
                </td>
                <td className="px-3 py-2 text-gray-500">{athlete.team}</td>
                <td className="px-3 py-2 text-right font-mono font-semibold text-gray-900">
                  {athlete.result || "—"}
                </td>
                <td className="px-3 py-2 text-center text-gray-600">
                  {athlete.rank || "—"}
                </td>
                <td
                  className={`px-3 py-2 text-center ${NOTE_STYLES[athlete.note] ?? "text-gray-500"}`}
                >
                  {athlete.note || ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
