import { buildAthleteIndex } from "@/lib/buildAthleteIndex";

export const revalidate = 120;

export async function GET() {
  try {
    const athletes = await buildAthleteIndex();
    return Response.json({ athletes, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[api/athletes] Failed to build athlete index:", err);
    return Response.json({ athletes: [], generatedAt: new Date().toISOString() }, { status: 500 });
  }
}
