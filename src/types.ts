/**
 * ID Formats:
 * Province: P_XX (e.g., P_01)
 * District: D_XXXX (e.g., D_0101)
 * Postal Unit: POST_XXXXX (e.g., POST_00100)
 * Edu Zone: Z_XXXX (e.g., Z_0101)
 * Edu Division: DIV_XXXXXX (e.g., DIV_010101)
 * School: SCH_XXXXXXX (e.g., SCH_0000001)
 */

export type SchoolType =
  | 'National'
  | 'Provincial'
  | 'Pirivena'
  | 'International'
  | 'Semi-Government';
export type Medium = 'Sinhala' | 'Tamil' | 'English' | 'Mixed';
export type Level = 'Primary' | 'Secondary' | 'Mixed';
export type Gender = 'Boys' | 'Girls' | 'Mixed';
export type Status = 'Active' | 'Closed' | 'Merged';
export type Religion = 'Buddhist' | 'Hindu' | 'Catholic' | 'Christian' | 'Muslim' | 'Other';

export interface Province {
  id: string; // P_1 (Western)
  name: string;
  name_si?: string;
  name_ta?: string;
  mnemonic?: string;
}

export interface District {
  id: string; // D_11 (Colombo)
  province_id: string;
  name: string;
  name_si?: string;
  name_ta?: string;
  mnemonic?: string;
}

/**
 * Administrative: Divisional Secretariat (Phase 4)
 */
export interface DSDivision {
  id: string; // DS_LK1103 (Colombo DS)
  district_id: string;
  name: string;
  name_si?: string;
  name_ta?: string;
  p_code: string; // Official Survey Dept P-Code
}

/**
 * Administrative: Grama Niladhari (Phase 4)
 */
export interface GNDivision {
  id: string; // GN_LK1103005
  ds_division_id: string;
  district_id?: string;
  name: string;
  name_si?: string;
  name_ta?: string;
  p_code: string; // Official Survey Dept P-Code
  gn_code?: string; // e.g. "123A" (if available)
  location?: {
    lat: number;
    lng: number;
  };
}

/**
 * Administrative: Postal Unit (Post Office / Town)
 */
export interface PostalUnit {
  id: string; // POST_00100
  district_id: string;
  city: string;
  postal_code: string;
  location?: {
    lat: number;
    lng: number;
  };
}

/**
 * Educational: Zone (Province -> Zone)
 */
export interface Zone {
  id: string; // Z_101
  province_id: string;
  name: string;
  name_si?: string;
  name_ta?: string;
}

/**
 * Educational: Division (Zone -> Division)
 */
export interface Division {
  id: string; // DIV_10101
  zone_id: string;
  name: string;
  name_si?: string;
  name_ta?: string;
}

export interface School {
  id: string; // SCH_00001
  census_no: string;
  name: string;
  type: string;
  category: string;
  gender: string;
  postal_code: string;
  address: string;
  location: {
    province_id: string;
    district_id: string;
    postal_unit_id?: string;
    ds_division_id?: string; // Linked by P-Code mapping in Phase 4
    gn_division_id?: string; // Linked by P-Code mapping in Phase 4
  };
  jurisdiction: {
    zone_id: string;
    division_id: string;
  };
  contact?: {
    tel?: string;
    email?: string;
  };
  medium?: string;
  grade_span?: string;
  status?: string;
  religion?: string;
  website?: string;
  socio_economic_tier?: string;
  total_students?: number;
  students_boys?: number;
  students_girls?: number;
  total_teachers?: number;
  difficulty_level?: string;
  properties?: Record<string, any>;
}

/**
 * Root data structure for serialized file
 */
export interface LKEduData {
  provinces: Province[];
  districts: District[];
  dsDivisions: DSDivision[];
  gnDivisions: GNDivision[];
  postalUnits: PostalUnit[];
  zones: Zone[];
  divisions: Division[];
  schools: School[];
  metadata: {
    version: string;
    last_updated: string;
    source: string;
    total_schools: number;
    total_gn_divisions: number;
    total_postal_towns?: number;
  };
}
