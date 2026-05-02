import { discoverEvent } from "../lib/discoverEvent";
import { fetchXlsxSheet } from "../lib/googleSheets";
import { normalizeRelayEvent } from "../lib/normalizeRelayEvent";

async function main() {
  const d = await discoverEvent("4x100-metre-bayrak-erkek");
  if (!d) { console.log("discoverEvent returned null"); return; }
  console.log("Sheet:", d.heatsSheet);
  const rows = await fetchXlsxSheet(d.driveFileId, d.heatsSheet);
  const event = normalizeRelayEvent({ slug: d.scheduleEntry.slug, title: d.scheduleEntry.title, day: 1, scheduledTime: "", round: "", category: d.scheduleEntry.category, status: "Yaklaşan", heatCount: 1 }, rows);
  event.heats.forEach(heat => {
    console.log(`\nHeat: ${heat.name}`);
    heat.entries.forEach(e => {
      console.log(`  Lane ${e.lane} | ${e.teamName} | ${e.result || "–"} | rank: ${e.heatRank || "–"}`);
      e.runners.forEach((r, i) => console.log(`    ${i+1}. ${r.name} #${r.bib}`));
    });
  });
}
main().catch(console.error);
