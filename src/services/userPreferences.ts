import AsyncStorage from '@react-native-async-storage/async-storage';

import UserPreferencesNative, {
  type HapticKind,
  type NotificationAuthorizationStatus,
} from '../../modules/user-preferences';

export type NotificationPreferenceKey = 'dailyReveal' | 'beforeLock' | 'milestones';

export type UserPreferences = {
  notifications: Record<NotificationPreferenceKey, boolean>;
  haptics: boolean;
};

const preferencesStorageKey = 'vael.user-preferences.v1';
const appStateStorageKey = 'mens-discipline.app-state.v1';

export const defaultUserPreferences: UserPreferences = {
  notifications: {
    dailyReveal: false,
    beforeLock: false,
    milestones: false,
  },
  haptics: true,
};

export async function loadUserPreferences(): Promise<UserPreferences> {
  try {
    const raw = await AsyncStorage.getItem(preferencesStorageKey);
    if (!raw) return defaultUserPreferences;
    const saved = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      haptics: typeof saved.haptics === 'boolean' ? saved.haptics : defaultUserPreferences.haptics,
      notifications: {
        ...defaultUserPreferences.notifications,
        ...saved.notifications,
      },
    };
  } catch {
    return defaultUserPreferences;
  }
}

export async function saveUserPreferences(preferences: UserPreferences) {
  await AsyncStorage.setItem(preferencesStorageKey, JSON.stringify(preferences));
}

export async function loadStoredLockTime() {
  try {
    const raw = await AsyncStorage.getItem(appStateStorageKey);
    if (!raw) return '9:00 PM';
    const saved = JSON.parse(raw) as { draft?: { lockTime?: string } };
    return saved.draft?.lockTime ?? '9:00 PM';
  } catch {
    return '9:00 PM';
  }
}

export async function syncNotificationSchedules(preferences: UserPreferences, lockTime: string) {
  const parsed = parseLockTime(lockTime);
  if (!parsed) return;
  await UserPreferencesNative.syncNotificationSchedules(
    preferences.notifications.dailyReveal,
    preferences.notifications.beforeLock,
    parsed.hour,
    parsed.minute
  );
}

export async function syncStoredNotificationSchedules(lockTime: string) {
  const preferences = await loadUserPreferences();
  await syncNotificationSchedules(preferences, lockTime);
}

export function getNotificationAuthorizationStatus() {
  return UserPreferencesNative.getNotificationAuthorizationStatus();
}

export function requestNotificationAuthorization() {
  return UserPreferencesNative.requestNotificationAuthorization();
}

export function performHaptic(kind: HapticKind) {
  UserPreferencesNative.performHaptic(kind);
}

export async function performHapticIfEnabled(kind: HapticKind) {
  const preferences = await loadUserPreferences();
  if (preferences.haptics) UserPreferencesNative.performHaptic(kind);
}

export async function sendMilestoneNotification(title: string, body: string) {
  const preferences = await loadUserPreferences();
  if (!preferences.notifications.milestones) return;
  await UserPreferencesNative.sendMilestoneNotification(title, body);
}

export function notificationsAuthorized(status: NotificationAuthorizationStatus) {
  return status === 'authorized' || status === 'provisional' || status === 'ephemeral';
}

function parseLockTime(value: string) {
  const match = /^(\d{1,2}):(\d{2})\s(AM|PM)$/i.exec(value);
  if (!match) return null;
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  return { hour, minute: Number(match[2]) };
}
