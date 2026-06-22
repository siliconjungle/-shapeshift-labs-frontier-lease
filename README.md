# @shapeshift-labs/frontier-lease

Runtime-neutral semantic lease manager with fencing tokens, expiry, conflict checks, and replayable evidence for Frontier collaboration.

`frontier-lease` gives coordinators and worker systems a shared lease model for source ownership regions that are narrower than files. A worker can lease `export:createSwarmPlan` while another worker leases `export:createSwarmRun` in the same file, but a broader `path`, `package`, or `repository` lease blocks overlapping narrower work.

The package is deliberately small. It does not spawn workers, touch Git, run tests, store files, or talk to a broker. Hosts provide storage and process orchestration; this package owns deterministic lease state transitions.

## What It Models

- semantic scopes such as exports, types, members, CLI commands, docs sections, test fixtures, paths, packages, and repositories
- exclusive and shared lease modes
- expiring leases with holder, owner, token, and monotonic fencing token
- conflict inspection before a coordinator applies work
- renew, release, and expire transitions
- replayable lease events and compact evidence records
- snapshots for dashboards and merge-queue health views

## Install

```sh
npm install @shapeshift-labs/frontier-lease
```

## Usage

```ts
import {
  acquireSemanticLease,
  createSemanticLeaseState,
  defineSemanticLeaseScope,
  validateSemanticLeaseFence
} from '@shapeshift-labs/frontier-lease';

let state = createSemanticLeaseState({ id: 'repo-main' });

const first = acquireSemanticLease(state, {
  ownerId: 'coordinator-a',
  now: Date.now(),
  ttlMs: 15 * 60 * 1000,
  scopes: [
    defineSemanticLeaseScope({
      kind: 'export',
      repository: 'frontier',
      packageId: 'frontier-swarm',
      path: 'src/index.ts',
      name: 'createSwarmPlan'
    })
  ]
});

state = first.state;

if (first.lease) {
  const fence = validateSemanticLeaseFence(state, {
    leaseId: first.lease.id,
    token: first.lease.token,
    fencingToken: first.lease.fencingToken,
    scopes: first.lease.scopes,
    now: Date.now()
  });

  if (!fence.ok) throw new Error(fence.reasons.join(', '));
}
```

## Conflict Rules

Two leases conflict when their scopes overlap and at least one side is exclusive.

Exact semantic regions conflict:

```ts
{ kind: 'export', path: 'src/index.ts', name: 'createSwarmPlan' }
```

does not conflict with:

```ts
{ kind: 'export', path: 'src/index.ts', name: 'createSwarmRun' }
```

But both conflict with a broader path lease:

```ts
{ kind: 'path', path: 'src/index.ts' }
```

and with a broader package lease:

```ts
{ kind: 'package', packageId: 'frontier-swarm' }
```

Use `parentKeys`, `aliases`, and `conflictsWith` for project-specific regions that cannot be described by the built-in scope fields.

## API

- `createSemanticLeaseState(input?)`
- `defineSemanticLeaseScope(input)`
- `semanticLeaseScopeKey(scope)`
- `semanticLeaseScopesConflict(left, right)`
- `inspectSemanticLeaseConflicts(state, input)`
- `acquireSemanticLease(state, input)`
- `renewSemanticLease(state, input)`
- `releaseSemanticLease(state, input)`
- `expireSemanticLeases(state, input?)`
- `validateSemanticLeaseFence(state, input)`
- `activeSemanticLeases(state, now?)`
- `replaySemanticLeaseEvents(events, input?)`
- `createSemanticLeaseSnapshot(state, input?)`
- `canonicalSemanticLeaseJson(value)`
- `hashSemanticLeaseValue(value)`

## Layering

`frontier-lease` sits below runner-specific packages.

- `frontier-run` records what happened.
- `frontier-lease` decides whether a semantic lease is valid.
- `frontier-swarm` can use these scopes to plan merge queues.
- `frontier-swarm-codex` can claim a lease before applying, verifying, committing, and pushing.
- `frontier-loom-ui` can display lease snapshots and conflict reasons.

## Verification

```sh
npm test
npm run bench
npm run pack:dry
```
