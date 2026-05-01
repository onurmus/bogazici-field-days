// ---------------------------------------------------------------------------
// GET /api/events/[slug]
//
// Returns a NormalizedEvent for the given slug, resolved dynamically from
// the schedule XLSX (metadata) and Drive XLSX (heat data). No hardcoded IDs.
//
// Cache strategy: revalidate every 30 seconds so results appear quickly.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { discoverEvent } from "@/lib/discoverEvent";
import { fetchXlsxSheet } from "@/lib/googleSheets";
import { normalizeEventFromXlsx, getMockEvent } from "@/lib/normalizeEvent";

export const revalidate = 30;

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { slug } = await params;

  const discovered = await discoverEvent(slug).catch(() => null);
  if (!discovered) {
    return NextResponse.json({ error: "Etkinlik bulunamadı." }, { status: 404 });
  }

  try {
    const rows = await fetchXlsxSheet(discovered.driveFileId, discovered.heatsSheet);
    const event = normalizeEventFromXlsx(discovered.scheduleEntry, rows);
    return NextResponse.json(event);
  } catch (err) {
    console.error(`[/api/events/${slug}] Failed to load XLSX:`, err);
    return NextResponse.json(getMockEvent(discovered.scheduleEntry));
  }
}
