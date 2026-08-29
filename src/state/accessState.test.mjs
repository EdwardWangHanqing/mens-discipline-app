import assert from 'node:assert/strict';
import test from 'node:test';

import {
  canDismissPaywall,
  hasActiveEntitlement,
  membershipPresentation,
  normalizeAccessState,
  resolveAccessDestination,
} from './accessState.ts';

test('fresh signed-out users begin onboarding', () => {
  assert.equal(resolveAccessDestination(normalizeAccessState()), 'onboarding');
});

test('completed onboarding requires an account', () => {
  assert.equal(resolveAccessDestination(normalizeAccessState({ onboardingCompleted: true })), 'account');
});

test('signed-in users without access land on the required paywall', () => {
  assert.equal(resolveAccessDestination(normalizeAccessState({ authStatus: 'signedIn' })), 'paywall');
  assert.equal(resolveAccessDestination(normalizeAccessState({ authStatus: 'signedIn', entitlementStatus: 'expired' })), 'paywall');
});

test('all accepted active entitlement states route home', () => {
  for (const entitlementStatus of ['monthlyActive', 'annualTrial', 'annualActive']) {
    assert.equal(hasActiveEntitlement(entitlementStatus), true);
    assert.equal(resolveAccessDestination(normalizeAccessState({ authStatus: 'signedIn', entitlementStatus })), 'main');
  }
});

test('an entitlement never signs the user in implicitly', () => {
  assert.equal(
    resolveAccessDestination(normalizeAccessState({ onboardingCompleted: true, entitlementStatus: 'annualActive' })),
    'account'
  );
});

test('only the voluntary Membership context can dismiss the paywall', () => {
  assert.equal(canDismissPaywall('required'), false);
  assert.equal(canDismissPaywall('membership'), true);
});

test('active memberships expose the correct plan and renewal terms', () => {
  assert.deepEqual(membershipPresentation('annualTrial'), {
    plan: 'Annual',
    status: '3-Day Free Trial',
    badge: 'TRIAL ACTIVE',
    renewal: 'Renews at $39.99/year when the trial ends.',
  });
  assert.equal(membershipPresentation('annualActive')?.renewal, 'Renews at $39.99/year.');
  assert.equal(membershipPresentation('monthlyActive')?.renewal, 'Renews at $9.99/month.');
  assert.equal(membershipPresentation('expired'), null);
  assert.equal(membershipPresentation('none'), null);
});
