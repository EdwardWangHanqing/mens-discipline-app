import { useLocalSearchParams, useRouter } from 'expo-router';

import { ProfileScreen } from '../../screens/MainExperience';
import { useAppShell } from '../../state/appShell';

export default function ProfileRoute() {
  const router = useRouter();
  const { movementId } = useLocalSearchParams<{ movementId?: string }>();
  const { draft, progress, setAccountMode, setPaywallContext, setScreen } = useAppShell();

  const openRootFlow = (screen: 'account' | 'paywall') => {
    if (screen === 'account') setAccountMode('signIn');
    setScreen(screen);
    router.dismissAll();
  };

  return (
    <ProfileScreen
      nickname={draft.nickname || 'Edward'}
      progress={progress}
      onBack={() => router.back()}
      openHistory={() => router.push({ pathname: '/profile/history', params: { movementId } })}
      openMilestones={() => router.push('/profile/milestones')}
      openSettings={() => router.push('/profile/settings')}
      openAccount={() => openRootFlow('account')}
      openMembership={() => {
        setPaywallContext('membership');
        setScreen('paywall');
        router.dismissAll();
      }}
    />
  );
}
