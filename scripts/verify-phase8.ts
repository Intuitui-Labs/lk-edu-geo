import {
  getDistrictsByProvince,
  getDSDivisionsByDistrict,
  getGNDivisionsByDSDivision,
  getProvinces,
  getSchoolContext,
  searchSchools,
} from '../src/index.js';

console.log('\uD83E\uDDEA Phase 8 Discovery Engine Verification');
console.log('========================================');

// 1. Hierarchical Drilling Test
console.log('\n\uD83C\uDFD7\uFE0F Drilling: Provinces -> Districts -> DS -> GN');
const provinces = getProvinces();
const wp = provinces.find((p) => p.name.includes('Western'));
if (wp) {
  console.log(`\uD83D\uDCCD Province: ${wp.name} (${wp.id})`);

  const districts = getDistrictsByProvince(wp.id);
  const colombo = districts.find((d) => d.name === 'Colombo');
  if (colombo) {
    console.log(`   \u2514\u2500 District: ${colombo.name} (${colombo.id})`);

    const dsDivs = getDSDivisionsByDistrict(colombo.id);
    const thimbirigasyaya = dsDivs.find((ds) => ds.name.includes('Thimbirigasyaya'));
    if (thimbirigasyaya) {
      console.log(
        `      \u2514\u2500 DS Division: ${thimbirigasyaya.name} (${thimbirigasyaya.id})`,
      );

      const gns = getGNDivisionsByDSDivision(thimbirigasyaya.id);
      console.log(`         \u2514\u2500 GN Divisions Count: ${gns.length}`);
      const sampleGn = gns[0];
      if (sampleGn) {
        console.log(`            Sample: ${sampleGn.name} / ${sampleGn.name_si}`);
      }
    }
  }
}

// 2. Context-Aware Search
console.log('\n\uD83D\uDD0D Context-Aware Search Test:');
const options = { districtId: 'D_11', limit: 3 }; // Filter by Colombo District
const results = searchSchools('Hindu', options);
console.log(
  `   searchSchools('Hindu', { districtId: 'Colombo' }): Found ${results.length} results.`,
);
results.forEach((r) => console.log(`   - ${r.name} (Census: ${r.census_no})`));

// 3. Breadcrumbs / Context
console.log('\n\uD83C\uDF5E Breadcrumb Discovery:');
const ctx = getSchoolContext('01001'); // Royal College
if (ctx) {
  console.log(`   School: ${ctx.school.name}`);
  console.log(
    `   Path: ${ctx.province?.name} > ${ctx.district?.name} > ${ctx.zone?.name} > ${ctx.division?.name}`,
  );
  console.log(`   Post: ${ctx.postalTown?.city} (${ctx.postalTown?.postal_code})`);
}

console.log('\n========================================');
console.log('\uD83C\uDF89 Phase 8 Verification Complete!');
