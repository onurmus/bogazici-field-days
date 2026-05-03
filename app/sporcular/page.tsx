import { buildAthleteIndex } from "@/lib/buildAthleteIndex";
import AthleteSearchPage from "@/components/AthleteSearchPage";

export const revalidate = 120;

export default async function SporcularPage() {
  let athletes: Awaited<ReturnType<typeof buildAthleteIndex>> = [];
  try {
    athletes = await buildAthleteIndex();
  } catch (err) {
    console.error("[sporcular] Failed to build athlete index:", err);
  }

  return <AthleteSearchPage athletes={athletes} />;
}
