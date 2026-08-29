import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ProfileScreen } from '../../screens/MainExperience';
import { useAppShell } from '../../state/appShell';

export default function ProfileRoute() {
  const router = useRouter();
  const { movementId } = useLocalSearchParams<{ movementId?: string }>();
  const { access, draft, progress, setAccountMode, setDraft, setScreen } = useAppShell();

  const openRootFlow = (screen: 'account' | 'paywall') => {
    if (screen === 'account') setAccountMode('signIn');
    setScreen(screen);
    router.dismissAll();
  };

  return (
    <ProfileScreen
      nickname={draft.nickname || 'Edward'}
      progress={progress}
      avatarUri={draft.avatarUri}
      onEditAvatar={access.authStatus === 'signedIn' ? () => void chooseProfilePhoto() : undefined}
      onBack={() => router.back()}
      openHistory={() => router.push({ pathname: '/profile/history', params: { movementId } })}
      openMilestones={() => router.push('/profile/milestones')}
      openSettings={() => router.push('/profile/settings')}
      openAccount={() => openRootFlow('account')}
      openMembership={() => router.push('/profile/membership')}
    />
  );

  async function chooseProfilePhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Allow Photos access in Settings to choose a VAEL profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setDraft((current) => ({ ...current, avatarUri: result.assets[0].uri }));
    }
  }
}
