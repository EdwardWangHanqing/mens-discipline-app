import { NativeModule, registerWebModule } from 'expo';

import type {
  ExpoFamilyControlsEvents,
  FamilyControlsAuthorizationSample,
  FamilyControlsAuthorizationStatus,
} from './ExpoFamilyControls.types';

class ExpoFamilyControlsModule extends NativeModule<ExpoFamilyControlsEvents> {
  getAuthorizationStatus(): FamilyControlsAuthorizationStatus {
    return 'unknown';
  }

  getAuthorizationStatusDiagnostic(): FamilyControlsAuthorizationSample {
    const observedAtMs = Date.now();
    return {
      status: 'unknown',
      source: 'unsupportedPlatform',
      sequence: 0,
      observedAtMs,
      moduleInitializedAtMs: null,
      appBecameActiveAtMs: null,
      applicationState: 'unknown',
      firstNotDeterminedAtMs: null,
      firstResolvedAtMs: null,
      stabilizationDurationMs: null,
    };
  }

  async requestAuthorization(): Promise<FamilyControlsAuthorizationSample> {
    throw new Error(
      'Family Controls authorization is only available in the iOS app.'
    );
  }
}

export default registerWebModule(ExpoFamilyControlsModule, 'ExpoFamilyControlsModule');
