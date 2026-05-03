import { loadAllTeamResults } from "@/lib/loadTeamResults";
import TeamResultsPage from "@/components/TeamResultsPage";
import TopNav from "@/components/TopNav";
import SideNav from "@/components/SideNav";

export const revalidate = 120;

export const metadata = { title: "Takım Sıralaması – BÜ 2026" };

export default async function TakimSonuclariPage() {
  let rows: Awaited<ReturnType<typeof loadAllTeamResults>> = [];
  try {
    rows = await loadAllTeamResults();
  } catch (err) {
    console.error("[takim-sonuclari] Failed to load team results:", err);
  }

  return (
    <>
      <TopNav />
      <SideNav />
      <div className="lg:ml-64">
        <TeamResultsPage rows={rows} />
      </div>
    </>
  );
}
