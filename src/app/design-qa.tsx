import { Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DesignQAPreview } from '../screens/DesignQAPreview';

export default function DesignQaRoute() {
  if (!__DEV__) return <Redirect href="/" />;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <DesignQAPreview />
    </SafeAreaProvider>
  );
}
