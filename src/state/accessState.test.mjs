import assert from 'node:assert/strict';
import test from 'node:test';

import {
  hasActiveEntitlement,
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
