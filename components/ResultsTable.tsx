// ---------------------------------------------------------------------------
// ResultsTable — flat ranked results list derived from all heats combined.
// ---------------------------------------------------------------------------

import type { Athlete, Heat } from "@/lib/types";

interface Props {
  heats: Heat[];
}

const NOTE_STYLES: Record<string, string> = {
  Q: "rounded bg-green-100 px-1.5 py-0.5 text-xs font-bold text-green-700",
  q: "rounded bg-green-50 px-1.5 py-0.5 text-xs font-bold text-green-600",
  PB: "rounded bg-blue-100 px-1.5 py-0.5 text-xs font-bold text-blue-600",
  DNS: "rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-400",
  DNF: "rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-400",
  DQ: "rounded bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-500",
};

function mergeAndRank(heats: Heat[]): (Athlete & { heatNumber: number })[] {
  const all = heats.flatMap((h) =>
    h.athletes.map((a) => ({ ...a, heatNumber: h.heat }))
  );

  const withResult = all.filter(
    (a) => a.result !== "" && !["DNS", "DNF", "DQ"].includes(a.note)
  );
  const withoutResult = all.filter(
    (a) => a.result === "" || ["DNS", "DNF", "DQ"].includes(a.note)
  );

  withResult.sort(
    (a, b) =>
      parseFloat(a.result.replace(",", ".")) -
      parseFloat(b.result.replace(",", "."))
  );

  return [
    ...withResult.map((a, i) => ({ ...a, rank: String(i + 1) })),
    ...withoutResult,
  ];
}

export default function ResultsTable({ heats }: Props) {
  const athletes = mergeAndRank(heats);

  if (athletes.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        Henüz sonuç girilmedi.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
              <th className="px-3 py-2 text-center">Sıra</th>
              <th className="px-3 py-2 text-center">Kul.</th>
              <th className="px-3 py-2 text-center">No</th>
              <th className="px-3 py-2">Sporcu</th>
              <th className="px-3 py-2">Takım</th>
              <th className="px-3 py-2 text-center">Seri</th>
              <th className="px-3 py-2 text-right">Derece</th>
              <th className="px-3 py-2 text-center">Not</th>
            </tr>
          </thead>
          <tbody>
            {athletes.map((athlete, idx) => (
              <tr
                key={idx}
                className={`border-b border-gray-50 last:border-0 hover:bg-gray-50 ${
                  athlete.rank === "1" ? "bg-yellow-50" : ""
                }`}
              >
                <td className="px-3 py-2 text-center font-bold text-gray-700">
                  {athlete.rank || "—"}
                </td>
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
                <td className="px-3 py-2 text-center text-gray-400">
                  {athlete.heatNumber}
                </td>
                <td className="px-3 py-2 text-right font-mono font-semibold text-gray-900">
                  {athlete.result || athlete.note || "—"}
                </td>
                <td className="px-3 py-2 text-center">
                  {athlete.note && (
                    <span className={NOTE_STYLES[athlete.note] ?? "text-gray-500 text-xs"}>
                      {athlete.note}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
