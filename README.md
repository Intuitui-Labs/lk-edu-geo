# Sri Lanka Edu & Geo Data (`@intuitui-labs/lk-edu-geo`)

[![CI](https://github.com/intuitui-labs/lk-edu-geo/actions/workflows/ci.yml/badge.svg)](https://github.com/intuitui-labs/lk-edu-geo/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@intuitui-labs/lk-edu-geo?style=flat-square&color=blue)](https://www.npmjs.com/package/@intuitui-labs/lk-edu-geo)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Vitest 5](https://img.shields.io/badge/tested%20with-Vitest%205-729B1B.svg?style=flat-square)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> **Sri Lanka educational zones, divisions, schools, districts, provinces, and GN divisions open dataset and validation engine.**

---

## 📦 Installation & Usage

```bash
pnpm add @intuitui-labs/lk-edu-geo
```

### Tree-Shakable Usage
```typescript
import { 
  getProvinces, 
  getDistricts, 
  getSchools, 
  getSchoolByCensusNo,
  searchSchools 
} from '@intuitui-labs/lk-edu-geo';

const provinces = getProvinces(); // 9 provinces
const districts = getDistricts(); // 25 districts
```

---

## 🛠️ Development & Quality Gates

```bash
pnpm run check-types
pnpm test
pnpm run build
```

---

## 📄 License
MIT © Intuitui Labs & Neev Foundation.
