// ---------------------------------------------------------------------------
// Event detail page (Server Component)
// URL: /events/[slug]
// ---------------------------------------------------------------------------

import { notFound } from "next/navigation";
import { getEventConfig } from "@/lib/eventConfig";
import { getMockEvent } from "@/lib/normalizeEvent";
import EventHeader from "@/components/EventHeader";
import HeatCard from "@/components/HeatCard";
import ResultsTable from "@/components/ResultsTable";

// Revalidate every 30 seconds so results appear quickly
export const revalidate = 30;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const config = getEventConfig(slug);

  if (!config) {
    notFound();
  }

  // TODO: Replace with live data once Google Sheets is connected:
  // const heatRows = await fetchSheetRangesBatch(config.spreadsheetId, config.heats.map(h => h.range));
  // const event = normalizeEvent(config, heatRows);
  const event = getMockEvent(config);

  const hasResults = event.heats
    .flatMap((h) => h.athletes)
    .some((a) => a.result !== "");

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <EventHeader event={event} />

      {/* Seriler (Heats) */}
      <section className="mb-8">
        <h2 className="mb-3 text-base font-semibold uppercase tracking-wide text-gray-500">
          Seriler
        </h2>
        <div className="flex flex-col gap-4">
          {event.heats.map((heat) => (
            <HeatCard key={heat.heat} heat={heat} />
          ))}
        </div>
      </section>

      {/* Sonuçlar (Results) */}
      {hasResults && (
        <section>
          <h2 className="mb-3 text-base font-semibold uppercase tracking-wide text-gray-500">
            Genel Sıralama
          </h2>
          <ResultsTable heats={event.heats} />
        </section>
      )}
    </main>
  );
}
