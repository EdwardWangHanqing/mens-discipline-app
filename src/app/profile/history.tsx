import { useLocalSearchParams, useRouter } from 'expo-router';

import { movementById } from '../../data/movements';
import { HistoryScreen } from '../../screens/MainExperience';
import { useAppShell } from '../../state/appShell';

export default function HistoryRoute() {
  const router = useRouter();
  const { movementId } = useLocalSearchParams<{ movementId?: string }>();
  const { progress } = useAppShell();

  return <HistoryScreen progress={progress} movement={movementById(movementId)} onBack={() => router.back()} />;
}
