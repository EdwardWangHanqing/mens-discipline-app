import type {
  ExpoFamilyControlsEvents,
  FamilyControlsAuthorizationSample,
  FamilyControlsAuthorizationStatus,
} from './ExpoFamilyControls.types';

const unsupportedPlatformMessage =
  'Family Controls authorization is only available in the iOS app.';

export default {
  getAuthorizationStatus(): FamilyControlsAuthorizationStatus {
    return 'unknown';
  },
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
  },
  addListener<EventName extends keyof ExpoFamilyControlsEvents>(
    _eventName: EventName,
    _listener: ExpoFamilyControlsEvents[EventName]
  ) {
    return { remove() {} };
  },
  async requestAuthorization(): Promise<FamilyControlsAuthorizationSample> {
    throw new Error(unsupportedPlatformMessage);
  },
};
