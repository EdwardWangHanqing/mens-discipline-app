import { NativeModule, registerWebModule } from 'expo';

import type { FamilyControlsAuthorizationStatus } from './ExpoFamilyControls.types';

class ExpoFamilyControlsModule extends NativeModule {
  getAuthorizationStatus(): FamilyControlsAuthorizationStatus {
    return 'unknown';
  }

  async requestAuthorization(): Promise<void> {
    throw new Error(
      'Family Controls authorization is only available in the iOS app.'
    );
  }
}

export default registerWebModule(ExpoFamilyControlsModule, 'ExpoFamilyControlsModule');
