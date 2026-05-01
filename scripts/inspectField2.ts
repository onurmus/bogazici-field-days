import { fetchXlsxSheetNames, fetchXlsxSheet } from "@/lib/googleSheets";

async function inspect(name: string, fileId: string) {
  const sheets = await fetchXlsxSheetNames(fileId);
  console.log(`\n=== ${name} | Sheets: ${sheets.join(", ")} ===`);
  const rows = await fetchXlsxSheet(fileId, sheets[0]);
  rows.slice(0, 8).forEach((r, i) => console.log(`  Row ${i}:`, JSON.stringify(r)));
}

async function main() {
  await inspect("Cirit",   "1P7JS2Pump4eemUwC1W6Hr3aSKPMyQDjY");
  await inspect("Üçadım",  "1k8sn1_JMVNbZe1etWRQnztZpqXX9hC4i");
}
main().catch(console.error);
