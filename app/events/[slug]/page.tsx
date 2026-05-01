// ---------------------------------------------------------------------------
// Event detail page (Server Component)
// URL: /events/[slug]
//
// Branches automatically:
//   • Field events (jumps, throws) → FieldEventDetailPage (attempt table)
//   • Relay events (4×100, 4×400) → RelayEventDetailPage (team results)
//   • Track events (sprints, distance, hurdles, finals) → EventDetailPage (heats)
// ---------------------------------------------------------------------------

import { notFound } from "next/navigation";
import { discoverEvent } from "@/lib/discoverEvent";
import { fetchXlsxSheet } from "@/lib/googleSheets";
import { normalizeEventFromXlsx, getMockEvent } from "@/lib/normalizeEvent";
import { normalizeFieldEvent, getMockFieldEvent } from "@/lib/normalizeFieldEvent";
import { normalizeRelayEvent, getMockRelayEvent } from "@/lib/normalizeRelayEvent";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import EventDetailPage from "@/components/EventDetailPage";
import FieldEventDetailPage from "@/components/FieldEventDetailPage";
import RelayEventDetailPage from "@/components/RelayEventDetailPage";

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
    // Mixed-gender (Kadın-Erkek): render Kadınlar and Erkekler as two sections
    if (discovered.additionalSheet) {
      const kadinEntry = {
        ...discovered.scheduleEntry,
        category: "Kadın",
        title: discovered.scheduleEntry.title.replace(/\s*Kadın-?Erkek$/i, " Kadınlar"),
      };
      const erkekEntry = {
        ...discovered.scheduleEntry,
        category: "Erkek",
        title: discovered.scheduleEntry.title.replace(/\s*Kadın-?Erkek$/i, " Erkekler"),
      };
      let kadinEvent = getMockFieldEvent(kadinEntry);
      let erkekEvent = getMockFieldEvent(erkekEntry);
      try {
        const rows = await fetchXlsxSheet(discovered.driveFileId, discovered.heatsSheet);
        kadinEvent = normalizeFieldEvent(kadinEntry, rows);
      } catch (err) {
        console.error(`[EventPage/${slug}] Failed to load field XLSX (kadın):`, err);
      }
      try {
        const rows = await fetchXlsxSheet(discovered.driveFileId, discovered.additionalSheet);
        erkekEvent = normalizeFieldEvent(erkekEntry, rows);
      } catch (err) {
        console.error(`[EventPage/${slug}] Failed to load field XLSX (erkek):`, err);
      }
      return (
        <>
          <TopNav />
          <FieldEventDetailPage event={kadinEvent} updatedAt={updatedAt} />
          <FieldEventDetailPage event={erkekEvent} updatedAt={updatedAt} />
          <Footer />
        </>
      );
    }

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

  // ── Relay events (4×100, 4×400) ───────────────────────────────────────
  if (discovered.isRelay) {
    let relayEvent = getMockRelayEvent(discovered.scheduleEntry);
    try {
      const rows = await fetchXlsxSheet(discovered.driveFileId, discovered.heatsSheet);
      relayEvent = normalizeRelayEvent(discovered.scheduleEntry, rows);
    } catch (err) {
      console.error(`[EventPage/${slug}] Failed to load relay XLSX:`, err);
    }
    return (
      <>
        <TopNav />
        <RelayEventDetailPage event={relayEvent} updatedAt={updatedAt} />
        <Footer />
      </>
    );
  }

  // ── Track events (heats, including finals) ────────────────────────────
  // Mixed-gender (Kadın-Erkek) track events: render two sections
  if (discovered.additionalSheet) {
    const kadinEntry = {
      ...discovered.scheduleEntry,
      category: "Kadın",
      title: discovered.scheduleEntry.title.replace(/\s*Kadın-?Erkek$/i, " Kadınlar"),
    };
    const erkekEntry = {
      ...discovered.scheduleEntry,
      category: "Erkek",
      title: discovered.scheduleEntry.title.replace(/\s*Kadın-?Erkek$/i, " Erkekler"),
    };
    let kadinEvent = getMockEvent(kadinEntry);
    let erkekEvent = getMockEvent(erkekEntry);
    try {
      const rows = await fetchXlsxSheet(discovered.driveFileId, discovered.heatsSheet);
      kadinEvent = normalizeEventFromXlsx(kadinEntry, rows);
    } catch (err) {
      console.error(`[EventPage/${slug}] Failed to load XLSX heats (kadın):`, err);
    }
    try {
      const rows = await fetchXlsxSheet(discovered.driveFileId, discovered.additionalSheet);
      erkekEvent = normalizeEventFromXlsx(erkekEntry, rows);
    } catch (err) {
      console.error(`[EventPage/${slug}] Failed to load XLSX heats (erkek):`, err);
    }
    return (
      <>
        <TopNav />
        <EventDetailPage event={kadinEvent} updatedAt={updatedAt} />
        <EventDetailPage event={erkekEvent} updatedAt={updatedAt} />
        <Footer />
      </>
    );
  }

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
