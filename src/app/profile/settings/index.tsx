import { useRouter } from 'expo-router';

import { SettingsScreen, type InformationPage } from '../../../screens/MainExperience';
import { normalizeAccessState } from '../../../state/accessState';
import { useAppShell } from '../../../state/appShell';

export default function SettingsRoute() {
  const router = useRouter();
  const { setAccess, setOnboardingStep, setScreen } = useAppShell();
  const openInformation = (page: InformationPage) => {
    router.push({ pathname: '/profile/settings/[page]', params: { page } });
  };

  return (
    <SettingsScreen
      onBack={() => router.back()}
      openNotifications={() => router.push('/profile/settings/notifications')}
      openInformation={openInformation}
      openIntroduction={() => router.push('/profile/settings/introduction')}
      onRestartOnboarding={__DEV__ ? () => {
        setAccess(normalizeAccessState());
        setOnboardingStep(0);
        setScreen('onboarding');
        router.dismissAll();
      } : undefined}
    />
  );
}
