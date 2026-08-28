import { useRouter } from 'expo-router';

import { MilestonesScreen } from '../../screens/MainExperience';
import { useAppShell } from '../../state/appShell';

export default function MilestonesRoute() {
  const router = useRouter();
  const { progress } = useAppShell();

  return <MilestonesScreen progress={progress} onBack={() => router.back()} />;
}
