import { assertJsonValue, cloneJson, type JsonObject, type JsonValue } from '@shapeshift-labs/frontier';

export const FRONTIER_SEMANTIC_LEASE_STATE_KIND = 'frontier.semantic-lease.state';
export const FRONTIER_SEMANTIC_LEASE_STATE_VERSION = 1;
export const FRONTIER_SEMANTIC_LEASE_RECORD_KIND = 'frontier.semantic-lease.record';
export const FRONTIER_SEMANTIC_LEASE_RECORD_VERSION = 1;
export const FRONTIER_SEMANTIC_LEASE_SCOPE_KIND = 'frontier.semantic-lease.scope';
export const FRONTIER_SEMANTIC_LEASE_SCOPE_VERSION = 1;
export const FRONTIER_SEMANTIC_LEASE_EVENT_KIND = 'frontier.semantic-lease.event';
export const FRONTIER_SEMANTIC_LEASE_EVENT_VERSION = 1;
export const FRONTIER_SEMANTIC_LEASE_EVIDENCE_KIND = 'frontier.semantic-lease.evidence';
export const FRONTIER_SEMANTIC_LEASE_EVIDENCE_VERSION = 1;

export type FrontierSemanticLeaseScopeKind =
  | 'repository'
  | 'package'
  | 'lane'
  | 'path'
  | 'semantic-region'
  | 'export'
  | 'type'
  | 'value'
  | 'function'
  | 'class'
  | 'member'
  | 'cli-command'
  | 'docs-section'
  | 'test-fixture'
  | 'custom'
  | string;

export type FrontierSemanticLeaseMode = 'exclusive' | 'shared';
export type FrontierSemanticLeaseStatus = 'granted' | 'released' | 'expired' | 'denied';
export type FrontierSemanticLeaseConflictKind = 'exact' | 'hierarchy' | 'path' | 'package' | 'repository' | 'declared';
export type FrontierSemanticLeaseEventType =
  | 'lease.requested'
  | 'lease.granted'
  | 'lease.denied'
  | 'lease.renewed'
  | 'lease.released'
  | 'lease.expired';

export interface FrontierSemanticLeaseScopeInput {
  kind: FrontierSemanticLeaseScopeKind;
  key?: string;
  repository?: string;
  packageId?: string;
  lane?: string;
  path?: string;
  regionId?: string;
  name?: string;
  member?: string;
  mode?: FrontierSemanticLeaseMode;
  parentKeys?: readonly string[];
  aliases?: readonly string[];
  conflictsWith?: readonly string[];
  metadata?: JsonObject;
}

export interface FrontierSemanticLeaseScope {
  kind: typeof FRONTIER_SEMANTIC_LEASE_SCOPE_KIND;
  version: typeof FRONTIER_SEMANTIC_LEASE_SCOPE_VERSION;
  scopeKind: FrontierSemanticLeaseScopeKind;
  key: string;
  repository?: string;
  packageId?: string;
  lane?: string;
  path?: string;
  regionId?: string;
  name?: string;
  member?: string;
  mode: FrontierSemanticLeaseMode;
  parentKeys: string[];
  aliases: string[];
  conflictsWith: string[];
  metadata?: JsonObject;
}

export interface FrontierSemanticLeaseStateInput {
  id?: string;
  defaultTtlMs?: number;
  nextFencingToken?: number;
  sequence?: number;
  leases?: readonly FrontierSemanticLeaseRecord[];
  events?: readonly FrontierSemanticLeaseEvent[];
  metadata?: JsonObject;
}

export interface FrontierSemanticLeaseState {
  kind: typeof FRONTIER_SEMANTIC_LEASE_STATE_KIND;
  version: typeof FRONTIER_SEMANTIC_LEASE_STATE_VERSION;
  id: string;
  defaultTtlMs: number;
  nextFencingToken: number;
  sequence: number;
  leases: FrontierSemanticLeaseRecord[];
  events: FrontierSemanticLeaseEvent[];
  metadata?: JsonObject;
}

export interface FrontierSemanticLeaseRecord {
  kind: typeof FRONTIER_SEMANTIC_LEASE_RECORD_KIND;
  version: typeof FRONTIER_SEMANTIC_LEASE_RECORD_VERSION;
  id: string;
  token: string;
  ownerId: string;
  holderId?: string;
  status: FrontierSemanticLeaseStatus;
  scopes: FrontierSemanticLeaseScope[];
  scopeKeys: string[];
  fencingToken: number;
  requestedAt: number;
  grantedAt?: number;
  renewedAt?: number;
  releasedAt?: number;
  expiredAt?: number;
  expiresAt: number;
  ttlMs: number;
  purpose?: string;
  reason?: string;
  metadata?: JsonObject;
}

export interface FrontierSemanticLeaseEvent {
  kind: typeof FRONTIER_SEMANTIC_LEASE_EVENT_KIND;
  version: typeof FRONTIER_SEMANTIC_LEASE_EVENT_VERSION;
  id: string;
  type: FrontierSemanticLeaseEventType;
  sequence: number;
  at: number;
  stateId: string;
  leaseId?: string;
  ownerId?: string;
  token?: string;
  fencingToken?: number;
  scopeKeys?: string[];
  lease?: FrontierSemanticLeaseRecord;
  conflicts?: FrontierSemanticLeaseConflict[];
  reason?: string;
  metadata?: JsonObject;
}

export interface FrontierSemanticLeaseConflict {
  kind: FrontierSemanticLeaseConflictKind;
  requestedScopeKey: string;
  heldScopeKey: string;
  leaseId: string;
  ownerId: string;
  fencingToken: number;
  expiresAt: number;
  reason: string;
}

export interface FrontierSemanticLeaseAcquireInput {
  ownerId: string;
  holderId?: string;
  scopes: readonly FrontierSemanticLeaseScopeInput[];
  now?: number;
  ttlMs?: number;
  purpose?: string;
  reason?: string;
  metadata?: JsonObject;
}

export interface FrontierSemanticLeaseRenewInput {
  leaseId: string;
  token: string;
  ownerId?: string;
  now?: number;
  ttlMs?: number;
  reason?: string;
  metadata?: JsonObject;
}

export interface FrontierSemanticLeaseReleaseInput {
  leaseId: string;
  token?: string;
  ownerId?: string;
  now?: number;
  force?: boolean;
  reason?: string;
  metadata?: JsonObject;
}

export interface FrontierSemanticLeaseExpireInput {
  now?: number;
  reason?: string;
  metadata?: JsonObject;
}

export interface FrontierSemanticLeaseInspectInput {
  scopes: readonly FrontierSemanticLeaseScopeInput[];
  now?: number;
  excludeLeaseIds?: readonly string[];
}

export interface FrontierSemanticLeaseFenceInput {
  leaseId: string;
  token: string;
  fencingToken: number;
  scopes?: readonly FrontierSemanticLeaseScopeInput[];
  now?: number;
}

export interface FrontierSemanticLeaseFenceTicket {
  leaseId: string;
  token: string;
  fencingToken: number;
  ownerId: string;
  holderId?: string;
  expiresAt: number;
  scopeKeys: string[];
}

export interface FrontierSemanticLeaseCoverageInput {
  fences: readonly FrontierSemanticLeaseFenceTicket[];
  scopes: readonly FrontierSemanticLeaseScopeInput[];
  now?: number;
}

export interface FrontierSemanticLeaseCoverageResult {
  ok: boolean;
  coveredScopeKeys: string[];
  uncoveredScopeKeys: string[];
  invalidFenceReasons: Record<string, string[]>;
  conflicts: FrontierSemanticLeaseConflict[];
}

export interface FrontierSemanticLeaseApplyInput extends FrontierSemanticLeaseCoverageInput {
  requireExclusive?: boolean;
}

export interface FrontierSemanticLeaseApplyValidation {
  ok: boolean;
  reasons: string[];
  coveredScopeKeys: string[];
  uncoveredScopeKeys: string[];
  invalidFenceReasons: Record<string, string[]>;
  sharedWriteScopeKeys: string[];
  conflicts: FrontierSemanticLeaseConflict[];
}

export interface FrontierSemanticLeaseChangedPathScopeInput {
  repository?: string;
  packageId?: string;
  paths: readonly string[];
  mode?: FrontierSemanticLeaseMode;
  metadata?: JsonObject;
}

export interface FrontierSemanticLeaseApplyEvidenceInput extends FrontierSemanticLeaseApplyInput {
  source?: string;
  metadata?: JsonObject;
}

export interface FrontierSemanticLeaseApplyEvidence {
  kind: 'frontier.semantic-lease.apply-evidence';
  version: 1;
  source: string;
  stateId: string;
  generatedAt: number;
  ok: boolean;
  reasons: string[];
  fenceCount: number;
  scopeCount: number;
  coveredScopeKeys: string[];
  uncoveredScopeKeys: string[];
  sharedWriteScopeKeys: string[];
  conflictCount: number;
  invalidFenceReasons: Record<string, string[]>;
  metadata?: JsonObject;
}

export interface FrontierSemanticLeaseMutation {
  state: FrontierSemanticLeaseState;
  outcome: 'granted' | 'denied' | 'renewed' | 'released' | 'expired' | 'noop';
  granted: boolean;
  lease?: FrontierSemanticLeaseRecord;
  conflicts: FrontierSemanticLeaseConflict[];
  events: FrontierSemanticLeaseEvent[];
  evidence: FrontierSemanticLeaseEvidence;
}

export interface FrontierSemanticLeaseEvidence {
  kind: typeof FRONTIER_SEMANTIC_LEASE_EVIDENCE_KIND;
  version: typeof FRONTIER_SEMANTIC_LEASE_EVIDENCE_VERSION;
  stateId: string;
  outcome: string;
  beforeHash: string;
  afterHash: string;
  eventCount: number;
  activeLeaseCount: number;
  conflictCount: number;
  fencingToken?: number;
  replayVerified: boolean;
}

export interface FrontierSemanticLeaseSnapshot {
  kind: 'frontier.semantic-lease.snapshot';
  version: 1;
  stateId: string;
  generatedAt: number;
  activeLeaseCount: number;
  expiredLeaseCount: number;
  releasedLeaseCount: number;
  deniedLeaseCount: number;
  nextFencingToken: number;
  activeScopeKeys: string[];
  leasesByOwner: Record<string, number>;
  leasesByScope: Record<string, string[]>;
}

export function createSemanticLeaseState(input: FrontierSemanticLeaseStateInput = {}): FrontierSemanticLeaseState {
  return {
    kind: FRONTIER_SEMANTIC_LEASE_STATE_KIND,
    version: FRONTIER_SEMANTIC_LEASE_STATE_VERSION,
    id: input.id || 'semantic-lease-state',
    defaultTtlMs: positiveInteger(input.defaultTtlMs, 15 * 60 * 1000),
    nextFencingToken: positiveInteger(input.nextFencingToken, 1),
    sequence: Math.max(0, Math.floor(input.sequence ?? 0)),
    leases: (input.leases || []).map(cloneLease),
    events: (input.events || []).map(cloneEvent),
    metadata: cloneMetadata(input.metadata)
  };
}

export function defineSemanticLeaseScope(input: FrontierSemanticLeaseScopeInput): FrontierSemanticLeaseScope {
  return normalizeSemanticLeaseScope(input);
}

export function defineRepositoryLeaseScope(input: Omit<FrontierSemanticLeaseScopeInput, 'kind'> = {}): FrontierSemanticLeaseScope {
  return defineSemanticLeaseScope({ ...input, kind: 'repository' });
}

export function definePackageLeaseScope(input: Omit<FrontierSemanticLeaseScopeInput, 'kind'>): FrontierSemanticLeaseScope {
  return defineSemanticLeaseScope({ ...input, kind: 'package' });
}

export function definePathLeaseScope(input: Omit<FrontierSemanticLeaseScopeInput, 'kind'>): FrontierSemanticLeaseScope {
  return defineSemanticLeaseScope({ ...input, kind: 'path' });
}

export function defineExportLeaseScope(input: Omit<FrontierSemanticLeaseScopeInput, 'kind'>): FrontierSemanticLeaseScope {
  return defineSemanticLeaseScope({ ...input, kind: 'export' });
}

export function defineMemberLeaseScope(input: Omit<FrontierSemanticLeaseScopeInput, 'kind'>): FrontierSemanticLeaseScope {
  return defineSemanticLeaseScope({ ...input, kind: 'member' });
}

export function normalizeSemanticLeaseScope(input: FrontierSemanticLeaseScopeInput | FrontierSemanticLeaseScope): FrontierSemanticLeaseScope {
  const existing = input as Partial<FrontierSemanticLeaseScope>;
  const scopeKind = existing.scopeKind || input.kind;
  const path = normalizePath(input.path);
  const key = normalizeScopeKey(input.key || buildScopeKey({ ...input, kind: scopeKind, path }));
  const aliases = uniqueStrings([
    ...((input.aliases || []) as readonly string[]),
    ...(input.key && input.key !== key ? [input.key] : [])
  ].map(normalizeScopeKey));
  const parentKeys = uniqueStrings([
    ...((input.parentKeys || []) as readonly string[]).map(normalizeScopeKey),
    ...implicitParentScopeKeys({ ...input, kind: scopeKind, path }, key)
  ]);
  const conflictsWith = uniqueStrings(((input.conflictsWith || []) as readonly string[]).map(normalizeScopeKey));
  const scope: FrontierSemanticLeaseScope = {
    kind: FRONTIER_SEMANTIC_LEASE_SCOPE_KIND,
    version: FRONTIER_SEMANTIC_LEASE_SCOPE_VERSION,
    scopeKind,
    key,
    repository: optionalString(input.repository),
    packageId: optionalString(input.packageId),
    lane: optionalString(input.lane),
    path,
    regionId: optionalString(input.regionId),
    name: optionalString(input.name),
    member: optionalString(input.member),
    mode: input.mode === 'shared' ? 'shared' : 'exclusive',
    parentKeys,
    aliases,
    conflictsWith,
    metadata: cloneMetadata(input.metadata)
  };
  return stripUndefined<FrontierSemanticLeaseScope>(scope);
}

export function semanticLeaseScopeKey(input: FrontierSemanticLeaseScopeInput | FrontierSemanticLeaseScope): string {
  return normalizeSemanticLeaseScope(input).key;
}

export function acquireSemanticLease(
  state: FrontierSemanticLeaseState,
  input: FrontierSemanticLeaseAcquireInput
): FrontierSemanticLeaseMutation {
  const now = timestamp(input.now);
  const before = cloneState(state);
  let current = expireSemanticLeases(before, { now, reason: 'expire-before-acquire' }).state;
  const scopes = input.scopes.map(normalizeSemanticLeaseScope);
  if (!input.ownerId) throw new Error('acquireSemanticLease requires ownerId');
  if (scopes.length === 0) throw new Error('acquireSemanticLease requires at least one scope');
  const scopeKeys = uniqueStrings(scopes.map((scope) => scope.key));
  const requestEvent = nextEvent(current, {
    type: 'lease.requested',
    at: now,
    ownerId: input.ownerId,
    scopeKeys,
    reason: input.reason,
    metadata: input.metadata
  });
  current = appendEvents(current, [requestEvent]);
  const conflicts = inspectSemanticLeaseConflicts(current, { scopes, now }).conflicts;
  if (conflicts.length) {
    const deniedLease = createDeniedLease(current, input, scopes, now, conflicts);
    const deniedEvent = nextEvent(current, {
      type: 'lease.denied',
      at: now,
      leaseId: deniedLease.id,
      ownerId: input.ownerId,
      token: deniedLease.token,
      scopeKeys,
      lease: deniedLease,
      conflicts,
      reason: input.reason || 'conflicting active semantic lease',
      metadata: input.metadata
    });
    current = appendLease(current, deniedLease);
    current = appendEvents(current, [deniedEvent]);
    return mutationResult(before, current, 'denied', false, deniedLease, conflicts, [requestEvent, deniedEvent]);
  }
  const fencingToken = current.nextFencingToken;
  const ttlMs = positiveInteger(input.ttlMs, current.defaultTtlMs);
  const lease = stripUndefined<FrontierSemanticLeaseRecord>({
    kind: FRONTIER_SEMANTIC_LEASE_RECORD_KIND,
    version: FRONTIER_SEMANTIC_LEASE_RECORD_VERSION,
    id: stableId('semantic-lease', [current.id, input.ownerId, scopeKeys, fencingToken, now]),
    token: stableId('semantic-lease-token', [current.id, input.ownerId, scopeKeys, fencingToken, now]),
    ownerId: input.ownerId,
    holderId: optionalString(input.holderId),
    status: 'granted',
    scopes,
    scopeKeys,
    fencingToken,
    requestedAt: now,
    grantedAt: now,
    expiresAt: now + ttlMs,
    ttlMs,
    purpose: optionalString(input.purpose),
    reason: optionalString(input.reason),
    metadata: cloneMetadata(input.metadata)
  });
  current = {
    ...current,
    nextFencingToken: fencingToken + 1,
    leases: [...current.leases, lease]
  };
  const grantedEvent = nextEvent(current, {
    type: 'lease.granted',
    at: now,
    leaseId: lease.id,
    ownerId: input.ownerId,
    token: lease.token,
    fencingToken,
    scopeKeys,
    lease,
    reason: input.reason,
    metadata: input.metadata
  });
  current = appendEvents(current, [grantedEvent]);
  return mutationResult(before, current, 'granted', true, lease, [], [requestEvent, grantedEvent]);
}

export function renewSemanticLease(
  state: FrontierSemanticLeaseState,
  input: FrontierSemanticLeaseRenewInput
): FrontierSemanticLeaseMutation {
  const now = timestamp(input.now);
  const before = cloneState(state);
  let current = expireSemanticLeases(before, { now, reason: 'expire-before-renew' }).state;
  const index = current.leases.findIndex((lease) => lease.id === input.leaseId);
  const lease = index >= 0 ? current.leases[index] : undefined;
  if (!lease || lease.token !== input.token || (input.ownerId && lease.ownerId !== input.ownerId) || !leaseActive(lease, now)) {
    const event = nextEvent(current, {
      type: 'lease.denied',
      at: now,
      leaseId: input.leaseId,
      ownerId: input.ownerId,
      token: input.token,
      reason: input.reason || 'renew rejected by stale token, owner, or inactive lease',
      metadata: input.metadata
    });
    current = appendEvents(current, [event]);
    return mutationResult(before, current, 'denied', false, lease, [], [event]);
  }
  const ttlMs = positiveInteger(input.ttlMs, lease.ttlMs);
  const renewed = cloneLease({
    ...lease,
    renewedAt: now,
    expiresAt: now + ttlMs,
    ttlMs,
    reason: optionalString(input.reason) || lease.reason,
    metadata: mergeMetadata(lease.metadata, input.metadata)
  });
  current = replaceLease(current, index, renewed);
  const event = nextEvent(current, {
    type: 'lease.renewed',
    at: now,
    leaseId: renewed.id,
    ownerId: renewed.ownerId,
    token: renewed.token,
    fencingToken: renewed.fencingToken,
    scopeKeys: renewed.scopeKeys,
    lease: renewed,
    reason: input.reason,
    metadata: input.metadata
  });
  current = appendEvents(current, [event]);
  return mutationResult(before, current, 'renewed', true, renewed, [], [event]);
}

export function releaseSemanticLease(
  state: FrontierSemanticLeaseState,
  input: FrontierSemanticLeaseReleaseInput
): FrontierSemanticLeaseMutation {
  const now = timestamp(input.now);
  const before = cloneState(state);
  const index = before.leases.findIndex((lease) => lease.id === input.leaseId);
  const lease = index >= 0 ? before.leases[index] : undefined;
  if (!lease || !canReleaseLease(lease, input)) {
    const event = nextEvent(before, {
      type: 'lease.denied',
      at: now,
      leaseId: input.leaseId,
      ownerId: input.ownerId,
      token: input.token,
      reason: input.reason || 'release rejected by stale token or owner',
      metadata: input.metadata
    });
    const current = appendEvents(before, [event]);
    return mutationResult(before, current, 'denied', false, lease, [], [event]);
  }
  if (lease.status === 'released') return mutationResult(before, before, 'noop', true, lease, [], []);
  const released = cloneLease({
    ...lease,
    status: 'released',
    releasedAt: now,
    reason: optionalString(input.reason) || lease.reason,
    metadata: mergeMetadata(lease.metadata, input.metadata)
  });
  let current = replaceLease(before, index, released);
  const event = nextEvent(current, {
    type: 'lease.released',
    at: now,
    leaseId: released.id,
    ownerId: released.ownerId,
    token: released.token,
    fencingToken: released.fencingToken,
    scopeKeys: released.scopeKeys,
    lease: released,
    reason: input.reason,
    metadata: input.metadata
  });
  current = appendEvents(current, [event]);
  return mutationResult(before, current, 'released', true, released, [], [event]);
}

export function expireSemanticLeases(
  state: FrontierSemanticLeaseState,
  input: FrontierSemanticLeaseExpireInput = {}
): FrontierSemanticLeaseMutation {
  const now = timestamp(input.now);
  const before = cloneState(state);
  let current = before;
  const events: FrontierSemanticLeaseEvent[] = [];
  for (let index = 0; index < current.leases.length; index++) {
    const lease = current.leases[index];
    if (lease.status !== 'granted' || lease.expiresAt > now) continue;
    const expired = cloneLease({
      ...lease,
      status: 'expired',
      expiredAt: now,
      reason: optionalString(input.reason) || lease.reason,
      metadata: mergeMetadata(lease.metadata, input.metadata)
    });
    current = replaceLease(current, index, expired);
    const event = nextEvent(current, {
      type: 'lease.expired',
      at: now,
      leaseId: expired.id,
      ownerId: expired.ownerId,
      token: expired.token,
      fencingToken: expired.fencingToken,
      scopeKeys: expired.scopeKeys,
      lease: expired,
      reason: input.reason,
      metadata: input.metadata
    });
    events.push(event);
    current = appendEvents(current, [event]);
  }
  return mutationResult(before, current, events.length ? 'expired' : 'noop', true, undefined, [], events);
}

export function inspectSemanticLeaseConflicts(
  state: FrontierSemanticLeaseState,
  input: FrontierSemanticLeaseInspectInput
): { conflicts: FrontierSemanticLeaseConflict[]; activeLeases: FrontierSemanticLeaseRecord[] } {
  const now = timestamp(input.now);
  const requested = input.scopes.map(normalizeSemanticLeaseScope);
  const excluded = new Set(input.excludeLeaseIds || []);
  const activeLeases = activeSemanticLeases(state, now).filter((lease) => !excluded.has(lease.id));
  const conflicts: FrontierSemanticLeaseConflict[] = [];
  for (const lease of activeLeases) {
    for (const requestedScope of requested) {
      for (const heldScope of lease.scopes) {
        const conflict = semanticLeaseScopesConflict(requestedScope, heldScope);
        if (conflict) {
          conflicts.push({
            kind: conflict.kind,
            requestedScopeKey: requestedScope.key,
            heldScopeKey: heldScope.key,
            leaseId: lease.id,
            ownerId: lease.ownerId,
            fencingToken: lease.fencingToken,
            expiresAt: lease.expiresAt,
            reason: conflict.reason
          });
        }
      }
    }
  }
  return { conflicts, activeLeases };
}

export function semanticLeaseScopesConflict(
  leftInput: FrontierSemanticLeaseScopeInput | FrontierSemanticLeaseScope,
  rightInput: FrontierSemanticLeaseScopeInput | FrontierSemanticLeaseScope
): { kind: FrontierSemanticLeaseConflictKind; reason: string } | undefined {
  const left = normalizeSemanticLeaseScope(leftInput);
  const right = normalizeSemanticLeaseScope(rightInput);
  if (left.mode === 'shared' && right.mode === 'shared') return undefined;
  const leftKeys = scopeComparableKeys(left);
  const rightKeys = scopeComparableKeys(right);
  if (intersects(leftKeys, rightKeys)) return { kind: 'exact', reason: 'matching semantic lease key or alias' };
  if (left.conflictsWith.some((key) => rightKeys.has(key)) || right.conflictsWith.some((key) => leftKeys.has(key))) {
    return { kind: 'declared', reason: 'scope declared an explicit conflict' };
  }
  if (left.scopeKind === 'repository' || right.scopeKind === 'repository') {
    if (sameOptional(left.repository, right.repository)) return { kind: 'repository', reason: 'repository-wide lease overlaps scope' };
  }
  if (left.scopeKind === 'package' || right.scopeKind === 'package') {
    if (left.packageId && left.packageId === right.packageId) return { kind: 'package', reason: 'package-wide lease overlaps scope' };
  }
  if (left.scopeKind === 'path' || right.scopeKind === 'path') {
    if (sameRepositoryPackage(left, right) && pathsOverlap(left.path, right.path)) return { kind: 'path', reason: 'path lease overlaps path or semantic scope path' };
  }
  if (left.parentKeys.some((key) => rightKeys.has(key)) || right.parentKeys.some((key) => leftKeys.has(key))) {
    return { kind: 'hierarchy', reason: 'semantic parent lease overlaps child scope' };
  }
  return undefined;
}

export function validateSemanticLeaseFence(
  state: FrontierSemanticLeaseState,
  input: FrontierSemanticLeaseFenceInput
): { ok: boolean; lease?: FrontierSemanticLeaseRecord; reasons: string[]; conflicts: FrontierSemanticLeaseConflict[] } {
  const now = timestamp(input.now);
  const lease = state.leases.find((entry) => entry.id === input.leaseId);
  const reasons: string[] = [];
  if (!lease) reasons.push('missing-lease');
  else {
    if (lease.token !== input.token) reasons.push('token-mismatch');
    if (lease.fencingToken !== input.fencingToken) reasons.push('fencing-token-mismatch');
    if (!leaseActive(lease, now)) reasons.push('lease-inactive-or-expired');
  }
  const scopes = input.scopes ? input.scopes.map(normalizeSemanticLeaseScope) : lease?.scopes || [];
  const missingScope = lease && scopes.some((scope) => !leaseCoversScope(lease, scope));
  if (missingScope) reasons.push('scope-not-covered-by-lease');
  const conflicts = scopes.length
    ? inspectSemanticLeaseConflicts(state, { scopes, now, excludeLeaseIds: lease ? [lease.id] : [] }).conflicts
    : [];
  if (conflicts.length) reasons.push('conflicting-active-lease');
  return { ok: reasons.length === 0, lease: lease ? cloneLease(lease) : undefined, reasons: uniqueStrings(reasons), conflicts };
}

export function createSemanticLeaseFence(lease: FrontierSemanticLeaseRecord): FrontierSemanticLeaseFenceTicket {
  return {
    leaseId: lease.id,
    token: lease.token,
    fencingToken: lease.fencingToken,
    ownerId: lease.ownerId,
    ...(lease.holderId ? { holderId: lease.holderId } : {}),
    expiresAt: lease.expiresAt,
    scopeKeys: [...lease.scopeKeys]
  };
}

export function defineChangedPathLeaseScopes(input: FrontierSemanticLeaseChangedPathScopeInput): FrontierSemanticLeaseScope[] {
  return uniqueStrings(input.paths.map(normalizePath).filter(Boolean)).map((entry) => definePathLeaseScope({
    repository: input.repository,
    packageId: input.packageId,
    path: entry,
    mode: input.mode,
    metadata: input.metadata
  }));
}

export function inspectSemanticLeaseCoverage(
  state: FrontierSemanticLeaseState,
  input: FrontierSemanticLeaseCoverageInput
): FrontierSemanticLeaseCoverageResult {
  const now = timestamp(input.now);
  const scopes = input.scopes.map(normalizeSemanticLeaseScope);
  const coveredScopeKeys = new Set<string>();
  const conflicts: FrontierSemanticLeaseConflict[] = [];
  const invalidFenceReasons: Record<string, string[]> = {};
  const validLeaseIds: string[] = [];
  for (const fence of input.fences) {
    const validation = validateSemanticLeaseFence(state, {
      leaseId: fence.leaseId,
      token: fence.token,
      fencingToken: fence.fencingToken,
      now
    });
    if (!validation.ok) invalidFenceReasons[fence.leaseId] = validation.reasons;
    for (const conflict of validation.conflicts) conflicts.push(conflict);
    if (!validation.lease || validation.reasons.includes('token-mismatch') || validation.reasons.includes('fencing-token-mismatch') || validation.reasons.includes('lease-inactive-or-expired')) continue;
    validLeaseIds.push(validation.lease.id);
    for (const scope of scopes) {
      if (leaseCoversScope(validation.lease, scope)) coveredScopeKeys.add(scope.key);
    }
  }
  for (const conflict of inspectSemanticLeaseConflicts(state, { scopes, now, excludeLeaseIds: validLeaseIds }).conflicts) conflicts.push(conflict);
  const allScopeKeys = uniqueStrings(scopes.map((scope) => scope.key));
  const covered = uniqueStrings(Array.from(coveredScopeKeys)).sort();
  const uncovered = allScopeKeys.filter((key) => !coveredScopeKeys.has(key)).sort();
  return {
    ok: uncovered.length === 0 && Object.keys(invalidFenceReasons).length === 0 && conflicts.length === 0,
    coveredScopeKeys: covered,
    uncoveredScopeKeys: uncovered,
    invalidFenceReasons,
    conflicts
  };
}

export function validateSemanticLeaseApply(
  state: FrontierSemanticLeaseState,
  input: FrontierSemanticLeaseApplyInput
): FrontierSemanticLeaseApplyValidation {
  const now = timestamp(input.now);
  const scopes = input.scopes.map(normalizeSemanticLeaseScope);
  const coverage = inspectSemanticLeaseCoverage(state, { fences: input.fences, scopes, now });
  const sharedWriteScopeKeys = new Set<string>();
  if (input.requireExclusive !== false) {
    for (const fence of input.fences) {
      const validation = validateSemanticLeaseFence(state, {
        leaseId: fence.leaseId,
        token: fence.token,
        fencingToken: fence.fencingToken,
        now
      });
      if (!validation.ok || !validation.lease) continue;
      for (const scope of scopes) {
        if (leaseCoversScope(validation.lease, scope) && validation.lease.scopes.some((held) => {
          const singleScopeLease: FrontierSemanticLeaseRecord = { ...validation.lease!, scopes: [held], scopeKeys: [held.key] };
          return held.mode === 'shared' && leaseCoversScope(singleScopeLease, scope);
        })) {
          sharedWriteScopeKeys.add(scope.key);
        }
      }
    }
  }
  const reasons: string[] = [];
  if (coverage.uncoveredScopeKeys.length) reasons.push('scope-not-covered-by-fence');
  if (Object.keys(coverage.invalidFenceReasons).length) reasons.push('invalid-fence');
  if (coverage.conflicts.length) reasons.push('conflicting-active-lease');
  if (sharedWriteScopeKeys.size) reasons.push('shared-lease-cannot-authorize-write');
  return {
    ok: reasons.length === 0,
    reasons,
    coveredScopeKeys: coverage.coveredScopeKeys,
    uncoveredScopeKeys: coverage.uncoveredScopeKeys,
    invalidFenceReasons: coverage.invalidFenceReasons,
    sharedWriteScopeKeys: Array.from(sharedWriteScopeKeys).sort(),
    conflicts: coverage.conflicts
  };
}

export function createSemanticLeaseApplyEvidence(
  state: FrontierSemanticLeaseState,
  input: FrontierSemanticLeaseApplyEvidenceInput
): FrontierSemanticLeaseApplyEvidence {
  const generatedAt = timestamp(input.now);
  const validation = validateSemanticLeaseApply(state, input);
  return stripUndefined<FrontierSemanticLeaseApplyEvidence>({
    kind: 'frontier.semantic-lease.apply-evidence',
    version: 1,
    source: input.source || 'semantic-lease-apply',
    stateId: state.id,
    generatedAt,
    ok: validation.ok,
    reasons: validation.reasons,
    fenceCount: input.fences.length,
    scopeCount: input.scopes.length,
    coveredScopeKeys: validation.coveredScopeKeys,
    uncoveredScopeKeys: validation.uncoveredScopeKeys,
    sharedWriteScopeKeys: validation.sharedWriteScopeKeys,
    conflictCount: validation.conflicts.length,
    invalidFenceReasons: validation.invalidFenceReasons,
    metadata: cloneMetadata(input.metadata)
  });
}

export function activeSemanticLeases(state: FrontierSemanticLeaseState, now: number = Date.now()): FrontierSemanticLeaseRecord[] {
  return state.leases.filter((lease) => leaseActive(lease, now)).map(cloneLease);
}

export function createSemanticLeaseSnapshot(
  state: FrontierSemanticLeaseState,
  input: { now?: number } = {}
): FrontierSemanticLeaseSnapshot {
  const now = timestamp(input.now);
  const active = activeSemanticLeases(state, now);
  const leasesByOwner: Record<string, number> = {};
  const leasesByScope: Record<string, string[]> = {};
  for (const lease of active) {
    leasesByOwner[lease.ownerId] = (leasesByOwner[lease.ownerId] || 0) + 1;
    for (const key of lease.scopeKeys) {
      const entries = leasesByScope[key] || [];
      entries.push(lease.id);
      leasesByScope[key] = entries;
    }
  }
  return {
    kind: 'frontier.semantic-lease.snapshot',
    version: 1,
    stateId: state.id,
    generatedAt: now,
    activeLeaseCount: active.length,
    expiredLeaseCount: state.leases.filter((lease) => lease.status === 'expired').length,
    releasedLeaseCount: state.leases.filter((lease) => lease.status === 'released').length,
    deniedLeaseCount: state.leases.filter((lease) => lease.status === 'denied').length,
    nextFencingToken: state.nextFencingToken,
    activeScopeKeys: uniqueStrings(active.flatMap((lease) => lease.scopeKeys)).sort(),
    leasesByOwner,
    leasesByScope
  };
}

export function replaySemanticLeaseEvents(
  events: readonly FrontierSemanticLeaseEvent[],
  input: FrontierSemanticLeaseStateInput = {}
): FrontierSemanticLeaseState {
  let state = createSemanticLeaseState({ ...input, leases: [], events: [] });
  const ordered = [...events].map(cloneEvent).sort((left, right) => left.sequence - right.sequence || left.id.localeCompare(right.id));
  for (const event of ordered) {
    state = applySemanticLeaseEvent(state, event);
  }
  return state;
}

export function applySemanticLeaseEvent(
  state: FrontierSemanticLeaseState,
  event: FrontierSemanticLeaseEvent
): FrontierSemanticLeaseState {
  const current = cloneState(state);
  const existingEvent = current.events.find((entry) => entry.id === event.id);
  if (existingEvent) return current;
  const next = appendEvents({ ...current, events: current.events }, [event]);
  const eventLease = event.lease ? cloneLease(event.lease) : undefined;
  if (eventLease && (event.type === 'lease.granted' || event.type === 'lease.denied')) {
    const index = next.leases.findIndex((lease) => lease.id === eventLease.id);
    const leases = [...next.leases];
    if (index >= 0) leases[index] = eventLease;
    else leases.push(eventLease);
    return {
      ...next,
      leases,
      nextFencingToken: Math.max(next.nextFencingToken, eventLease.fencingToken + 1),
      sequence: Math.max(next.sequence, event.sequence)
    };
  }
  if (eventLease && (event.type === 'lease.renewed' || event.type === 'lease.released' || event.type === 'lease.expired')) {
    const index = next.leases.findIndex((lease) => lease.id === eventLease.id);
    const leases = [...next.leases];
    if (index >= 0) leases[index] = eventLease;
    else leases.push(eventLease);
    return {
      ...next,
      leases,
      nextFencingToken: Math.max(next.nextFencingToken, eventLease.fencingToken + 1),
      sequence: Math.max(next.sequence, event.sequence)
    };
  }
  return { ...next, sequence: Math.max(next.sequence, event.sequence) };
}

export function canonicalSemanticLeaseJson(value: unknown): string {
  return canonicalJson(value);
}

export function hashSemanticLeaseValue(value: unknown): string {
  return stableId('hash', [value]);
}

function createDeniedLease(
  state: FrontierSemanticLeaseState,
  input: FrontierSemanticLeaseAcquireInput,
  scopes: FrontierSemanticLeaseScope[],
  now: number,
  conflicts: FrontierSemanticLeaseConflict[]
): FrontierSemanticLeaseRecord {
  const scopeKeys = uniqueStrings(scopes.map((scope) => scope.key));
  return stripUndefined<FrontierSemanticLeaseRecord>({
    kind: FRONTIER_SEMANTIC_LEASE_RECORD_KIND,
    version: FRONTIER_SEMANTIC_LEASE_RECORD_VERSION,
    id: stableId('semantic-lease-denied', [state.id, state.sequence, input.ownerId, scopeKeys, now, conflicts.map((conflict) => conflict.leaseId)]),
    token: stableId('semantic-lease-denied-token', [state.id, state.sequence, input.ownerId, scopeKeys, now]),
    ownerId: input.ownerId,
    holderId: optionalString(input.holderId),
    status: 'denied',
    scopes,
    scopeKeys,
    fencingToken: 0,
    requestedAt: now,
    expiresAt: now,
    ttlMs: 0,
    purpose: optionalString(input.purpose),
    reason: optionalString(input.reason) || 'conflicting active semantic lease',
    metadata: cloneMetadata(input.metadata)
  });
}

function leaseCoversScope(lease: FrontierSemanticLeaseRecord, scope: FrontierSemanticLeaseScope): boolean {
  return lease.scopes.some((held) => held.key === scope.key || !!semanticLeaseScopesConflict(scope, held));
}

function leaseActive(lease: FrontierSemanticLeaseRecord, now: number): boolean {
  return lease.status === 'granted' && lease.expiresAt > now;
}

function canReleaseLease(lease: FrontierSemanticLeaseRecord, input: FrontierSemanticLeaseReleaseInput): boolean {
  if (input.force) return true;
  if (input.token && lease.token !== input.token) return false;
  if (!input.token) return false;
  if (input.ownerId && lease.ownerId !== input.ownerId) return false;
  return true;
}

function mutationResult(
  before: FrontierSemanticLeaseState,
  state: FrontierSemanticLeaseState,
  outcome: FrontierSemanticLeaseMutation['outcome'],
  granted: boolean,
  lease: FrontierSemanticLeaseRecord | undefined,
  conflicts: FrontierSemanticLeaseConflict[],
  events: FrontierSemanticLeaseEvent[]
): FrontierSemanticLeaseMutation {
  const evidenceNow = latestStateTime(state);
  return {
    state,
    outcome,
    granted,
    lease: lease ? cloneLease(lease) : undefined,
    conflicts: conflicts.map((conflict) => ({ ...conflict })),
    events: events.map(cloneEvent),
    evidence: {
      kind: FRONTIER_SEMANTIC_LEASE_EVIDENCE_KIND,
      version: FRONTIER_SEMANTIC_LEASE_EVIDENCE_VERSION,
      stateId: state.id,
      outcome,
      beforeHash: hashSemanticLeaseValue(withoutEvents(before)),
      afterHash: hashSemanticLeaseValue(withoutEvents(state)),
      eventCount: events.length,
      activeLeaseCount: activeSemanticLeases(state, evidenceNow).length,
      conflictCount: conflicts.length,
      fencingToken: lease?.fencingToken,
      replayVerified: replayMutationEvents(before, state, events)
    }
  };
}

function replayMatchesState(state: FrontierSemanticLeaseState): boolean {
  const replayed = replaySemanticLeaseEvents(state.events, {
    id: state.id,
    defaultTtlMs: state.defaultTtlMs,
    metadata: state.metadata
  });
  return canonicalJson(withoutEvents(replayed)) === canonicalJson(withoutEvents(state));
}

function replayMutationEvents(
  before: FrontierSemanticLeaseState,
  state: FrontierSemanticLeaseState,
  events: readonly FrontierSemanticLeaseEvent[]
): boolean {
  if (events.length === 0) return canonicalJson(withoutEvents(before)) === canonicalJson(withoutEvents(state));
  let replayed = cloneState(before);
  for (const event of events) {
    replayed = applySemanticLeaseEvent(replayed, event);
  }
  return canonicalJson(replayed) === canonicalJson(state);
}

function withoutEvents(state: FrontierSemanticLeaseState): FrontierSemanticLeaseState {
  return { ...state, events: [] };
}

function latestStateTime(state: FrontierSemanticLeaseState): number {
  return Math.max(0, ...state.events.map((event) => event.at), ...state.leases.map((lease) => lease.grantedAt || lease.requestedAt || lease.expiresAt));
}

function appendLease(state: FrontierSemanticLeaseState, lease: FrontierSemanticLeaseRecord): FrontierSemanticLeaseState {
  return { ...state, leases: [...state.leases, cloneLease(lease)] };
}

function replaceLease(state: FrontierSemanticLeaseState, index: number, lease: FrontierSemanticLeaseRecord): FrontierSemanticLeaseState {
  const leases = [...state.leases];
  leases[index] = cloneLease(lease);
  return { ...state, leases };
}

function appendEvents(state: FrontierSemanticLeaseState, events: readonly FrontierSemanticLeaseEvent[]): FrontierSemanticLeaseState {
  if (!events.length) return state;
  return {
    ...state,
    sequence: Math.max(state.sequence, ...events.map((event) => event.sequence)),
    events: [...state.events, ...events.map(cloneEvent)]
  };
}

function nextEvent(
  state: FrontierSemanticLeaseState,
  input: Omit<FrontierSemanticLeaseEvent, 'kind' | 'version' | 'id' | 'sequence' | 'stateId'>
): FrontierSemanticLeaseEvent {
  const sequence = state.sequence + 1;
  const base = stripUndefined({
    kind: FRONTIER_SEMANTIC_LEASE_EVENT_KIND,
    version: FRONTIER_SEMANTIC_LEASE_EVENT_VERSION,
    id: '',
    type: input.type,
    sequence,
    at: input.at,
    stateId: state.id,
    leaseId: input.leaseId,
    ownerId: input.ownerId,
    token: input.token,
    fencingToken: input.fencingToken,
    scopeKeys: input.scopeKeys ? [...input.scopeKeys] : undefined,
    lease: input.lease ? cloneLease(input.lease) : undefined,
    conflicts: input.conflicts?.map((conflict) => ({ ...conflict })),
    reason: input.reason,
    metadata: cloneMetadata(input.metadata)
  }) as FrontierSemanticLeaseEvent;
  return { ...base, id: stableId('semantic-lease-event', [state.id, sequence, input.type, input.leaseId, input.ownerId, input.scopeKeys, input.at]) };
}

function cloneState(state: FrontierSemanticLeaseState): FrontierSemanticLeaseState {
  return createSemanticLeaseState(state);
}

function cloneLease(lease: FrontierSemanticLeaseRecord): FrontierSemanticLeaseRecord {
  return cloneJson(lease as unknown as JsonValue) as unknown as FrontierSemanticLeaseRecord;
}

function cloneEvent(event: FrontierSemanticLeaseEvent): FrontierSemanticLeaseEvent {
  return cloneJson(event as unknown as JsonValue) as unknown as FrontierSemanticLeaseEvent;
}

function cloneMetadata(metadata: JsonObject | undefined): JsonObject | undefined {
  if (!metadata) return undefined;
  assertJsonValue(metadata, 'frontier semantic lease metadata');
  return cloneJson(metadata) as JsonObject;
}

function mergeMetadata(left: JsonObject | undefined, right: JsonObject | undefined): JsonObject | undefined {
  if (!left && !right) return undefined;
  return cloneMetadata({ ...(left || {}), ...(right || {}) });
}

function scopeComparableKeys(scope: FrontierSemanticLeaseScope): Set<string> {
  return new Set([scope.key, ...scope.aliases]);
}

function buildScopeKey(input: FrontierSemanticLeaseScopeInput): string {
  const kind = normalizeKeyPart(input.kind);
  if (input.kind === 'repository') return joinKey([kind, input.repository || '*']);
  if (input.kind === 'package') return joinKey([kind, input.repository, input.packageId || '*']);
  if (input.kind === 'lane') return joinKey([kind, input.repository, input.packageId, input.lane || '*']);
  if (input.kind === 'path') return joinKey([kind, input.repository, input.packageId, normalizePath(input.path) || '*']);
  if (input.kind === 'member') return joinKey([kind, input.repository, input.packageId, normalizePath(input.path), input.name, input.member || '*']);
  if (input.kind === 'docs-section') return joinKey([kind, input.repository, input.packageId, normalizePath(input.path), input.name || input.regionId || '*']);
  if (input.kind === 'test-fixture') return joinKey([kind, input.repository, input.packageId, normalizePath(input.path), input.name || input.regionId || '*']);
  return joinKey([kind, input.repository, input.packageId, normalizePath(input.path), input.regionId || input.name || '*']);
}

function implicitParentScopeKeys(input: FrontierSemanticLeaseScopeInput, key: string): string[] {
  const out: string[] = [];
  if (input.repository) out.push(buildScopeKey({ kind: 'repository', repository: input.repository }));
  if (input.packageId) out.push(buildScopeKey({ kind: 'package', repository: input.repository, packageId: input.packageId }));
  const path = normalizePath(input.path);
  if (path && input.kind !== 'path') out.push(buildScopeKey({ kind: 'path', repository: input.repository, packageId: input.packageId, path }));
  if (input.kind === 'member' && input.name) {
    out.push(buildScopeKey({ kind: 'export', repository: input.repository, packageId: input.packageId, path, name: input.name }));
    out.push(buildScopeKey({ kind: 'type', repository: input.repository, packageId: input.packageId, path, name: input.name }));
    out.push(buildScopeKey({ kind: 'class', repository: input.repository, packageId: input.packageId, path, name: input.name }));
  }
  return uniqueStrings(out.map(normalizeScopeKey).filter((entry) => entry !== key));
}

function sameRepositoryPackage(left: FrontierSemanticLeaseScope, right: FrontierSemanticLeaseScope): boolean {
  return sameOptional(left.repository, right.repository) && sameOptional(left.packageId, right.packageId);
}

function sameOptional(left: string | undefined, right: string | undefined): boolean {
  return !left || !right || left === right;
}

function pathsOverlap(left: string | undefined, right: string | undefined): boolean {
  if (!left || !right) return false;
  const leftPath = trimPath(left);
  const rightPath = trimPath(right);
  return leftPath === rightPath || leftPath.startsWith(`${rightPath}/`) || rightPath.startsWith(`${leftPath}/`);
}

function trimPath(value: string): string {
  return value.replace(/\/+$/u, '');
}

function normalizePath(value: string | undefined): string | undefined {
  const text = optionalString(value);
  if (!text) return undefined;
  return text.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\.\//u, '').replace(/\/$/u, '');
}

function joinKey(parts: readonly unknown[]): string {
  return parts
    .map((part) => optionalString(part))
    .filter((part): part is string => !!part)
    .map(normalizeKeyPart)
    .join(':');
}

function normalizeScopeKey(value: string): string {
  return value.trim().replace(/\s+/g, ' ').replace(/\\/g, '/');
}

function normalizeKeyPart(value: unknown): string {
  return String(value ?? '').trim().replace(/\s+/g, '-').replace(/:/g, '/');
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length ? value.trim() : undefined;
}

function timestamp(value: number | undefined): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value as number)) : Date.now();
}

function positiveInteger(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) && Number(value) > 0 ? Math.floor(Number(value)) : fallback;
}

function uniqueStrings(values: readonly string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

function intersects(left: Set<string>, right: Set<string>): boolean {
  for (const value of left) if (right.has(value)) return true;
  return false;
}

function stripUndefined<T extends object>(input: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) out[key] = value;
  }
  return out as T;
}

function stableId(prefix: string, values: readonly unknown[]): string {
  return `${prefix}:${fnv1a(canonicalJson(values))}`;
}

function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index++) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36);
}

function canonicalJson(value: unknown): string {
  return JSON.stringify(sortJson(value));
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJson);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      const entry = (value as Record<string, unknown>)[key];
      if (entry !== undefined) out[key] = sortJson(entry);
    }
    return out;
  }
  return value;
}
