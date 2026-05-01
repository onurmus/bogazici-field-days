import { fetchXlsxSheet } from "@/lib/googleSheets";
import { parseXlsxSeçmeSheet } from "@/lib/normalizeEvent";

async function main() {
  const rows = await fetchXlsxSheet(
    "1j1axsALYdrCXsoZDs7smyvlltqqNdWaU",
    "100m Erkek Seçme"
  );
  const heats = parseXlsxSeçmeSheet(rows);
  console.log(`\nParsed ${heats.length} heats from '100m Erkek Seçme'`);
  heats.forEach((h) => {
    console.log(`  Heat ${h.heat}: ${h.athletes.length} athletes`);
    if (h.athletes.length > 0) {
      const a = h.athletes[0];
      console.log(`    First: lane=${a.lane} bib=${a.bib} name="${a.athleteName}" team="${a.team}"`);
    }
  });
}
main().catch(console.error);
