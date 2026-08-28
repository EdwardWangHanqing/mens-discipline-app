import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { InformationScreen, type InformationPage } from '../../../screens/MainExperience';

const informationPages = new Set<InformationPage>(['help', 'privacy', 'terms', 'about']);

export default function InformationRoute() {
  const router = useRouter();
  const { page } = useLocalSearchParams<{ page?: string }>();
  if (!page || !informationPages.has(page as InformationPage)) return <Redirect href="/profile/settings" />;

  return <InformationScreen page={page as InformationPage} onBack={() => router.back()} />;
}
