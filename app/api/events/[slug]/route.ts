// ---------------------------------------------------------------------------
// GET /api/events/[slug]
//
// Returns a NormalizedEvent for the given slug.
//
// Cache strategy: revalidate every 30 seconds so results appear quickly.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { getEventConfig } from "@/lib/eventConfig";
import { getMockEvent } from "@/lib/normalizeEvent";
// TODO: import { fetchSheetRangesBatch } from "@/lib/googleSheets";
// TODO: import { normalizeEvent } from "@/lib/normalizeEvent";

export const revalidate = 30;

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { slug } = await params;
  const config = getEventConfig(slug);

  if (!config) {
    return NextResponse.json({ error: "Etkinlik bulunamadı." }, { status: 404 });
  }

  // TODO: Replace with live data:
  // const heatRows = await fetchSheetRangesBatch(
  //   config.spreadsheetId,
  //   config.heats.map((h) => h.range)
  // );
  // const event = normalizeEvent(config, heatRows);

  const event = getMockEvent(config);
  return NextResponse.json(event);
}
