import type {
  FamilyControlsAuthorizationDisplayStatus,
  FamilyControlsAuthorizationStatus,
} from '../../modules/family-controls';
import type { DailyStatus } from '../screens/MainExperience';

export type ChooseAppsAuthorizationAction = 'openPicker' | 'requestAuthorization' | 'showRecovery';

export function isFamilyControlsAuthorizationUsable(status: FamilyControlsAuthorizationDisplayStatus) {
  return status === 'approved' || status === 'approvedWithDataAccess';
}

export function chooseAppsAuthorizationAction(
  status: FamilyControlsAuthorizationStatus
): ChooseAppsAuthorizationAction {
  if (isFamilyControlsAuthorizationUsable(status)) return 'openPicker';
  if (status === 'notDetermined') return 'requestAuthorization';
  return 'showRecovery';
}

export function canScheduleAccountability({
  authorizationStatus,
  dailyStatus,
  selectedAppCount,
  selectionRequiresReview,
}: {
  authorizationStatus: FamilyControlsAuthorizationDisplayStatus;
  dailyStatus: DailyStatus;
  selectedAppCount: number;
  selectionRequiresReview: boolean;
}) {
  return (
    isFamilyControlsAuthorizationUsable(authorizationStatus) &&
    !selectionRequiresReview &&
    selectedAppCount > 0 &&
    dailyStatus !== 'completed' &&
    dailyStatus !== 'skipped'
  );
}
