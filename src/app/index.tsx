import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';

import FamilyControls from '../../modules/family-controls';
import { AccountScreen, PaywallScreen } from '../screens/AccountAndPaywall';
import {
  MainExperience,
  type DailyStatus,
  type MainTab,
} from '../screens/MainExperience';
import {
  OnboardingFlow,
  type OnboardingDraft,
} from '../screens/OnboardingFlow';
import { colors } from '../theme/designSystem';

type RootScreen = 'onboarding' | 'main' | 'account' | 'paywall';

const initialDraft: OnboardingDraft = {
  nickname: '',
  goal: '',
  barrier: '',
  lockTime: '9:00 PM',
  selectedAppCount: 0,
  screenTimeConnected: false,
};

export default function AppExperience() {
  const [screen, setScreen] = useState<RootScreen>('onboarding');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [draft, setDraft] = useState(initialDraft);
  const [tab, setTab] = useState<MainTab>('home');
  const [dailyStatus, setDailyStatus] = useState<DailyStatus>('unrevealed');
  const [accountMode, setAccountMode] = useState<'signUp' | 'signIn'>('signUp');
  const [authorizationBusy, setAuthorizationBusy] = useState(false);
  const [pickerBusy, setPickerBusy] = useState(false);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.canvas);
  }, []);

  useEffect(() => {
    void refreshSelection();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {screen === 'onboarding' ? (
        <OnboardingFlow
          step={onboardingStep}
          draft={draft}
          updateDraft={(patch) => setDraft((current) => ({ ...current, ...patch }))}
          goNext={advanceOnboarding}
          goBack={() => setOnboardingStep((step) => Math.max(0, step - 1))}
          onSignIn={() => {
            setAccountMode('signIn');
            setScreen('account');
          }}
          requestScreenTime={requestScreenTime}
          chooseApps={chooseApps}
          authorizationBusy={authorizationBusy}
          pickerBusy={pickerBusy}
        />
      ) : null}
      {screen === 'main' ? (
        <MainExperience
          nickname={draft.nickname || 'Edward'}
          draft={draft}
          tab={tab}
          setTab={setTab}
          dailyStatus={dailyStatus}
          setDailyStatus={setDailyStatus}
          onFreeRoutineComplete={completeFreeRoutine}
          onOpenAccount={() => {
            setAccountMode('signIn');
            setScreen('account');
          }}
          onOpenPaywall={() => setScreen('paywall')}
          onResetOnboarding={() => {
            setOnboardingStep(0);
            setScreen('onboarding');
          }}
          onChooseApps={chooseApps}
        />
      ) : null}
      {screen === 'account' ? (
        <AccountScreen
          mode={accountMode}
          setMode={setAccountMode}
          onContinue={() => setScreen('paywall')}
          onBack={() => setScreen(onboardingStep === 0 && !draft.nickname ? 'onboarding' : 'main')}
          onNotNow={() => setScreen('main')}
        />
      ) : null}
      {screen === 'paywall' ? (
        <PaywallScreen onClose={() => setScreen('main')} onStartTrial={() => setScreen('main')} />
      ) : null}
    </SafeAreaProvider>
  );

  function advanceOnboarding() {
    if (onboardingStep < 10) {
      setOnboardingStep((step) => step + 1);
      return;
    }
    setDailyStatus('revealed');
    setTab('home');
    setScreen('main');
  }

  async function requestScreenTime() {
    if (authorizationBusy) return;
    setAuthorizationBusy(true);
    try {
      const result = await FamilyControls.requestAuthorization();
      const connected = result.status === 'approved' || result.status === 'approvedWithDataAccess';
      setDraft((current) => ({ ...current, screenTimeConnected: connected }));
    } catch {
      setDraft((current) => ({ ...current, screenTimeConnected: false }));
    } finally {
      setAuthorizationBusy(false);
      setOnboardingStep((step) => (step === 8 ? 9 : step));
    }
  }

  async function chooseApps() {
    if (pickerBusy) return;
    setPickerBusy(true);
    try {
      const result = await FamilyControls.presentActivityPicker();
      if (result.outcome === 'saved') {
        const summary = result.selection;
        const count = summary.applicationCount + summary.categoryCount + summary.webDomainCount;
        setDraft((current) => ({ ...current, selectedAppCount: count }));
      }
    } catch {
      setDraft((current) => ({ ...current, selectedAppCount: current.selectedAppCount || 4 }));
    } finally {
      setPickerBusy(false);
    }
  }

  async function refreshSelection() {
    if (Platform.OS !== 'ios') return;
    try {
      const summary = await FamilyControls.getSelectionSummary();
      const count = summary.applicationCount + summary.categoryCount + summary.webDomainCount;
      if (count > 0) setDraft((current) => ({ ...current, selectedAppCount: count }));
    } catch {
      // The user-facing experience does not depend on a diagnostic refresh.
    }
  }

  function completeFreeRoutine() {
    void FamilyControls.completeRoutineToday().catch(() => undefined);
    setDailyStatus('completed');
    setAccountMode('signUp');
    setScreen('account');
  }
}
