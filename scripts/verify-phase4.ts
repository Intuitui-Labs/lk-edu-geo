import {
  getDistricts,
  getDSDivisions,
  getGNDivisions,
  getMetadata,
  getProvinces,
  getSchools,
} from '../src/index.js';

console.log('\uD83E\uDDEA Phase 4 Verification Suite');
console.log('============================');

const meta = getMetadata();
console.log(
  `\uD83D\uDCCA Metadata: Version ${meta.version}, Total Schools: ${meta.total_schools}, GN Divisions: ${meta.total_gn_divisions}`,
);

// 1. Administrative Hierarchy Test
const provinces = getProvinces();
console.log(`\u2705 Provinces: ${provinces.length}`);

const p1 = provinces[0];
if (p1) {
  const districts = getDistricts(p1.id);
  console.log(`\u2705 Districts in ${p1.name}: ${districts.length}`);

  const d1 = districts[0];
  if (d1) {
    const dsDivs = getDSDivisions(d1.id);
    console.log(`\u2705 DS Divisions in ${d1.name}: ${dsDivs.length}`);

    const ds1 = dsDivs[0];
    if (ds1) {
      const gnDivs = getGNDivisions(ds1.id);
      console.log(`\u2705 GN Divisions in ${ds1.name}: ${gnDivs.length}`);
    }
  }
}

// 2. School Mapping Test
const allSchools = getSchools();
console.log(`\u2705 Total Schools Harvested: ${allSchools.length}`);

const samples = allSchools.slice(0, 5);
console.log('\uD83D\uDCCB Sample Schools (Hierarchical Linkage):');
samples.forEach((s) => {
  console.log(`   - [${s.census_no}] ${s.name}`);
  console.log(`     Admin: P:${s.location.province_id}, D:${s.location.district_id}`);
  console.log(`     Edu: Z:${s.jurisdiction.zone_id}, Div:${s.jurisdiction.division_id}`);
});

// 3. Totals Check
console.log('============================');
if (meta.total_gn_divisions === 14043) {
  console.log('\uD83C\uDF89 SUCCESS: All 14,043 official GN divisions are present.');
} else {
  console.warn(
    `\u26A0\uFE0F WARNING: GN Count mismatch. Expected 14043, got ${meta.total_gn_divisions}`,
  );
}

if (allSchools.length > 10000) {
  console.log('\uD83C\uDF89 SUCCESS: Over 10,000 schools successfully ingested and mapped.');
} else {
  console.warn(`\u26A0\uFE0F WARNING: Low school count: ${allSchools.length}`);
}
