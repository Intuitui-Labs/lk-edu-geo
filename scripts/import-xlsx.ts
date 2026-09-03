import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';
import type {
  District,
  Division,
  DSDivision,
  GNDivision,
  LKEduData,
  PostalUnit,
  Province,
  School,
  Zone,
} from '../src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants for consistent ID generation
const PREFIX_SCHOOL = 'SCH_';
const PREFIX_ZONE = 'Z_';
const PREFIX_DIVISION = 'DIV_';
const PREFIX_POSTAL = 'POST_';

async function importData() {
  console.log('\uD83D\uDE80 Phase 9: Unified Ingestion (Structured Sources)...');

  // 1. Load Official Administrative Hierarchy (From extraction result)
  const adminRaw = JSON.parse(fs.readFileSync('./src/data/admin-hierarchy-official.json', 'utf8'));
  const provinces: Province[] = adminRaw.provinces;
  const districts: District[] = adminRaw.districts;
  const dsDivisions: DSDivision[] = adminRaw.dsDivisions;
  const gnDivisions: GNDivision[] = adminRaw.gnDivisions;

  // 2. Load Granular Postal Codes (From Phase 9 Sources Path)
  const postalCsvPath = path.resolve(__dirname, '../sources/postalcodes-granular.csv');
  if (!fs.existsSync(postalCsvPath)) {
    throw new Error(`Postal dataset not found at ${postalCsvPath}. Run Phase 5 download first.`);
  }

  const csvContent = fs.readFileSync(postalCsvPath, 'utf8');
  const csvLines = csvContent.split('\n').filter((line: string) => line.trim());
  const postalUnits: PostalUnit[] = [];

  for (const line of csvLines.slice(1)) {
    const parts = line.split(',');
    if (parts.length < 5) continue;

    const [code = '', area = '', districtName = '', lat = '0', lon = '0'] = parts;
    const districtMatch = districts.find(
      (d) => d.name.toLowerCase() === districtName.toLowerCase(),
    );

    postalUnits.push({
      id: `${PREFIX_POSTAL}${code}_${area.replace(/\s+/g, '_')}`,
      district_id: districtMatch?.id || 'D_UNKNOWN',
      city: area,
      postal_code: code.padStart(5, '0'),
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lon),
      },
    });
  }
  console.log(`\uD83D\uDCEC Loaded ${postalUnits.length} granular postal towns.`);

  // 3. Harvest Schools from SQL (From Phase 9 Sources Path)
  const schools: School[] = [];
  const zones = new Map<string, Zone>();
  const divisions = new Map<string, Division>();

  const sqlSourcesPath = path.resolve(__dirname, '../sources');
  const chunkFiles = await glob(path.join(sqlSourcesPath, 'chunk_*.sql').replace(/\\/g, '/'));

  if (chunkFiles.length === 0) {
    console.warn('\u26A0\uFE0F No school SQL chunks found in ./sources/');
  }

  for (const file of chunkFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const regex =
      /\('(\d+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']*)',\s*'([^']*)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+|\w+)\)/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const [
        _full,
        census_no = '',
        name = '',
        address = '',
        tel = '',
        email = '',
        provinceName = '',
        districtName = '',
        zoneName = '',
        divName = '',
        medium = '',
        gender = '',
        category = '',
        type = '',
        grade_span = '',
        difficulty = '',
        students = '0',
      ] = match;

      const pMatch = provinces.find((p) =>
        p.name.toLowerCase().includes(provinceName.toLowerCase()),
      );
      const dMatch = districts.find((d) =>
        d.name.toLowerCase().includes(districtName.toLowerCase()),
      );

      const provinceId = pMatch?.id || 'P_UNKNOWN';
      const districtId = dMatch?.id || 'D_UNKNOWN';

      const zoneKey = `${provinceId}_${zoneName}`;
      if (!zones.has(zoneKey)) {
        const zoneId = `${PREFIX_ZONE}${provinceId.split('_')[1]}${(zones.size + 1).toString().padStart(3, '0')}`;
        zones.set(zoneKey, {
          id: zoneId,
          province_id: provinceId,
          name: zoneName,
        });
      }
      const zoneId = zones.get(zoneKey)!.id;

      const divKey = `${zoneId}_${divName}`;
      if (!divisions.has(divKey)) {
        const divId = `${PREFIX_DIVISION}${zoneId.split('_')[1]}${(divisions.size + 1).toString().padStart(3, '0')}`;
        divisions.set(divKey, { id: divId, zone_id: zoneId, name: divName });
      }
      const divId = divisions.get(divKey)!.id;

      schools.push({
        id: `${PREFIX_SCHOOL}${census_no.padStart(7, '0')}`,
        census_no,
        name,
        type: category, // Mapping to type categories
        category: type,
        gender,
        address,
        postal_code: '',
        medium,
        grade_span,
        total_students: parseInt(students, 10) || 0,
        difficulty_level: difficulty,
        contact: {
          tel: tel !== 'None' ? tel : undefined,
          email: email !== 'None' ? email : undefined,
        },
        location: {
          province_id: provinceId,
          district_id: districtId,
        },
        jurisdiction: {
          zone_id: zoneId,
          division_id: divId,
        },
      });
    }
  }

  // 4. Multi-Layer Enrichment
  console.log(`\uD83D\uDD17 Enriching ${schools.length} schools with granular spatial data...`);
  schools.forEach((s) => {
    const districtTowns = postalUnits.filter((pu) => pu.district_id === s.location.district_id);
    const puMatch =
      districtTowns.find((pu) => s.address.toLowerCase().includes(pu.city.toLowerCase())) ||
      postalUnits.find((pu) => s.address.toLowerCase().includes(pu.city.toLowerCase()));

    if (puMatch) {
      s.postal_code = puMatch.postal_code;
      s.location.postal_unit_id = puMatch.id;
    }
  });

  const finalData: LKEduData = {
    provinces,
    districts,
    dsDivisions,
    gnDivisions,
    postalUnits,
    zones: Array.from(zones.values()),
    divisions: Array.from(divisions.values()),
    schools,
    metadata: {
      version: '1.5.1',
      last_updated: new Date().toISOString(),
      source: 'Ministry of Education & Survey Department & SLWDC Postal Source',
      total_schools: schools.length,
      total_gn_divisions: gnDivisions.length,
      total_postal_towns: postalUnits.length,
    },
  };

  const outputDir = path.resolve(__dirname, '../src/data');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(path.join(outputDir, 'lk-edu-data.json'), JSON.stringify(finalData, null, 2));

  console.log('\u2705 Ingestion (Structured) Complete!');
  console.log(
    `\uD83D\uDCCA Statistics: Schools: ${schools.length}, GN: ${gnDivisions.length}, Postal: ${postalUnits.length}`,
  );
}

importData().catch(console.error);
