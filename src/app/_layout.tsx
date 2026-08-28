import { Stack } from 'expo-router';

import { AppShellProvider } from '../state/appShell';
import { colors } from '../theme/designSystem';

export default function RootLayout() {
  return (
    <AppShellProvider>
      <Stack
        screenOptions={{
          animation: 'simple_push',
          animationMatchesGesture: true,
          contentStyle: { backgroundColor: colors.canvas },
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerShown: false,
        }}
      />
    </AppShellProvider>
  );
}
