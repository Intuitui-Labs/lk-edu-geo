import { describe, it, expect } from 'vitest';
import { getProvinces, getDistricts } from '../src/index.js';

describe('@intuitui-labs/lk-edu-geo (G0 Contract & Data Verification Tests)', () => {
  it('contains all 9 provinces of Sri Lanka', () => {
    const provinces = getProvinces();
    expect(provinces.length).toBe(9);
  });

  it('contains all 25 districts of Sri Lanka', () => {
    const districts = getDistricts();
    expect(districts.length).toBe(25);
  });
});
