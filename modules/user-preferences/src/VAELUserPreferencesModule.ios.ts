import { NativeModule, requireNativeModule } from 'expo';

import type { HapticKind, NotificationAuthorizationStatus } from './VAELUserPreferences.types';

declare class VAELUserPreferencesModule extends NativeModule {
  getNotificationAuthorizationStatus(): Promise<NotificationAuthorizationStatus>;
  requestNotificationAuthorization(): Promise<NotificationAuthorizationStatus>;
  syncNotificationSchedules(
    dailyReveal: boolean,
    beforeLock: boolean,
    lockHour: number,
    lockMinute: number
  ): Promise<void>;
  sendMilestoneNotification(title: string, body: string): Promise<void>;
  performHaptic(kind: HapticKind): void;
}

export default requireNativeModule<VAELUserPreferencesModule>('VAELUserPreferences');
