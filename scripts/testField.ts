import { discoverEvent } from "@/lib/discoverEvent";
import { fetchXlsxSheet } from "@/lib/googleSheets";
import { normalizeFieldEvent } from "@/lib/normalizeFieldEvent";

async function test(slug: string) {
  const d = await discoverEvent(slug);
  if (!d) { console.log(`${slug}: NOT FOUND`); return; }
  console.log(`\n=== ${slug} | isField: ${d.isField} | sheet: "${d.heatsSheet}" ===`);
  const rows = await fetchXlsxSheet(d.driveFileId, d.heatsSheet);
  const fe = normalizeFieldEvent(d.scheduleEntry, rows);
  console.log(`  isJump: ${fe.isJump} | attempts: ${fe.attemptCount} | athletes: ${fe.results.length}`);
  fe.results.slice(0, 3).forEach(r => console.log(`  [${r.entryOrder}] bib:${r.bib} ${r.athleteName} (${r.team})`));
}

async function main() {
  await test("gulle-atma-erkekler");
  await test("cirit-erkekler");
  await test("ucadim-erkekler");
  await test("100m-erkekler"); // should be isField: false
}
main().catch(console.error);
