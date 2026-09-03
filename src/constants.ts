/**
 * ID Prefixes for hierarchical entities
 */
export const ID_PREFIX = {
  PROVINCE: 'P',
  DISTRICT: 'D',
  DS_AREA: 'DS',
  GN_DIVISION: 'GN',
  ZONE: 'Z',
  DIVISION: 'DIV',
  SCHOOL: 'SCH',
} as const;

/**
 * Validation regex for hierarchical IDs
 */
export const ID_PATTERN = {
  PROVINCE: /^P_\d{2}$/,
  DISTRICT: /^D_\d{4}$/,
  DS_AREA: /^DS_\d{6}$/,
  GN_DIVISION: /^GN_\d{8}$/,
  ZONE: /^Z_\d{4}$/,
  DIVISION: /^DIV_\d{6}$/,
  SCHOOL: /^SCH_\d{7}$/,
} as const;

/**
 * Helper to get parent ID from child ID
 */
export function getParentId(id: string): string | null {
  const [prefix, code] = id.split('_');
  if (!prefix || !code) return null;

  switch (prefix) {
    case ID_PREFIX.DISTRICT: // D_0101 -> P_01
      return `${ID_PREFIX.PROVINCE}_${code.slice(0, 2)}`;
    case ID_PREFIX.DS_AREA: // DS_010101 -> D_0101
      return `${ID_PREFIX.DISTRICT}_${code.slice(0, 4)}`;
    case ID_PREFIX.GN_DIVISION: // GN_01010101 -> DS_010101
      return `${ID_PREFIX.DS_AREA}_${code.slice(0, 6)}`;
    case ID_PREFIX.ZONE: // Z_0101 -> P_01
      return `${ID_PREFIX.PROVINCE}_${code.slice(0, 2)}`;
    case ID_PREFIX.DIVISION: // DIV_010101 -> Z_0101
      return `${ID_PREFIX.ZONE}_${code.slice(0, 4)}`;
    default:
      return null;
  }
}
