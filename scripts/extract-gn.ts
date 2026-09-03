import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

import type { District, DSDivision, GNDivision, Province } from '../src/types.js';

// Phase 9: Source files moved to ./sources/
const FILE_PATH = path.resolve(__dirname, '../sources/lka_admin_boundaries.xlsx');

async function extract() {
  console.log('\uD83E\uDDD0 Extracting High-Fidelity Administrative Hierarchy (Phase 5)...');

  if (!fs.existsSync(FILE_PATH)) {
    throw new Error(`Survey Dept XLSX not found at ${FILE_PATH}`);
  }

  const workbook = XLSX.readFile(FILE_PATH);
  const sheet = workbook.Sheets.lka_admin4;
  const data: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const headers = data[0];
  const rows = data.slice(1);

  const provinces = new Map<string, Province>();
  const districts = new Map<string, District>();
  const dsDivisions = new Map<string, DSDivision>();
  const gnDivisions: GNDivision[] = [];

  const idx = {
    adm4_en: headers.indexOf('adm4_name'),
    adm4_si: headers.indexOf('adm4_name1'),
    adm4_ta: headers.indexOf('adm4_name2'),
    adm4_pcode: headers.indexOf('adm4_pcode'),
    adm4_ref: headers.indexOf('adm4_ref'),
    adm3_en: headers.indexOf('adm3_name'),
    adm3_si: headers.indexOf('adm3_name1'),
    adm3_ta: headers.indexOf('adm3_name2'),
    adm3_pcode: headers.indexOf('adm3_pcode'),
    adm2_en: headers.indexOf('adm2_name'),
    adm2_si: headers.indexOf('adm2_name1'),
    adm2_ta: headers.indexOf('adm2_name2'),
    adm2_pcode: headers.indexOf('adm2_pcode'),
    adm1_en: headers.indexOf('adm1_name'),
    adm1_si: headers.indexOf('adm1_name1'),
    adm1_ta: headers.indexOf('adm1_name2'),
    adm1_pcode: headers.indexOf('adm1_pcode'),
    lat: headers.indexOf('center_lat'),
    lon: headers.indexOf('center_lon'),
  };

  for (const row of rows) {
    const pCode = row[idx.adm1_pcode];
    const dCode = row[idx.adm2_pcode];
    const dsCode = row[idx.adm3_pcode];
    const gnPCode = row[idx.adm4_pcode];

    if (!pCode || !dCode || !dsCode || !gnPCode) continue;

    if (!provinces.has(pCode)) {
      provinces.set(pCode, {
        id: `P_${pCode.replace('LK', '')}`,
        name: row[idx.adm1_en],
        name_si: row[idx.adm1_si],
        name_ta: row[idx.adm1_ta],
      });
    }

    if (!districts.has(dCode)) {
      districts.set(dCode, {
        id: `D_${dCode.replace('LK', '')}`,
        province_id: provinces.get(pCode)!.id,
        name: row[idx.adm2_en],
        name_si: row[idx.adm2_si],
        name_ta: row[idx.adm2_ta],
      });
    }

    if (!dsDivisions.has(dsCode)) {
      dsDivisions.set(dsCode, {
        id: `DS_${dsCode}`,
        district_id: districts.get(dCode)!.id,
        name: row[idx.adm3_en],
        name_si: row[idx.adm3_si],
        name_ta: row[idx.adm3_ta],
        p_code: dsCode,
      });
    }

    gnDivisions.push({
      id: `GN_${gnPCode}`,
      ds_division_id: dsDivisions.get(dsCode)!.id,
      district_id: districts.get(dCode)!.id,
      name: row[idx.adm4_en],
      name_si: row[idx.adm4_si],
      name_ta: row[idx.adm4_ta],
      p_code: gnPCode,
      gn_code: row[idx.adm4_ref] === 'None' ? undefined : row[idx.adm4_ref],
      location: {
        lat: parseFloat(row[idx.lat]),
        lng: parseFloat(row[idx.lon]),
      },
    });
  }

  const result = {
    provinces: Array.from(provinces.values()),
    districts: Array.from(districts.values()),
    dsDivisions: Array.from(dsDivisions.values()),
    gnDivisions,
  };

  fs.writeFileSync('./src/data/admin-hierarchy-official.json', JSON.stringify(result, null, 2));
  console.log(`\u2705 Extraction Complete!`);
  console.log(
    `\uD83D\uDCCA Extracted: ${result.gnDivisions.length} GN units with Multilingual labels and Spatial data.`,
  );
}

extract().catch(console.error);
