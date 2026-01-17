# CLI

## Status in v0.2

The package declares a binary in `package.json`:

```json
"bin": { "palette-kit": "./dist/cli.js" }
```

However, the repository **does not contain** `src/cli.*` or `dist/cli.js` in v0.2. As a result, there is no implementable CLI command, flags, or behavior to document.

**Status**: declared but not shipped in this repo tag.

**Action**: either remove the `bin` entry from `package.json` or add a real CLI implementation.

If you installed from npm and a CLI is available there, note that this document is **repo-tag specific** and reflects the v0.2 source tree.

If a CLI is added in a future version, this document will be updated to match the actual implementation.
