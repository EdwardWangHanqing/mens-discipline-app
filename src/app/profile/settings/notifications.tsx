import { useRouter } from 'expo-router';

import { NotificationsScreen } from '../../../screens/MainExperience';

export default function NotificationsRoute() {
  const router = useRouter();
  return <NotificationsScreen onBack={() => router.back()} />;
}
