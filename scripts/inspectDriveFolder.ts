import { google } from "googleapis";
import * as XLSX from "xlsx";

const FOLDER_ID = "1Nf4UAetwA28IZsoPixKLT_ELxJqndOOQ";
const FILE_100M = "1j1axsALYdrCXsoZDs7smyvlltqqNdWaU";

async function main() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not set");
  const credentials = JSON.parse(raw);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  const drive = google.drive({ version: "v3", auth });

  // List all files in folder
  const list = await drive.files.list({
    q: `'${FOLDER_ID}' in parents and trashed = false`,
    fields: "files(id, name, mimeType)",
    orderBy: "name",
    pageSize: 100,
  });
  console.log("\n=== FILES IN FOLDER ===");
  for (const f of list.data.files ?? []) {
    console.log(`  ${f.name}  |  ${f.id}  |  ${f.mimeType}`);
  }

  // Download 100m file and inspect all sheets
  const res = await drive.files.get(
    { fileId: FILE_100M, alt: "media" },
    { responseType: "arraybuffer" }
  );
  const wb = XLSX.read(Buffer.from(res.data as ArrayBuffer), { type: "buffer", cellDates: false });
  console.log("\n=== SHEET NAMES in 100m.xlsx ===", wb.SheetNames);

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: "", raw: true });
    console.log(`\n--- Sheet: ${sheetName} (${rows.length} rows) ---`);
    rows.slice(0, 50).forEach((row, i) => {
      if ((row as string[]).some((c) => c !== "")) console.log(`  [${i}]`, row);
    });
  }
}

main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
