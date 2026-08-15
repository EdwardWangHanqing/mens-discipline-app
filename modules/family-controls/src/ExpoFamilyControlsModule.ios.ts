import { NativeModule, requireNativeModule } from 'expo';

import type {
  ExpoFamilyControlsEvents,
  FamilyControlsAuthorizationSample,
  FamilyControlsAuthorizationStatus,
} from './ExpoFamilyControls.types';

declare class ExpoFamilyControlsModule extends NativeModule<ExpoFamilyControlsEvents> {
  getAuthorizationStatus(): FamilyControlsAuthorizationStatus;
  getAuthorizationStatusDiagnostic(): FamilyControlsAuthorizationSample;
  requestAuthorization(): Promise<FamilyControlsAuthorizationSample>;
}

export default requireNativeModule<ExpoFamilyControlsModule>(
  'ExpoFamilyControls'
);
