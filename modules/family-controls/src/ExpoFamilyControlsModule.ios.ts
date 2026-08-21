import { NativeModule, requireNativeModule } from 'expo';

import type {
  ExpoFamilyControlsEvents,
  FamilyActivityPickerResult,
  FamilyControlsAuthorizationSample,
  FamilyControlsAuthorizationStatus,
  FamilyControlsSelectionSummary,
  FamilyControlsShieldState,
  RoutineCompletionResult,
  ScheduledLockState,
} from './ExpoFamilyControls.types';

declare class ExpoFamilyControlsModule extends NativeModule<ExpoFamilyControlsEvents> {
  getAuthorizationStatus(): FamilyControlsAuthorizationStatus;
  getAuthorizationStatusDiagnostic(): FamilyControlsAuthorizationSample;
  requestAuthorization(): Promise<FamilyControlsAuthorizationSample>;
  getSelectionSummary(): Promise<FamilyControlsSelectionSummary>;
  presentActivityPicker(): Promise<FamilyActivityPickerResult>;
  getShieldState(): Promise<FamilyControlsShieldState>;
  applyShield(): Promise<FamilyControlsShieldState>;
  removeShield(): Promise<FamilyControlsShieldState>;
  getScheduledLockState(): Promise<ScheduledLockState>;
  scheduleDailyLock(hour: number, minute: number): Promise<ScheduledLockState>;
  scheduleDiagnosticLock(minutesFromNow: number): Promise<ScheduledLockState>;
  setDiagnosticAccountabilityCompleted(
    completed: boolean
  ): Promise<ScheduledLockState>;
  completeRoutineToday(): Promise<RoutineCompletionResult>;
  cancelScheduledLocks(): Promise<ScheduledLockState>;
  resetScheduledLockDiagnostics(): Promise<ScheduledLockState>;
}

export default requireNativeModule<ExpoFamilyControlsModule>(
  'ExpoFamilyControls'
);
