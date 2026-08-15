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
