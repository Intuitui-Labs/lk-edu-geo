import dataRaw from '@intuitui-labs/lk-edu-geo/data/lk-edu-data.json';

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
} from '@intuitui-labs/lk-edu-geo/types.js';

export type {
  District,
  Division,
  DSDivision,
  GNDivision,
  LKEduData,
  PostalUnit,
  Province,
  School,
  Zone,
} from '@intuitui-labs/lk-edu-geo/types.js';

const data = dataRaw as unknown as LKEduData;

const DISTRICT_ID_TO_MNEMONIC: Record<string, string> = {
  D_11: 'CO',
  D_12: 'GA',
  D_13: 'KL',
  D_21: 'KY',
  D_22: 'MT',
  D_23: 'NE',
  D_31: 'KU',
  D_32: 'PU',
  D_41: 'JA',
  D_42: 'KI',
  D_43: 'MN',
  D_44: 'VA',
  D_45: 'MU',
  D_51: 'AN',
  D_52: 'PO',
  D_61: 'BD',
  D_62: 'MO',
  D_71: 'RG',
  D_72: 'KE',
  D_81: 'GL',
  D_82: 'MA',
  D_83: 'HA',
  D_53: 'BT', // Batticaloa
  D_54: 'AM', // Ampara
  D_55: 'TR', // Trincomalee
};

const PROVINCE_ID_TO_MNEMONIC: Record<string, string> = {
  P_1: 'WP',
  P_2: 'CP',
  P_3: 'SP',
  P_4: 'NP',
  P_5: 'EP',
  P_6: 'NW',
  P_7: 'NC',
  P_8: 'UP',
  P_9: 'SG',
};

/**
 * ADMINISTRATIVE QUERIES (Layer 1 - Hierarchy Drilling)
 */

export const getProvinces = (): (Province & { mnemonic: string })[] =>
  data.provinces.map((p) => ({
    ...p,
    mnemonic: PROVINCE_ID_TO_MNEMONIC[p.id] || p.id,
  }));

export const getProvinceById = (id: string): Province | undefined =>
  data.provinces.find((p) => p.id === id);

/**
 * Filtered Drilling: Get children by Parent ID
 */
export const getDistrictsByProvince = (provinceId: string): District[] =>
  data.districts.filter((d) => d.province_id === provinceId);

export const getDSDivisionsByDistrict = (districtId: string): DSDivision[] =>
  data.dsDivisions.filter((ds) => ds.district_id === districtId);

export const getGNDivisionsByDSDivision = (dsId: string): GNDivision[] =>
  data.gnDivisions.filter((gn) => gn.ds_division_id === dsId);

/**
 * Flat Accessors (Optional use)
 */
export const getDistricts = (provinceId?: string) => {
  const districts = provinceId
    ? data.districts.filter((d) => d.province_id === provinceId)
    : data.districts;

  return districts.map((d) => ({
    ...d,
    mnemonic: DISTRICT_ID_TO_MNEMONIC[d.id] || d.id,
  }));
};

export const getAllDSDivisions = () => data.dsDivisions;
export const getDSDivisions = (districtId?: string) =>
  districtId ? data.dsDivisions.filter((ds) => ds.district_id === districtId) : data.dsDivisions;

export const getAllGNDivisions = () => data.gnDivisions;
export const getGNDivisions = (dsId?: string) =>
  dsId ? data.gnDivisions.filter((gn) => gn.ds_division_id === dsId) : data.gnDivisions;

/**
 * POSTAL QUERIES
 */

export const getPostalUnitsByDistrict = (districtId: string): PostalUnit[] =>
  data.postalUnits.filter((pu) => pu.district_id === districtId);

export const getPostalUnitById = (id: string): PostalUnit | undefined =>
  data.postalUnits.find((pu) => pu.id === id);

export const getPostalUnitByCode = (code: string): PostalUnit | undefined =>
  data.postalUnits.find((pu) => pu.postal_code === code);

/**
 * Infers location details from a postal code string.
 * This is the "proper" version of the previous graphics/PostalCodes logic.
 */
export const inferFromPostalCode = (code: string) => {
  if (!code || code.length < 2) return null;

  // 1. Try exact match
  const unit = getPostalUnitByCode(code);
  if (unit) {
    return {
      isValid: true,
      districtId: unit.district_id,
      city: unit.city,
    };
  }

  // 2. Try prefix match (first 2 digits correspond to districts in SL)
  const prefix = code.substring(0, 2);
  const districtPrefixMap: Record<string, string> = {
    '00': 'D_11', // Colombo
    '10': 'D_11', // Colombo
    '11': 'D_12', // Gampaha
    '12': 'D_13', // Kalutara
    '20': 'D_21', // Kandy
    '21': 'D_22', // Matale
    '22': 'D_23', // Nuwara Eliya
    '30': 'D_31', // Kurunegala
    '31': 'D_31', // Kurunegala
    '32': 'D_32', // Puttalam
    '40': 'D_41', // Jaffna
    '41': 'D_42', // Kilinochchi
    '42': 'D_43', // Mannar
    '43': 'D_44', // Vavuniya
    '44': 'D_45', // Mullaitivu
    '50': 'D_51', // Anuradhapura
    '51': 'D_52', // Polonnaruwa
    '60': 'D_61', // Badulla
    '61': 'D_62', // Moneragala
    '70': 'D_71', // Ratnapura
    '71': 'D_72', // Kegalle
    '80': 'D_81', // Galle
    '81': 'D_82', // Matara
    '82': 'D_83', // Hambantota
  };

  const districtId = districtPrefixMap[prefix];
  if (districtId) {
    return {
      isValid: true,
      districtId,
      city: '', // Cannot infer exact city from prefix
    };
  }

  return null;
};

/**
 * Maps official district IDs (D_11) to platform mnemonic IDs (CO).
 */
export const getMnemonicForDistrict = (id: string): string => DISTRICT_ID_TO_MNEMONIC[id] || id;

/**
 * Maps official province IDs (P_1) to platform mnemonic IDs (WP).
 */
export const getMnemonicForProvince = (id: string): string => PROVINCE_ID_TO_MNEMONIC[id] || id;

/**
 * EDUCATIONAL QUERIES (Layer 2)
 */

export const getZonesByProvince = (provinceId: string): Zone[] =>
  data.zones.filter((z) => z.province_id === provinceId);

export const getDivisionsByZone = (zoneId: string): Division[] =>
  data.divisions.filter((d) => d.zone_id === zoneId);

export const getZoneById = (id: string): Zone | undefined => data.zones.find((z) => z.id === id);

/**
 * SCHOOL DISCOVERY ENGINE
 */

export interface SchoolFilter {
  provinceId?: string;
  districtId?: string;
  zoneId?: string;
  divisionId?: string;
  dsDivisionId?: string;
  gnDivisionId?: string;
  type?: string;
  category?: string;
}

const SCHOOL_FILTER_ACCESSORS: Record<keyof SchoolFilter, (school: School) => unknown> = {
  provinceId: (s) => s.location.province_id,
  districtId: (s) => s.location.district_id,
  zoneId: (s) => s.jurisdiction.zone_id,
  divisionId: (s) => s.jurisdiction.division_id,
  dsDivisionId: (s) => s.location.ds_division_id,
  gnDivisionId: (s) => s.location.gn_division_id,
  type: (s) => s.type,
  category: (s) => s.category,
};

/**
 * Versatile school discovery with multi-vector filtering
 */
export const getSchools = (filter?: SchoolFilter): School[] => {
  if (!filter) return data.schools;
  const activeFilters = Object.entries(filter) as [keyof SchoolFilter, unknown][];
  return data.schools.filter((school) =>
    activeFilters.every(([field, value]) => SCHOOL_FILTER_ACCESSORS[field](school) === value),
  );
};

export const getSchoolByCensusNo = (censusNo: string): School | undefined =>
  data.schools.find((s) => s.census_no === censusNo);

/**
 * SEARCH & AUTOCOMPLETE (Context-Aware)
 */

export interface SearchOptions {
  districtId?: string;
  dsId?: string;
  zoneId?: string;
  limit?: number;
}

/**
 * Optimized search for postal towns / areas
 */
export const searchPostalTowns = (query: string, options?: SearchOptions): PostalUnit[] => {
  const normQuery = query.toLowerCase().trim();
  if (!normQuery) return [];
  return data.postalUnits
    .filter((pu) => {
      if (options?.districtId && pu.district_id !== options.districtId) return false;
      return (
        (pu.city?.toLowerCase() || '').includes(normQuery) ||
        (pu.postal_code || '').includes(normQuery)
      );
    })
    .slice(0, options?.limit || 20);
};

/**
 * Search for schools (Name or Census No)
 */
export const searchSchools = (query: string, options?: SearchOptions): School[] => {
  const normQuery = query.toLowerCase().trim();
  if (!normQuery) return [];
  return data.schools
    .filter((s) => {
      if (options?.districtId && s.location.district_id !== options.districtId) return false;
      if (options?.zoneId && s.jurisdiction.zone_id !== options.zoneId) return false;
      return (
        (s.name?.toLowerCase() || '').includes(normQuery) || (s.census_no || '').includes(normQuery)
      );
    })
    .slice(0, options?.limit || 20);
};

/**
 * Contextual Autocomplete for GN Divisions (Multilingual SI/TA)
 */
export const searchGNDivisions = (query: string, options?: SearchOptions): GNDivision[] => {
  const normQuery = query.toLowerCase().trim();
  if (!normQuery) return [];
  return data.gnDivisions
    .filter((gn) => {
      if (options?.dsId && gn.ds_division_id !== options.dsId) return false;
      return (
        (gn.name?.toLowerCase() || '').includes(normQuery) ||
        (gn.name_si || '').includes(normQuery) ||
        (gn.name_ta || '').includes(normQuery) ||
        (gn.p_code || '').includes(normQuery)
      );
    })
    .slice(0, options?.limit || 20);
};

/**
 * BREADCRUMBS & CONTEXT UTILITIES
 */

/**
 * Resolves the full path for a school for display in summaries or breadcrumbs
 */
export const getPostalUnits = () => data.postalUnits;

/**
 * Resolves the full path for a school for display in summaries or breadcrumbs
 */
export const getSchoolContext = (censusNo: string) => {
  const school = data.schools.find((s) => s.census_no === censusNo);
  if (!school) return null;

  return {
    school,
    province: data.provinces.find((p) => p.id === school.location.province_id),
    district: data.districts.find((d) => d.id === school.location.district_id),
    zone: data.zones.find((z) => z.id === school.jurisdiction.zone_id),
    division: data.divisions.find((div) => div.id === school.jurisdiction.division_id),
    postalTown: data.postalUnits.find((pu) => pu.id === school.location.postal_unit_id),
  };
};

/**
 * Resolves the administrative and educational hierarchy for a school.
 */
export const getHierarchyForSchool = (schoolId: string) => {
  const school = data.schools.find((s) => s.id === schoolId);
  if (!school) return null;

  return {
    school,
    admin: {
      province: data.provinces.find((p) => p.id === school.location.province_id),
      district: data.districts.find((d) => d.id === school.location.district_id),
    },
    edu: {
      zone: data.zones.find((z) => z.id === school.jurisdiction.zone_id),
      division: data.divisions.find((div) => div.id === school.jurisdiction.division_id),
    },
  };
};

/**
 * Returns all schools located in a specific postal code area.
 */
export const getSchoolsByPostalCode = (postalCode: string): School[] => {
  return data.schools.filter((s) => s.postal_code === postalCode);
};

/**
 * Metadata & Diagnostics
 */
export const getMetadata = () => data.metadata;
