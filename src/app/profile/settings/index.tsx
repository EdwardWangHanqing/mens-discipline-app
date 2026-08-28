import { useRouter } from 'expo-router';

import { SettingsScreen, type InformationPage } from '../../../screens/MainExperience';

export default function SettingsRoute() {
  const router = useRouter();
  const openInformation = (page: InformationPage) => {
    router.push({ pathname: '/profile/settings/[page]', params: { page } });
  };

  return (
    <SettingsScreen
      onBack={() => router.back()}
      openNotifications={() => router.push('/profile/settings/notifications')}
      openInformation={openInformation}
      openIntroduction={() => router.push('/profile/settings/introduction')}
    />
  );
}
