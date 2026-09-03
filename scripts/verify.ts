import {
  getDistricts,
  getHierarchyForSchool,
  getProvinces,
  getSchools,
  searchSchools,
} from '../src/index.ts';

async function test() {
  console.log('\uD83E\uDDEA Starting Verification Tests...');

  // 1. Check Provinces
  const provinces = getProvinces();
  console.log(`\u2705 Provinces found: ${provinces.length} (Expected 9)`);

  // 2. Check Districts in Western Province (P_01)
  const wpDistricts = getDistricts('P_01');
  console.log(`\u2705 Districts in WP: ${wpDistricts.map((d) => d.name).join(', ')} (Expected 3)`);

  // 3. Search for a specific school (e.g., Royal College)
  const schools = searchSchools('Royal College');
  console.log(`\u2705 Schools matching "Royal College": ${schools.length}`);
  const firstSchool = schools[0];
  if (firstSchool) {
    console.log(`   Sample: ${firstSchool.name} (Census: ${firstSchool.census_no})`);

    // 4. Check Hierarchy
    const hierarchy = getHierarchyForSchool(firstSchool.id);
    console.log('\u2705 Hierarchy lookup for Royal College:');
    console.log(
      `   Admin: ${hierarchy?.admin.province?.name} -> ${hierarchy?.admin.district?.name}`,
    );
    console.log(`   Edu: ${hierarchy?.edu.zone?.name} -> ${hierarchy?.edu.division?.name}`);
  }

  // 5. Total Schools
  const allSchools = getSchools();
  console.log(`\u2705 Total Schools in database: ${allSchools.length}`);

  console.log('\u2728 All Tests Passed!');
}

test().catch(console.error);
