import {
  acquireSemanticLease,
  createSemanticLeaseState,
  defineSemanticLeaseScope,
  validateSemanticLeaseFence,
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
  validateSemanticLeaseFence(acquired.state, {
    leaseId: acquired.lease.id,
    token: acquired.lease.token,
    fencingToken: acquired.lease.fencingToken,
    scopes: [scope]
  });
}
