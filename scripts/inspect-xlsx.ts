import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const filePath = 'c:\\Users\\Naween\\projects\\polymath-platform\\lka_admin_boundaries.xlsx';

async function inspect() {
  try {
    console.log(`\uD83E\uDDD0 Detailed Inspection: lka_admin4`);
    const partialWorkbook = XLSX.readFile(filePath, {
      sheetRows: 5,
      sheets: ['lka_admin4'],
    });
    const worksheet = partialWorkbook.Sheets.lka_admin4;
    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (json.length > 0) {
      console.log('HEADERS:', JSON.stringify(json[0], null, 2));
      console.log('ROW 1:', JSON.stringify(json[1], null, 2));
      console.log('ROW 2:', JSON.stringify(json[2], null, 2));
    } else {
      console.log('Empty sheet or sheet not found.');
    }
  } catch (error) {
    console.error('\u274C Error:', error);
  }
}

inspect();
