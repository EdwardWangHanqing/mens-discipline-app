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

export type FamilyControlsSelectionSummary = {
  storageStatus: FamilyControlsSelectionStorageStatus;
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
