import assert from 'node:assert/strict';
import test from 'node:test';

import {
  canScheduleAccountability,
  chooseAppsAuthorizationAction,
  isFamilyControlsAuthorizationUsable,
} from './familyControlsState.ts';

test('Choose Apps opens the picker only from native-approved states', () => {
  assert.equal(chooseAppsAuthorizationAction('approved'), 'openPicker');
  assert.equal(chooseAppsAuthorizationAction('approvedWithDataAccess'), 'openPicker');
  assert.equal(chooseAppsAuthorizationAction('notDetermined'), 'requestAuthorization');
  assert.equal(chooseAppsAuthorizationAction('denied'), 'showRecovery');
  assert.equal(chooseAppsAuthorizationAction('unknown'), 'showRecovery');
});

test('only native-approved states are usable', () => {
  assert.equal(isFamilyControlsAuthorizationUsable('approved'), true);
  assert.equal(isFamilyControlsAuthorizationUsable('approvedWithDataAccess'), true);
  assert.equal(isFamilyControlsAuthorizationUsable('checking'), false);
  assert.equal(isFamilyControlsAuthorizationUsable('notDetermined'), false);
  assert.equal(isFamilyControlsAuthorizationUsable('denied'), false);
  assert.equal(isFamilyControlsAuthorizationUsable('unknown'), false);
});

test('revoked or stale app selections cannot restore enforcement', () => {
  const base = {
    authorizationStatus: 'approved',
    dailyStatus: 'revealed',
    selectedAppCount: 2,
    selectionRequiresReview: false,
  };
  assert.equal(canScheduleAccountability(base), true);
  assert.equal(canScheduleAccountability({ ...base, authorizationStatus: 'denied' }), false);
  assert.equal(canScheduleAccountability({ ...base, selectionRequiresReview: true }), false);
  assert.equal(canScheduleAccountability({ ...base, selectedAppCount: 0 }), false);
  assert.equal(canScheduleAccountability({ ...base, dailyStatus: 'completed' }), false);
  assert.equal(canScheduleAccountability({ ...base, dailyStatus: 'skipped' }), false);
});
