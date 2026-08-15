import { NativeModule, requireNativeModule } from 'expo';

import type {
  ExpoFamilyControlsEvents,
  FamilyActivityPickerResult,
  FamilyControlsAuthorizationSample,
  FamilyControlsAuthorizationStatus,
  FamilyControlsSelectionSummary,
  FamilyControlsShieldState,
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
}

export default requireNativeModule<ExpoFamilyControlsModule>(
  'ExpoFamilyControls'
);
