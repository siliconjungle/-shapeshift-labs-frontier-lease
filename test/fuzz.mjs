import assert from 'node:assert';
import {
  acquireSemanticLease,
  activeSemanticLeases,
  createSemanticLeaseState,
  expireSemanticLeases,
  releaseSemanticLease,
  replaySemanticLeaseEvents,
  semanticLeaseScopesConflict
} from '../dist/index.js';

const args = new Set(process.argv.slice(2));
const casesArgIndex = process.argv.indexOf('--cases');
const cases = casesArgIndex >= 0 ? Number(process.argv[casesArgIndex + 1]) : 250;
const seedArgIndex = process.argv.indexOf('--seed');
let seed = seedArgIndex >= 0 ? Number(process.argv[seedArgIndex + 1]) : 0x51ea5e;

for (let run = 0; run < cases; run++) {
  let state = createSemanticLeaseState({ id: `fuzz:${run}`, defaultTtlMs: 20 + randomInt(50) });
  let now = 1;
  for (let step = 0; step < 80; step++) {
    now += randomInt(5);
    const active = activeSemanticLeases(state, now);
    const action = randomInt(10);
    if (action < 6) {
      const result = acquireSemanticLease(state, {
        ownerId: `agent:${randomInt(12)}`,
        now,
        ttlMs: 10 + randomInt(90),
        scopes: [randomScope()]
      });
      state = result.state;
    } else if (action < 8 && active.length) {
      const lease = active[randomInt(active.length)];
      const result = releaseSemanticLease(state, {
        leaseId: lease.id,
        token: random() < 0.85 ? lease.token : 'stale-token',
        ownerId: lease.ownerId,
        now
      });
      state = result.state;
    } else {
      state = expireSemanticLeases(state, { now }).state;
    }
    assertNoActiveConflicts(state, now);
    if (step % 20 === 19) {
      assertReplayMatches(state, run, step);
    }
  }
  assertReplayMatches(state, run, 'final');
}

if (args.has('--json')) {
  console.log(JSON.stringify({ ok: true, cases, seed }, null, 2));
} else {
  console.log(`frontier lease fuzz passed (${cases} cases)`);
}

function assertNoActiveConflicts(state, now) {
  const active = activeSemanticLeases(state, now);
  for (let left = 0; left < active.length; left++) {
    for (let right = left + 1; right < active.length; right++) {
      for (const leftScope of active[left].scopes) {
        for (const rightScope of active[right].scopes) {
          assert.strictEqual(
            semanticLeaseScopesConflict(leftScope, rightScope),
            undefined,
            `${active[left].id} conflicts with ${active[right].id}`
          );
        }
      }
    }
  }
}

function assertReplayMatches(state, run, step) {
  const replayed = replaySemanticLeaseEvents(state.events, { id: state.id, defaultTtlMs: state.defaultTtlMs });
  assert.strictEqual(
    replayed.leases.length,
    state.leases.length,
    `replay lease count mismatch at run ${run} step ${step}; replay=${replayed.leases.length} state=${state.leases.length}`
  );
}

function randomScope() {
  const path = `src/file-${randomInt(8)}.ts`;
  const name = `symbol${randomInt(8)}`;
  const kind = randomPick(['export', 'type', 'function', 'member', 'path', 'package']);
  if (kind === 'path') {
    return { kind, repository: 'repo', packageId: `pkg-${randomInt(3)}`, path };
  }
  if (kind === 'package') {
    return { kind, repository: 'repo', packageId: `pkg-${randomInt(3)}` };
  }
  return {
    kind,
    repository: 'repo',
    packageId: `pkg-${randomInt(3)}`,
    path,
    name,
    ...(kind === 'member' ? { member: `member${randomInt(4)}` } : {}),
    mode: random() < 0.15 ? 'shared' : 'exclusive'
  };
}

function random() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0x100000000;
}

function randomInt(max) {
  return Math.floor(random() * max);
}

function randomPick(values) {
  return values[randomInt(values.length)];
}
