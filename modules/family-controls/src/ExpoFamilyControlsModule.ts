import type {
  ExpoFamilyControlsEvents,
  FamilyActivityPickerResult,
  FamilyControlsAuthorizationSample,
  FamilyControlsAuthorizationStatus,
  FamilyControlsSelectionSummary,
  FamilyControlsShieldState,
} from './ExpoFamilyControls.types';

const unsupportedPlatformMessage =
  'Family Controls is only available in the iOS app.';

const unsupportedSelectionSummary: FamilyControlsSelectionSummary = {
  storageStatus: 'none',
  hasStoredSelection: false,
  hasSelection: false,
  isEmpty: true,
  applicationCount: 0,
  categoryCount: 0,
  webDomainCount: 0,
  persistedAtMs: null,
  errorMessage: null,
};

const unsupportedShieldState: FamilyControlsShieldState = {
  isApplied: false,
  applicationCount: 0,
  categoryCount: 0,
  webDomainCount: 0,
  usesAllCategories: false,
  source: 'unsupportedPlatform',
};

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
  async getSelectionSummary(): Promise<FamilyControlsSelectionSummary> {
    return unsupportedSelectionSummary;
  },
  async presentActivityPicker(): Promise<FamilyActivityPickerResult> {
    throw new Error(unsupportedPlatformMessage);
  },
  async getShieldState(): Promise<FamilyControlsShieldState> {
    return unsupportedShieldState;
  },
  async applyShield(): Promise<FamilyControlsShieldState> {
    throw new Error(unsupportedPlatformMessage);
  },
  async removeShield(): Promise<FamilyControlsShieldState> {
    return unsupportedShieldState;
  },
};
