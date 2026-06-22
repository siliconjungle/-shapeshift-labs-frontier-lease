import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import {
  acquireSemanticLease,
  createSemanticLeaseState,
  defineSemanticLeaseScope,
  expireSemanticLeases,
  replaySemanticLeaseEvents
} from '../dist/index.js';

const outIndex = process.argv.indexOf('--out');
const out = outIndex >= 0 ? process.argv[outIndex + 1] : '';
const leasesIndex = process.argv.indexOf('--leases');
const leaseCount = leasesIndex >= 0 ? Number(process.argv[leasesIndex + 1]) : 250;
const started = performance.now();
let state = createSemanticLeaseState({ id: 'bench' });

for (let index = 0; index < leaseCount; index++) {
  const result = acquireSemanticLease(state, {
    ownerId: `worker:${index}`,
    now: index,
    ttlMs: 500,
    scopes: [
      defineSemanticLeaseScope({
        kind: 'export',
        packageId: 'bench',
        path: `src/${index % 40}.ts`,
        name: `symbol${index}`
      })
    ]
  });
  state = result.state;
}

state = expireSemanticLeases(state, { now: 2000 }).state;
const replayed = replaySemanticLeaseEvents(state.events, { id: 'bench' });
const elapsedMs = performance.now() - started;
const result = {
  ok: replayed.leases.length === state.leases.length,
  package: '@shapeshift-labs/frontier-lease',
  scenario: `semantic-lease-${leaseCount}`,
  elapsedMs,
  eventCount: state.events.length,
  leaseCount: state.leases.length
};

if (out) {
  const outPath = path.resolve(out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n');
}

console.log(JSON.stringify(result, null, 2));
