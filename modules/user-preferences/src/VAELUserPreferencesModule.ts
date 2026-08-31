import type { HapticKind, NotificationAuthorizationStatus } from './VAELUserPreferences.types';

export default {
  async getNotificationAuthorizationStatus(): Promise<NotificationAuthorizationStatus> {
    return 'unknown';
  },
  async requestNotificationAuthorization(): Promise<NotificationAuthorizationStatus> {
    return 'unknown';
  },
  async syncNotificationSchedules(
    _dailyReveal: boolean,
    _beforeLock: boolean,
    _lockHour: number,
    _lockMinute: number
  ): Promise<void> {},
  async sendMilestoneNotification(_title: string, _body: string): Promise<void> {},
  performHaptic(_kind: HapticKind): void {},
};
