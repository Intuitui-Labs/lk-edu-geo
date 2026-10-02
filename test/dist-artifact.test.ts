import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * G3 real-runtime regression guard for the published artifact.
 *
 * Every other suite in this package imports `../src/index.js` through Vite, which
 * resolves JSON imports at build time. That masks a class of defects that only
 * appear once the compiled `dist/` output is loaded by a real Node ESM runtime --
 * notably missing `with { type: 'json' }` import attributes, which throw
 * ERR_IMPORT_ATTRIBUTE_MISSING. That defect shipped in 1.0.1 because no test ever
 * loaded `dist/`.
 *
 * These tests therefore spawn a real `node` process against the built artifact.
 * They require `pnpm run build` to have run first (CI runs build before test for
 * the `test:artifact` script).
 */
const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const distEntry = join(packageRoot, 'dist', 'index.js');

function importDistViaNode() {
  const distUrl = pathToFileURL(distEntry).href;
  return execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `import(${JSON.stringify(distUrl)}).then((m) => console.log(JSON.stringify(Object.keys(m).sort())))`,
    ],
    {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  ).trim();
}

describe('published dist artifact is loadable by a real Node ESM runtime', () => {
  it('has a built dist/index.js to verify', () => {
    expect(
      existsSync(distEntry),
      'dist/index.js is missing - run `pnpm run build` before `pnpm run test:artifact`',
    ).toBe(true);
  });

  it('imports without ERR_IMPORT_ATTRIBUTE_MISSING', () => {
    let output: string;
    try {
      output = importDistViaNode();
    } catch (error) {
      const stderr = (error as { stderr?: string }).stderr ?? '';
      throw new Error(
        `Loading dist/index.js in a real Node ESM runtime failed.\n` +
          `This usually means a JSON import is missing its \`with { type: 'json' }\` attribute.\n\n${stderr}`,
      );
    }

    const exported = JSON.parse(output) as string[];
    expect(exported.length).toBeGreaterThan(0);
    expect(exported).toContain('getProvinces');
    expect(exported).toContain('getDistricts');
  });
});