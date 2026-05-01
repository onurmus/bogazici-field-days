import { fetchXlsxSheetNames, fetchXlsxSheet } from "@/lib/googleSheets";

// Gülle Atma: 11jX34RUZEBvznBR_abT5C79ic5hzp7iz
// Cirit:      1P7JS2Pump4eemUwC1W6Hr3aSKPMyQDjY
// Üçadım:     1k8sn1_JMVNbZe1etWRQnztZpqXX9hC4i
const FILE_ID = "11jX34RUZEBvznBR_abT5C79ic5hzp7iz"; // Gülle Atma

async function main() {
  const sheets = await fetchXlsxSheetNames(FILE_ID);
  console.log("Sheets:", sheets);
  // Read the first sheet
  const rows = await fetchXlsxSheet(FILE_ID, sheets[0]);
  console.log(`\n=== ${sheets[0]} (first 20 rows) ===`);
  rows.slice(0, 20).forEach((r, i) => console.log(`Row ${i}:`, JSON.stringify(r)));
}
main().catch(console.error);
