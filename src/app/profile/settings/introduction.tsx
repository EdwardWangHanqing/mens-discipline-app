import { useRouter } from 'expo-router';

import { IntroductionReplayScreen } from '../../../screens/MainExperience';

export default function IntroductionRoute() {
  const router = useRouter();
  return <IntroductionReplayScreen onBack={() => router.back()} />;
}
