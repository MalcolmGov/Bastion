// Run the safe fixture-based browser/API verification; no personal credentials,
// production databases, browser storage overrides or external artifact folders.
import { spawnSync } from 'node:child_process';
const result = spawnSync(process.execPath, ['tests/e2e/test-end-to-end-complete.mjs'], {stdio:'inherit',env:process.env});
if(result.error) throw result.error;
process.exit(result.status ?? 1);
