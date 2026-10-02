import { describe, expect, expectTypeOf, it, test } from 'vitest';
import {
  getDistricts,
  getMnemonicForDistrict,
  getMnemonicForProvince,
  getProvinces,
  inferFromPostalCode,
  type Province,
} from '../src/index.js';

describe('lk-edu-geo resolution contracts', () => {
  it('enforces static type boundaries on geographic query API (T16 expectTypeOf)', () => {
    expectTypeOf(getProvinces).toBeFunction();
    expectTypeOf(getProvinces).returns.toBeArray();
    expectTypeOf<ReturnType<typeof getProvinces>[0]>().toMatchTypeOf<Province & { mnemonic: string }>();

    expectTypeOf(getDistricts).toBeFunction();
    expectTypeOf(getDistricts).parameter(0).toEqualTypeOf<string | undefined>();

    expectTypeOf(inferFromPostalCode).toBeFunction();
    expectTypeOf(inferFromPostalCode).parameter(0).toBeString();
  });

  test.for([
    { provinceId: 'P_1', expectedMnemonic: 'WP' },
    { provinceId: 'P_2', expectedMnemonic: 'CP' },
    { provinceId: 'P_3', expectedMnemonic: 'SP' },
    { provinceId: 'P_4', expectedMnemonic: 'NP' },
    { provinceId: 'P_5', expectedMnemonic: 'EP' },
    { provinceId: 'P_6', expectedMnemonic: 'NW' },
    { provinceId: 'P_7', expectedMnemonic: 'NC' },
    { provinceId: 'P_8', expectedMnemonic: 'UP' },
    { provinceId: 'P_9', expectedMnemonic: 'SG' },
  ])('parametric mapping of province ID to mnemonic: $provinceId -> $expectedMnemonic (T17 test.for)', ({ provinceId, expectedMnemonic }) => {
    expect(getMnemonicForProvince(provinceId)).toBe(expectedMnemonic);
  });

  test.for([
    { code: '00100', expectedDistrict: 'D_11' },
    { code: '20000', expectedDistrict: 'D_21' },
    { code: '11000', expectedDistrict: 'D_12' },
    { code: '40000', expectedDistrict: 'D_41' },
  ])('parametric postal code prefix inference: code $code -> district $expectedDistrict (T17 test.for)', ({ code, expectedDistrict }) => {
    const res = inferFromPostalCode(code);
    expect(res).not.toBeNull();
    expect(res?.isValid).toBe(true);
    expect(res?.districtId).toBe(expectedDistrict);
  });

  it('correctly maps known district mnemonic keys', () => {
    expect(getMnemonicForDistrict('D_11')).toBe('CO');
    expect(getMnemonicForDistrict('D_21')).toBe('KY');
  });
});

