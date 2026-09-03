import fs from 'node:fs';
import path from 'node:path';

const DATA_PATH = path.resolve(process.cwd(), 'src/data/lk-edu-data.json');
const OUTPUT_DIR = path.resolve(process.cwd(), 'data/seeds');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generate() {
  console.log('\uD83D\uDE80 Loading master data...');
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  const { provinces, districts, dsDivisions, gnDivisions, postalUnits, schools } = data;

  // 1. GEO HIERARCHY SEED
  console.log('\uD83D\uDCE6 Generating geo_hierarchy seed...');
  let geoSql = `-- Sri Lankan Geo-Hierarchy Seed\n\n`;

  // Provinces
  geoSql += `-- Provinces\nINSERT INTO geo_provinces (id, name, name_si, name_ta) VALUES\n`;
  geoSql += `${provinces
    .map((p: any) => `('${p.id}', '${escape(p.name)}', '${p.name_si || ''}', '${p.name_ta || ''}')`)
    .join(',\n')}\nON CONFLICT (id) DO NOTHING;\n\n`;

  // Districts
  geoSql += `-- Districts\nINSERT INTO geo_districts (id, province_id, name, name_si, name_ta) VALUES\n`;
  geoSql += `${districts
    .map(
      (d: any) =>
        `('${d.id}', '${d.province_id}', '${escape(d.name)}', '${d.name_si || ''}', '${d.name_ta || ''}')`,
    )
    .join(',\n')}\nON CONFLICT (id) DO NOTHING;\n\n`;

  // DS Divisions
  geoSql += `-- DS Divisions\nINSERT INTO geo_ds_divisions (id, district_id, name, name_si, name_ta) VALUES\n`;
  geoSql += `${dsDivisions
    .map(
      (ds: any) =>
        `('${ds.id}', '${ds.district_id}', '${escape(ds.name)}', '${ds.name_si || ''}', '${ds.name_ta || ''}')`,
    )
    .join(',\n')}\nON CONFLICT (id) DO NOTHING;\n\n`;

  fs.writeFileSync(path.join(OUTPUT_DIR, '01_geo_hierarchy_base.sql'), geoSql);

  // 2. GN DIVISIONS (Large - Batching)
  console.log('\uD83D\uDCE6 Generating geo_gn_divisions seed...');
  const GN_BATCH_SIZE = 1000;
  for (let i = 0; i < gnDivisions.length; i += GN_BATCH_SIZE) {
    const batch = gnDivisions.slice(i, i + GN_BATCH_SIZE);
    let gnSql = `-- GN Divisions Batch ${Math.floor(i / GN_BATCH_SIZE) + 1}\n`;
    gnSql += `INSERT INTO geo_gn_divisions (id, ds_division_id, district_id, name, name_si, name_ta, gn_code, location) VALUES\n`;
    gnSql += `${batch
      .map((gn: any) => {
        const lat = gn.location?.lat || 0;
        const lng = gn.location?.lng || 0;
        return `('${gn.id}', '${gn.ds_division_id}', '${gn.district_id}', '${escape(gn.name)}', '${gn.name_si || ''}', '${gn.name_ta || ''}', '${gn.gn_code || ''}', ST_SetSRID(ST_Point(${lng}, ${lat}), 4326))`;
      })
      .join(',\n')}\nON CONFLICT (id) DO NOTHING;\n\n`;
    fs.writeFileSync(
      path.join(
        OUTPUT_DIR,
        `02_geo_gn_batch_${String(Math.floor(i / GN_BATCH_SIZE) + 1).padStart(2, '0')}.sql`,
      ),
      gnSql,
    );
  }

  // 3. POSTAL TOWNS
  console.log('\uD83D\uDCE6 Generating geo_postal_towns seed...');
  let postalSql = `-- Postal Towns\nINSERT INTO geo_postal_towns (id, district_id, city, postal_code, location) VALUES\n`;
  postalSql += `${postalUnits
    .map((pt: any) => {
      const lat = pt.location?.lat || 0;
      const lng = pt.location?.lng || 0;
      return `('${pt.id}', '${pt.district_id}', '${escape(pt.city)}', '${pt.postal_code}', ST_SetSRID(ST_Point(${lng}, ${lat}), 4326))`;
    })
    .join(',\n')}\nON CONFLICT (id) DO NOTHING;\n`;
  fs.writeFileSync(path.join(OUTPUT_DIR, '03_geo_postal_towns.sql'), postalSql);

  // 4. SCHOOLS (Core facts)
  console.log('\uD83D\uDCE6 Generating edu_schools seeds...');
  const SCH_BATCH_SIZE = 500;
  for (let i = 0; i < schools.length; i += SCH_BATCH_SIZE) {
    const batch = schools.slice(i, i + SCH_BATCH_SIZE);
    let schSql = `-- Schools Core Batch ${Math.floor(i / SCH_BATCH_SIZE) + 1}\n`;
    schSql += `INSERT INTO edu_schools (id, census_no, name, gender, category, type_code, status, religion, website, socio_economic_tier, province_id, district_id, gn_division_id, zone_id, division_id, location) VALUES\n`;
    schSql += `${batch
      .map((s: any) => {
        const lat = s.location?.lat || 0;
        const lng = s.location?.lng || 0;
        const religion = s.religion || s.properties?.religion || '';
        const website = s.website || s.contact?.website || s.properties?.website || '';
        const status = s.status || 'Active';
        const tier = s.socio_economic_tier || s.properties?.tier || '';

        return `('${s.id}', '${s.census_no}', '${escape(s.name)}', '${s.gender || 'Mixed'}', '${s.category || ''}', '${s.type || ''}', '${status}', '${escape(religion)}', '${escape(website)}', '${escape(tier)}', '${s.location.province_id}', '${s.location.district_id}', '${s.location.gn_division_id || ''}', '${s.jurisdiction.zone_id}', '${s.jurisdiction.division_id}', ST_SetSRID(ST_Point(${lng}, ${lat}), 4326))`;
      })
      .join(',\n')}\nON CONFLICT (id) DO NOTHING;\n\n`;
    fs.writeFileSync(
      path.join(
        OUTPUT_DIR,
        `04_edu_schools_batch_${String(Math.floor(i / SCH_BATCH_SIZE) + 1).padStart(2, '0')}.sql`,
      ),
      schSql,
    );

    // 5. STATS & CONTACTS (Volatile/Layered)
    let statsSql = `-- Schools Stats Batch ${Math.floor(i / SCH_BATCH_SIZE) + 1}\n`;
    statsSql += `INSERT INTO edu_school_registry_stats (school_id, academic_year, total_students, students_boys, students_girls, total_teachers, medium, grade_span, difficulty_level) VALUES\n`;
    statsSql += `${batch
      .map((s: any) => {
        return `('${s.id}', 2024, ${s.total_students || 0}, ${s.students_boys || 0}, ${s.students_girls || 0}, ${s.total_teachers || 0}, '${escape(s.medium || '')}', '${escape(s.grade_span || '')}', '${escape(s.difficulty_level || '')}')`;
      })
      .join(',\n')}\nON CONFLICT (school_id, academic_year) DO NOTHING;\n\n`;
    fs.writeFileSync(
      path.join(
        OUTPUT_DIR,
        `05_edu_school_stats_batch_${String(Math.floor(i / SCH_BATCH_SIZE) + 1).padStart(2, '0')}.sql`,
      ),
      statsSql,
    );

    // 6. CONTACTS
    const contactsBatches = batch.filter((s: any) => s.contact?.tel || s.contact?.email);
    if (contactsBatches.length > 0) {
      let conSql = `-- Schools Contacts Batch ${Math.floor(i / SCH_BATCH_SIZE) + 1}\n`;
      conSql += `INSERT INTO edu_school_contacts (school_id, contact_type, phone, email, is_primary) VALUES\n`;
      conSql += `${contactsBatches
        .map((s: any) => {
          return `('${s.id}', 'OFFICIAL', ${s.contact.tel ? `'${s.contact.tel}'` : 'NULL'}, ${s.contact.email ? `'${s.contact.email}'` : 'NULL'}, true)`;
        })
        .join(',\n')};\n\n`;
      fs.writeFileSync(
        path.join(
          OUTPUT_DIR,
          `06_edu_school_contacts_batch_${String(Math.floor(i / SCH_BATCH_SIZE) + 1).padStart(2, '0')}.sql`,
        ),
        conSql,
      );
    }
  }

  console.log(`\u2705 SQL Seeds generated in ${OUTPUT_DIR}`);
}

function escapeSql(str: string): string {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

generate().catch(console.error);
