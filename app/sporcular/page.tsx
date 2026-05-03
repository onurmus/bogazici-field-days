import { buildAthleteIndex } from "@/lib/buildAthleteIndex";
import AthleteSearchPage from "@/components/AthleteSearchPage";
import TopNav from "@/components/TopNav";
import SideNav from "@/components/SideNav";

export const revalidate = 120;

export const metadata = { title: "Sporcu Ara – BÜ 2026" };

export default async function SporcularPage() {
  let athletes: Awaited<ReturnType<typeof buildAthleteIndex>> = [];
  try {
    athletes = await buildAthleteIndex();
  } catch (err) {
    console.error("[sporcular] Failed to build athlete index:", err);
  }

  return (
    <>
      <TopNav />
      <SideNav />
      <div className="lg:ml-64">
        <AthleteSearchPage athletes={athletes} />
      </div>
    </>
  );
}
