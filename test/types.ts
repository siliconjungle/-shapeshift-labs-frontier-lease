import {
  acquireSemanticLease,
  createSemanticLeaseFence,
  createSemanticLeaseState,
  defineChangedPathLeaseScopes,
  defineSemanticLeaseScope,
  validateSemanticLeaseApply,
  validateSemanticLeaseFence,
  type FrontierSemanticLeaseApplyValidation,
  type FrontierSemanticLeaseFenceTicket,
  type FrontierSemanticLeaseScope,
  type FrontierSemanticLeaseState
} from '../dist/index.js';

const state: FrontierSemanticLeaseState = createSemanticLeaseState({ id: 'types' });
const scope: FrontierSemanticLeaseScope = defineSemanticLeaseScope({
  kind: 'export',
  packageId: 'frontier-swarm',
  path: 'src/index.ts',
  name: 'createSwarmPlan'
});
const acquired = acquireSemanticLease(state, {
  ownerId: 'coordinator',
  scopes: [scope]
});

if (acquired.lease) {
  const fence: FrontierSemanticLeaseFenceTicket = createSemanticLeaseFence(acquired.lease);
  const applyScopes = defineChangedPathLeaseScopes({ packageId: 'frontier-swarm', paths: ['src/index.ts'] });
  const applyValidation: FrontierSemanticLeaseApplyValidation = validateSemanticLeaseApply(acquired.state, {
    fences: [fence],
    scopes: applyScopes
  });
  validateSemanticLeaseFence(acquired.state, {
    leaseId: acquired.lease.id,
    token: acquired.lease.token,
    fencingToken: acquired.lease.fencingToken,
    scopes: [scope]
  });
  applyValidation.coveredScopeKeys satisfies string[];
}
