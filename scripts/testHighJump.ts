import { discoverEvent } from "../lib/discoverEvent";
import { fetchXlsxSheet } from "../lib/googleSheets";
import { normalizeHighJumpEvent } from "../lib/normalizeHighJumpEvent";

async function main() {
  const d = await discoverEvent("yuksek-atlama-erkekler");
  console.log("isHighJump:", d?.isHighJump, "| sheet:", d?.heatsSheet);
  if (!d) return;
  const rows = await fetchXlsxSheet(d.driveFileId, d.heatsSheet);
  const ev = normalizeHighJumpEvent(d.scheduleEntry, rows);
  console.log("Status:", ev.status);
  console.log("Heights:", ev.heights.join(", "));
  console.log("Athletes:", ev.results.length);
  ev.results.forEach((r) => {
    const summary = r.heights.map((h) => h.attempts.filter((a) => a !== "").join("") || ".").join("|");
    console.log(" ", (r.rank || r.entryOrder).padEnd(3), r.athleteName.padEnd(30), "->", r.best.padEnd(6), "|", summary);
  });
}
main().catch(console.error);
