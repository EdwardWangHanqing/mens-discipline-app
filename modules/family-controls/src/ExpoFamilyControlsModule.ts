import type {
  ExpoFamilyControlsEvents,
  FamilyActivityPickerResult,
  FamilyControlsAuthorizationSample,
  FamilyControlsAuthorizationStatus,
  FamilyControlsSelectionSummary,
  FamilyControlsShieldState,
  ScheduledLockState,
} from './ExpoFamilyControls.types';

const unsupportedPlatformMessage =
  'Family Controls is only available in the iOS app.';

const unsupportedSelectionSummary: FamilyControlsSelectionSummary = {
  storageStatus: 'none',
  storageScope: 'unavailable',
  sharedStorageAvailable: false,
  hasStoredSelection: false,
  hasSelection: false,
  isEmpty: true,
  applicationCount: 0,
  categoryCount: 0,
  webDomainCount: 0,
  persistedAtMs: null,
  errorMessage: null,
};

const unsupportedMonitoringState = {
  activityName: '',
  kind: 'oneOffDiagnostic' as const,
  isMonitoring: false,
  repeats: false,
  configuredStartHour: null,
  configuredStartMinute: null,
  nextIntervalStartMs: null,
  nextIntervalEndMs: null,
};

const unsupportedScheduledLockState: ScheduledLockState = {
  sharedStorageAvailable: false,
  accountability: {
    dateKey: '',
    completedToday: false,
    completedDateKey: null,
    updatedAtMs: null,
    source: 'diagnosticAppGroupState',
  },
  daily: {
    ...unsupportedMonitoringState,
    kind: 'dailyRecurring',
  },
  diagnostic: unsupportedMonitoringState,
  lastCallback: null,
  lastScheduleConfiguredAtMs: null,
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
  async getScheduledLockState(): Promise<ScheduledLockState> {
    return unsupportedScheduledLockState;
  },
  async scheduleDailyLock(
    _hour: number,
    _minute: number
  ): Promise<ScheduledLockState> {
    throw new Error(unsupportedPlatformMessage);
  },
  async scheduleDiagnosticLock(
    _minutesFromNow: number
  ): Promise<ScheduledLockState> {
    throw new Error(unsupportedPlatformMessage);
  },
  async setDiagnosticAccountabilityCompleted(
    _completed: boolean
  ): Promise<ScheduledLockState> {
    throw new Error(unsupportedPlatformMessage);
  },
  async cancelScheduledLocks(): Promise<ScheduledLockState> {
    return unsupportedScheduledLockState;
  },
  async resetScheduledLockDiagnostics(): Promise<ScheduledLockState> {
    return unsupportedScheduledLockState;
  },
};
