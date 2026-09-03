import fs from 'node:fs';
import path from 'node:path';
import * as SLGeo from '@nishansanjuka/srilanka_geographics';
import * as SLPostal from 'srilankan-postalcode-backend';

async function main() {
  console.log('\uD83C\uDF0D Extracting Administrative Hierarchy with Postal Codes...');

  try {
    const provinces = await SLGeo.GetAllProvinces();
    const districts = await SLGeo.GetAllDistricts();
    const cities = await SLGeo.GetAllCities();

    console.log(`\uD83D\uDCE1 Ingesting from @nishansanjuka:
      - ${provinces.length} Provinces
      - ${districts.length} Districts
      - ${cities.length} Cities`);

    // Enriched Hierarchy
    const enrichedDistricts = districts.map((d: any) => {
      // Get cities by district from postal backend
      const postalCities = SLPostal.citiesByDistrict(d.name_en) || [];

      // Match cities from SLGeo with PostalCodes
      const matchedCities = cities
        .filter((c: any) => c.district_id === d.id)
        .map((c: any) => {
          const postalMatch = postalCities.find(
            (pc: any) => pc.city.toLowerCase() === c.name_en.toLowerCase(),
          );
          return {
            ...c,
            postal_code: postalMatch ? postalMatch.code : c.postcode, // Priority to postal-backend
          };
        });

      return {
        ...d,
        units: matchedCities,
      };
    });

    const results = {
      provinces,
      hierarchy: enrichedDistricts,
    };

    const outputDir = path.join(process.cwd(), 'scripts');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    fs.writeFileSync(
      path.join(outputDir, 'admin-hierarchy.json'),
      JSON.stringify(results, null, 2),
      'utf8',
    );

    console.log('\u2728 Hierarchy exported to scripts/admin-hierarchy.json');
    console.log(`\uD83D\uDCCA Statistics:
      - Districts processed: ${enrichedDistricts.length}
      - Total units mapped: ${cities.length}`);
  } catch (err) {
    console.error('\u274C Extraction failed:', err);
  }
}

main();
