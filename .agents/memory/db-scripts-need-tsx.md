---
name: Running lib/db scripts directly
description: Why raw `node` fails on scripts that import from the db package's schema/index files, and the fix.
---

The `@workspace/db` package's `src/index.ts` and `src/schema/index.ts` use extensionless relative imports (e.g. `import * as schema from "./schema"`). These resolve fine through bundlers (esbuild/tsc build pipeline) but fail under native Node ESM resolution — even with `node --experimental-strip-types` — with `ERR_MODULE_NOT_FOUND` or `ERR_UNSUPPORTED_DIR_IMPORT`.

**How to apply:** for any one-off script in `lib/db` (e.g. a seed script) that needs to import `./index` or `./schema`, run it with `tsx` (add as a root devDependency via `pnpm add -D -w tsx` if not already present) instead of raw `node`. `tsx` handles Node's stricter ESM extension/directory resolution rules that plain `node` does not.
