export type FamilyControlsAuthorizationStatus =
  | 'notDetermined'
  | 'denied'
  | 'approved'
  | 'approvedWithDataAccess'
  | 'unknown';

export type FamilyControlsAuthorizationDisplayStatus =
  | 'checking'
  | FamilyControlsAuthorizationStatus;

export type FamilyControlsApplicationState =
  | 'active'
  | 'inactive'
  | 'background'
  | 'initializing'
  | 'unknown';

export type FamilyControlsAuthorizationSample = {
  status: FamilyControlsAuthorizationStatus;
  source: string;
  sequence: number;
  observedAtMs: number;
  moduleInitializedAtMs: number | null;
  appBecameActiveAtMs: number | null;
  applicationState: FamilyControlsApplicationState;
  firstNotDeterminedAtMs: number | null;
  firstResolvedAtMs: number | null;
  stabilizationDurationMs: number | null;
};

export type ExpoFamilyControlsEvents = {
  onAuthorizationStatusChanged: (
    sample: FamilyControlsAuthorizationSample
  ) => void;
};

export type FamilyControlsSelectionStorageStatus =
  | 'none'
  | 'available'
  | 'corrupt';

export type FamilyControlsSelectionStorageScope =
  | 'appGroup'
  | 'legacyApp'
  | 'unavailable';

export type FamilyControlsSelectionSummary = {
  storageStatus: FamilyControlsSelectionStorageStatus;
  storageScope: FamilyControlsSelectionStorageScope;
  sharedStorageAvailable: boolean;
  hasStoredSelection: boolean;
  hasSelection: boolean;
  isEmpty: boolean;
  applicationCount: number;
  categoryCount: number;
  webDomainCount: number;
  persistedAtMs: number | null;
  errorMessage: string | null;
};

export type FamilyActivityPickerOutcome = 'saved' | 'cancelled';

export type FamilyActivityPickerResult = {
  outcome: FamilyActivityPickerOutcome;
  selection: FamilyControlsSelectionSummary;
};

export type FamilyControlsShieldState = {
  isApplied: boolean;
  applicationCount: number;
  categoryCount: number;
  webDomainCount: number;
  usesAllCategories: boolean;
  source: 'namedManagedSettingsStore' | 'unsupportedPlatform';
};

export type ScheduledLockMonitoringState = {
  activityName: string;
  kind: 'dailyRecurring' | 'oneOffDiagnostic';
  isMonitoring: boolean;
  repeats: boolean;
  configuredStartHour: number | null;
  configuredStartMinute: number | null;
  nextIntervalStartMs: number | null;
  nextIntervalEndMs: number | null;
};

export type DiagnosticAccountabilityState = {
  dateKey: string;
  completedToday: boolean;
  completedDateKey: string | null;
  updatedAtMs: number | null;
  source: 'sharedAppGroupState';
};

export type RoutineCompletionResult = {
  accountability: DiagnosticAccountabilityState;
  shield: FamilyControlsShieldState;
  wasAlreadyCompletedToday: boolean;
};

export type ScheduledLockCallbackRecord = {
  activityName: string;
  callback: 'intervalDidStart' | 'intervalDidEnd';
  outcome:
    | 'appliedShield'
    | 'skippedCompletedToday'
    | 'skippedCorruptSelection'
    | 'skippedNoSelection'
    | 'removedShieldAtIntervalEnd';
  occurredAtMs: number;
  completedToday: boolean;
  applicationCount: number;
  categoryCount: number;
  webDomainCount: number;
};

export type ScheduledLockState = {
  sharedStorageAvailable: boolean;
  accountability: DiagnosticAccountabilityState;
  daily: ScheduledLockMonitoringState;
  diagnostic: ScheduledLockMonitoringState;
  lastCallback: ScheduledLockCallbackRecord | null;
  lastScheduleConfiguredAtMs: number | null;
};
