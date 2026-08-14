import type { FamilyControlsAuthorizationStatus } from './ExpoFamilyControls.types';

const unsupportedPlatformMessage =
  'Family Controls authorization is only available in the iOS app.';

export default {
  getAuthorizationStatus(): FamilyControlsAuthorizationStatus {
    return 'unknown';
  },
  async requestAuthorization(): Promise<void> {
    throw new Error(unsupportedPlatformMessage);
  },
};
