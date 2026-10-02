---
title: "@intuitui-labs/lk-edu-geo"
status: "active"
created: 2026-05-07
updated: 2026-05-07
author: "Naveen"
scribe: "opencode"
tags: [packages, lk-edu-geo]
---

# @intuitui-labs/lk-edu-geo

## 1.0.2

### Patch Changes

- fix: add the `with { type: 'json' }` import attribute to the dataset import.
  `moduleResolution: bundler` made `tsc` emit the JSON import verbatim, so
  `dist/index.js` imported `./data/lk-edu-data.json` without the attribute Node's
  ESM loader requires. Bundlers (Vite, Metro) tolerated this, so the defect was
  invisible to source-level tests and shipped in 1.0.1. Consumers importing this
  package from plain Node ESM hit `ERR_IMPORT_ATTRIBUTE_MISSING` at runtime.
- test: add `test/dist-artifact.test.ts`, which loads the built `dist/` entry in
  a real Node ESM runtime. Existing suites import `src/` through Vite and cannot
  observe artifact-only defects.
- ci: run `test:artifact` in CI and in the publish workflow after `build`.
- chore: reorder `prepublishOnly` to build before test so the artifact guard has
  a real artifact to inspect.
- chore: add `.gitattributes` normalizing text files to LF.

## 1.0.1

### Patch Changes

- 3094fc8: Manual checkpoint: baseline for UI Architecture refactor
- 459bddc: chore: architectural remediation and hygiene hardening across monorepo
- a3498ea: chore: maintenance checkpoint
- bec696f: chore: maintenance checkpoint
- 9ac636d: chore: maintenance checkpoint
- abc634e: chore: maintenance checkpoint
- ca67dbd: chore: maintenance checkpoint
- 53607f9: chore: maintenance checkpoint
- b6bd32c: test checkpoint
