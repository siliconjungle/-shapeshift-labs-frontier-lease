import assert from 'node:assert';
import {
  acquireSemanticLease,
  activeSemanticLeases,
  createSemanticLeaseApplyEvidence,
  createSemanticLeaseFence,
  createSemanticLeaseSnapshot,
  createSemanticLeaseState,
  defineChangedPathLeaseScopes,
  defineExportLeaseScope,
  definePackageLeaseScope,
  definePathLeaseScope,
  defineSemanticLeaseScope,
  expireSemanticLeases,
  inspectSemanticLeaseCoverage,
  inspectSemanticLeaseConflicts,
  releaseSemanticLease,
  renewSemanticLease,
  replaySemanticLeaseEvents,
  semanticLeaseScopesConflict,
  validateSemanticLeaseApply,
  validateSemanticLeaseFence
} from '../dist/index.js';

const exportFoo = defineSemanticLeaseScope({
  kind: 'export',
  repository: 'repo',
  packageId: 'frontier-swarm',
  path: 'src/index.ts',
  name: 'createSwarmPlan'
});
const exportBar = defineSemanticLeaseScope({
  kind: 'export',
  repository: 'repo',
  packageId: 'frontier-swarm',
  path: 'src/index.ts',
  name: 'createSwarmRun'
});
const pathIndex = defineSemanticLeaseScope({
  kind: 'path',
  repository: 'repo',
  packageId: 'frontier-swarm',
  path: 'src/index.ts'
});
const packageLease = defineSemanticLeaseScope({
  kind: 'package',
  repository: 'repo',
  packageId: 'frontier-swarm'
});

assert.strictEqual(semanticLeaseScopesConflict(exportFoo, exportBar), undefined);
assert.ok(semanticLeaseScopesConflict(pathIndex, exportFoo));
assert.ok(semanticLeaseScopesConflict(packageLease, exportFoo));

let state = createSemanticLeaseState({ id: 'smoke', defaultTtlMs: 100 });
const first = acquireSemanticLease(state, {
  ownerId: 'agent-a',
  now: 10,
  ttlMs: 100,
  purpose: 'edit createSwarmPlan',
  scopes: [exportFoo]
});
assert.strictEqual(first.outcome, 'granted');
assert.strictEqual(first.granted, true);
assert.strictEqual(first.lease.fencingToken, 1);
state = first.state;

const second = acquireSemanticLease(state, {
  ownerId: 'agent-b',
  now: 11,
  ttlMs: 100,
  purpose: 'edit createSwarmRun',
  scopes: [exportBar]
});
assert.strictEqual(second.outcome, 'granted', 'independent same-file exports should not conflict');
assert.strictEqual(second.lease.fencingToken, 2);
state = second.state;

const blockedByPath = acquireSemanticLease(state, {
  ownerId: 'agent-c',
  now: 12,
  ttlMs: 100,
  scopes: [pathIndex]
});
assert.strictEqual(blockedByPath.outcome, 'denied');
assert.ok(blockedByPath.conflicts.length >= 2);
state = blockedByPath.state;

const conflictCheck = inspectSemanticLeaseConflicts(state, { scopes: [pathIndex], now: 13 });
assert.ok(conflictCheck.conflicts.length >= 2);

const renewed = renewSemanticLease(state, {
  leaseId: first.lease.id,
  token: first.lease.token,
  ownerId: 'agent-a',
  now: 50,
  ttlMs: 200
});
assert.strictEqual(renewed.outcome, 'renewed');
state = renewed.state;

const staleRelease = releaseSemanticLease(state, {
  leaseId: first.lease.id,
  token: 'wrong-token',
  ownerId: 'agent-a',
  now: 55
});
assert.strictEqual(staleRelease.outcome, 'denied');
state = staleRelease.state;

const released = releaseSemanticLease(state, {
  leaseId: first.lease.id,
  token: first.lease.token,
  ownerId: 'agent-a',
  now: 60
});
assert.strictEqual(released.outcome, 'released');
state = released.state;

const fence = validateSemanticLeaseFence(state, {
  leaseId: second.lease.id,
  token: second.lease.token,
  fencingToken: second.lease.fencingToken,
  scopes: [exportBar],
  now: 70
});
assert.strictEqual(fence.ok, true);

const expired = expireSemanticLeases(state, { now: 250 });
state = expired.state;
assert.strictEqual(activeSemanticLeases(state, 250).length, 0);

const replayed = replaySemanticLeaseEvents(state.events, { id: state.id, defaultTtlMs: state.defaultTtlMs });
assert.deepStrictEqual(
  createSemanticLeaseSnapshot(replayed, { now: 250 }),
  createSemanticLeaseSnapshot(state, { now: 250 })
);

const sharedA = acquireSemanticLease(createSemanticLeaseState({ id: 'shared' }), {
  ownerId: 'reader-a',
  now: 1,
  ttlMs: 100,
  scopes: [{ ...exportFoo, mode: 'shared' }]
});
const sharedB = acquireSemanticLease(sharedA.state, {
  ownerId: 'reader-b',
  now: 2,
  ttlMs: 100,
  scopes: [{ ...exportFoo, mode: 'shared' }]
});
assert.strictEqual(sharedB.outcome, 'granted', 'shared semantic leases should be compatible');

const helperPath = definePathLeaseScope({ repository: 'repo', packageId: 'frontier-lease', path: 'src/index.ts' });
const helperPackage = definePackageLeaseScope({ repository: 'repo', packageId: 'frontier-lease' });
const helperExport = defineExportLeaseScope({ repository: 'repo', packageId: 'frontier-lease', path: 'src/index.ts', name: 'validateSemanticLeaseApply' });
assert.ok(semanticLeaseScopesConflict(helperPackage, helperExport));
assert.ok(semanticLeaseScopesConflict(helperPath, helperExport));

let applyState = createSemanticLeaseState({ id: 'apply' });
const changedScopes = defineChangedPathLeaseScopes({
  repository: 'repo',
  packageId: 'frontier-lease',
  paths: ['src/index.ts', './test/smoke.mjs']
});
assert.deepStrictEqual(changedScopes.map((scope) => scope.path), ['src/index.ts', 'test/smoke.mjs']);
const applyLeaseA = acquireSemanticLease(applyState, {
  ownerId: 'apply-a',
  now: 10,
  scopes: [changedScopes[0]]
});
assert.strictEqual(applyLeaseA.outcome, 'granted');
applyState = applyLeaseA.state;
const applyLeaseB = acquireSemanticLease(applyState, {
  ownerId: 'apply-b',
  now: 11,
  scopes: [changedScopes[1]]
});
assert.strictEqual(applyLeaseB.outcome, 'granted');
applyState = applyLeaseB.state;
const fences = [createSemanticLeaseFence(applyLeaseA.lease), createSemanticLeaseFence(applyLeaseB.lease)];
const coverage = inspectSemanticLeaseCoverage(applyState, { fences, scopes: changedScopes, now: 12 });
assert.strictEqual(coverage.ok, true);
assert.deepStrictEqual(coverage.uncoveredScopeKeys, []);
const applyValidation = validateSemanticLeaseApply(applyState, { fences, scopes: changedScopes, now: 12 });
assert.strictEqual(applyValidation.ok, true);
const applyEvidence = createSemanticLeaseApplyEvidence(applyState, {
  source: 'smoke',
  fences,
  scopes: changedScopes,
  now: 12
});
assert.strictEqual(applyEvidence.kind, 'frontier.semantic-lease.apply-evidence');
assert.strictEqual(applyEvidence.ok, true);
assert.strictEqual(applyEvidence.fenceCount, 2);

const sharedWriteLease = acquireSemanticLease(createSemanticLeaseState({ id: 'shared-write' }), {
  ownerId: 'reader',
  now: 1,
  scopes: [{ ...helperExport, mode: 'shared' }]
});
const sharedWrite = validateSemanticLeaseApply(sharedWriteLease.state, {
  fences: [createSemanticLeaseFence(sharedWriteLease.lease)],
  scopes: [helperExport],
  now: 2
});
assert.strictEqual(sharedWrite.ok, false);
assert.ok(sharedWrite.reasons.includes('shared-lease-cannot-authorize-write'));

console.log('frontier lease smoke passed');
