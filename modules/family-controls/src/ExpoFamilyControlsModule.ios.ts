import { NativeModule, requireNativeModule } from 'expo';

import type { FamilyControlsAuthorizationStatus } from './ExpoFamilyControls.types';

declare class ExpoFamilyControlsModule extends NativeModule {
  getAuthorizationStatus(): FamilyControlsAuthorizationStatus;
  requestAuthorization(): Promise<void>;
}

export default requireNativeModule<ExpoFamilyControlsModule>(
  'ExpoFamilyControls'
);
