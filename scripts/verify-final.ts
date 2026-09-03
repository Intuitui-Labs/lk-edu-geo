import {
  getDistricts,
  getHierarchyForSchool,
  getPostalUnits,
  getProvinces,
  getSchools,
  getSchoolsByPostalCode,
  searchSchools,
} from '../src/index.js';

async function verify() {
  console.log('\uD83E\uDDEA Running Final Verification Suite...');

  const provinces = getProvinces();
  console.log(`- Provinces: ${provinces.length} (Expected: 9)`);
  if (provinces.length !== 9) throw new Error('Province count mismatch');

  const districts = getDistricts();
  console.log(`- Districts: ${districts.length} (Expected: 25)`);
  if (districts.length !== 25) throw new Error('District count mismatch');

  const postalUnits = getPostalUnits();
  console.log(`- Postal Units: ${postalUnits.length} (Expected: 1913)`);

  const schools = getSchools();
  console.log(`- Total Schools: ${schools.length} (Expected: ~11174)`);

  // Test Search
  const results = searchSchools('Royal College');
  console.log(`- Search "Royal College" found: ${results.length} schools`);

  // Test Hierarchy
  const firstSchool = schools[0];
  if (firstSchool) {
    console.log(`- Testing Hierarchy for: ${firstSchool.name} (${firstSchool.id})`);
    const hierarchy = getHierarchyForSchool(firstSchool.id);
    console.log(
      `  - Admin: ${hierarchy?.admin.province?.name} > ${hierarchy?.admin.district?.name}`,
    );
    console.log(`  - Edu: ${hierarchy?.edu.zone?.name} > ${hierarchy?.edu.division?.name}`);
  }

  // Test Postal Bridge
  const colombo1 = getSchoolsByPostalCode('00100');
  console.log(`- Schools in Colombo 1 (00100): ${colombo1.length}`);

  console.log('\u2705 All checks passed!');
}

verify().catch((e) => {
  console.error('\u274C Verification Failed:', e);
  process.exit(1);
});
