import { useRouter } from 'expo-router';

import { MembershipScreen } from '../../screens/MainExperience';
import { useAppShell } from '../../state/appShell';

export default function MembershipRoute() {
  const router = useRouter();
  const { setScreen } = useAppShell();

  const openPaywall = () => {
    setScreen('paywall');
    router.dismissAll();
  };

  return <MembershipScreen onBack={() => router.back()} onOpenPaywall={openPaywall} />;
}
