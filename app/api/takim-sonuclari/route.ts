import { loadAllTeamResults } from "@/lib/loadTeamResults";

export const revalidate = 120;

export async function GET() {
  try {
    const rows = await loadAllTeamResults();
    return Response.json({ rows, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[api/takim-sonuclari] Failed to load team results:", err);
    return Response.json({ rows: [], generatedAt: new Date().toISOString() }, { status: 500 });
  }
}
