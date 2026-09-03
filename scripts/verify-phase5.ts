import {
  getMetadata,
  getPostalUnits,
  getSchools,
  searchGNDivisions,
  searchPostalTowns,
} from '../src/index.js';

console.log('\uD83E\uDDEA Phase 5 Final Verification: High-Resolution & Multilingual');
console.log('===========================================================');

const meta = getMetadata();
console.log(`\uD83D\uDCCA Metadata: v${meta.version}`);
console.log(`   - Total Schools: ${meta.total_schools}`);
console.log(`   - GN Divisions: ${meta.total_gn_divisions}`);
console.log(`   - Postal Towns: ${meta.total_postal_towns}`);

// 1. Postal Town Inventory
console.log('\n\uD83D\uDCEC Postal Town Sample (High-Res):');
const pt = getPostalUnits().find((p) => p.city === 'Fort');
if (pt) {
  console.log(`   Name: ${pt.city}`);
  console.log(`   Code: ${pt.postal_code}`);
  console.log(`   District: ${pt.district_id}`);
  console.log(`   Location: ${pt.location?.lat}, ${pt.location?.lng}`);
}

// 2. School Inventory
console.log('\n\uD83C\uDFEB School Sample (Enriched):');
const school = getSchools().find((s) => s.census_no === '01001'); // Sample school
if (school) {
  console.log(`   Name: ${school.name}`);
  console.log(`   Address: ${school.address}`);
  console.log(`   Postal Match: ${school.location.postal_unit_id} (Code: ${school.postal_code})`);
  console.log(
    `   Edu Hierarchy: Zone ${school.jurisdiction.zone_id}, Div ${school.jurisdiction.division_id}`,
  );
}

// 3. Search & Multilingual Test
console.log('\n\uD83D\uDD0D Search Utility Test:');
const searchResults = searchPostalTowns('Colombo');
console.log(`   searchPostalTowns('Colombo'): Found ${searchResults.length} results.`);

const gnSiSearch = searchGNDivisions('\u0D9A\u0DDC\u0DC5\u0DB9'); // Searching for "Colombo" in Sinhala
console.log(
  `   searchGNDivisions('\u0D9A\u0DDC\u0DC5\u0DB9'): Found ${gnSiSearch.length} results.`,
);
const gn = gnSiSearch[0];
if (gn) {
  console.log(`   Match: ${gn.name} / ${gn.name_si} / ${gn.name_ta}`);
  console.log(`   Spatial: ${gn.location?.lat}, ${gn.location?.lng}`);
}

console.log('\n===========================================================');
console.log('\uD83C\uDF89 Phase 5 Verification Complete!');
