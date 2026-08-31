export type NotificationAuthorizationStatus =
  | 'notDetermined'
  | 'denied'
  | 'authorized'
  | 'provisional'
  | 'ephemeral'
  | 'unknown';

export type HapticKind = 'impact' | 'selection' | 'success';
