// ---------------------------------------------------------------------------
// Event detail page (Server Component)
// URL: /events/[slug]
//
// Branches automatically:
//   • Track events (sprints, distance, hurdles, relay) → EventDetailPage (heats)
//   • Field events (jumps, throws) → FieldEventDetailPage (attempt table)
// ---------------------------------------------------------------------------

import { notFound } from "next/navigation";
import { discoverEvent } from "@/lib/discoverEvent";
import { fetchXlsxSheet } from "@/lib/googleSheets";
import { normalizeEventFromXlsx, getMockEvent } from "@/lib/normalizeEvent";
import { normalizeFieldEvent, getMockFieldEvent } from "@/lib/normalizeFieldEvent";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import EventDetailPage from "@/components/EventDetailPage";
import FieldEventDetailPage from "@/components/FieldEventDetailPage";

// Revalidate every 30 seconds so results appear quickly
export const revalidate = 30;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;

  // Discover the Drive file + schedule metadata dynamically
  const discovered = await discoverEvent(slug).catch((err) => {
    console.error(`[EventPage/${slug}] discoverEvent failed:`, err);
    return null;
  });

  if (!discovered) {
    notFound();
  }

  const now = new Date();
  const updatedAt = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  // ── Field events (jumps + throws) ──────────────────────────────────────
  if (discovered.isField) {
    let fieldEvent = getMockFieldEvent(discovered.scheduleEntry);
    try {
      const rows = await fetchXlsxSheet(discovered.driveFileId, discovered.heatsSheet);
      fieldEvent = normalizeFieldEvent(discovered.scheduleEntry, rows);
    } catch (err) {
      console.error(`[EventPage/${slug}] Failed to load field XLSX:`, err);
    }
    return (
      <>
        <TopNav />
        <FieldEventDetailPage event={fieldEvent} updatedAt={updatedAt} />
        <Footer />
      </>
    );
  }

  // ── Track events (heats) ───────────────────────────────────────────────
  let event = getMockEvent(discovered.scheduleEntry);
  try {
    const rows = await fetchXlsxSheet(discovered.driveFileId, discovered.heatsSheet);
    event = normalizeEventFromXlsx(discovered.scheduleEntry, rows);
  } catch (err) {
    console.error(`[EventPage/${slug}] Failed to load XLSX heats:`, err);
  }

  return (
    <>
      <TopNav />
      <EventDetailPage event={event} updatedAt={updatedAt} />
      <Footer />
    </>
  );
}
