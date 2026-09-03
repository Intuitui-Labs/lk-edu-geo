declare module 'srilankan-postalcode-backend' {
  export function citiesByDistrict(district: string): { city: string; code: string }[];
  export function getAllCities(): { city: string; code: string }[];
  export function getCode(city: string): string;
}
