import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { useAppShell } from '../../state/appShell';
import { colors } from '../../theme/designSystem';

export default function MembershipRoute() {
  const router = useRouter();
  const { setPaywallContext, setScreen } = useAppShell();

  useEffect(() => {
    setPaywallContext('membership');
    setScreen('paywall');
    router.dismissAll();
  }, [router, setPaywallContext, setScreen]);

  return <View style={{ flex: 1, backgroundColor: colors.canvas }} />;
}
