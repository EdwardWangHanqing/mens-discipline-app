import { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { AccountScreen, PaywallScreen, type AuthResult } from './AccountAndPaywall';
import {
  MainExperience,
  type DailyStatus,
  type GraceState,
  type MainExperienceSubscreen,
  type MainTab,
  type ProgressSummary,
  type SessionPhase,
} from './MainExperience';
import { OnboardingFlow, type OnboardingDraft } from './OnboardingFlow';
import { movementById } from '../data/movements';
import { colors, radii, spacing, typography } from '../theme/designSystem';

type PreviewKind = 'main' | 'onboarding' | 'account' | 'paywall';
type AccountMode = 'signUp' | 'signIn';

type QaState = {
  kind: PreviewKind;
  tab: MainTab;
  dailyStatus: DailyStatus;
  session: SessionPhase | null;
  subscreen: MainExperienceSubscreen;
  setNumber: number;
  reps: number;
  restSeconds: number;
  graceActive: boolean;
  selectedAppCount: number;
  onboardingStep: number;
  accountMode: AccountMode;
  frozen: boolean;
};

type Scenario = {
  id: string;
  label: string;
  group: 'Home' | 'Train' | 'Locks' | 'Onboarding' | 'Other';
  state: Partial<QaState>;
};

const baseState: QaState = {
  kind: 'main',
  tab: 'home',
  dailyStatus: 'unrevealed',
  session: null,
  subscreen: 'main',
  setNumber: 1,
  reps: 0,
  restSeconds: 20,
  graceActive: false,
  selectedAppCount: 4,
  onboardingStep: 0,
  accountMode: 'signIn',
  frozen: true,
};

const scenarios: Scenario[] = [
  { id: 'home-first', label: 'First-Ever / Unrevealed', group: 'Home', state: { tab: 'home', dailyStatus: 'unrevealed' } },
  { id: 'home-active', label: 'Revealed / Active', group: 'Home', state: { tab: 'home', dailyStatus: 'inProgress', reps: 7 } },
  { id: 'home-complete', label: 'Complete', group: 'Home', state: { tab: 'home', dailyStatus: 'completed' } },
  { id: 'home-skipped', label: 'Skipped', group: 'Home', state: { tab: 'home', dailyStatus: 'skipped' } },
  { id: 'home-grace', label: 'Grace / Recoverable', group: 'Home', state: { tab: 'home', dailyStatus: 'inProgress', graceActive: true } },

  { id: 'train-ready', label: 'Ready / Overview', group: 'Train', state: { tab: 'train', dailyStatus: 'revealed' } },
  { id: 'train-countdown', label: 'Countdown / Set 1', group: 'Train', state: { tab: 'train', dailyStatus: 'inProgress', session: 'countdown', setNumber: 1, reps: 0 } },
  { id: 'train-set-1', label: 'Active / Set 1', group: 'Train', state: { tab: 'train', dailyStatus: 'inProgress', session: 'active', setNumber: 1, reps: 4 } },
  { id: 'train-rest', label: 'Rest / Between Sets', group: 'Train', state: { tab: 'train', dailyStatus: 'inProgress', session: 'rest', setNumber: 2, reps: 15, restSeconds: 10 } },
  { id: 'train-mid', label: 'Active / Mid Session', group: 'Train', state: { tab: 'train', dailyStatus: 'inProgress', session: 'active', setNumber: 3, reps: 8 } },
  { id: 'train-final', label: 'Active / Final Set', group: 'Train', state: { tab: 'train', dailyStatus: 'inProgress', session: 'active', setNumber: 5, reps: 12 } },
  { id: 'train-complete', label: 'Complete', group: 'Train', state: { tab: 'train', dailyStatus: 'completed', session: 'complete', setNumber: 5, reps: 15 } },

  { id: 'locks-locked', label: 'Locked', group: 'Locks', state: { tab: 'locks', dailyStatus: 'revealed', selectedAppCount: 4 } },
  { id: 'locks-grace', label: 'Grace Active', group: 'Locks', state: { tab: 'locks', dailyStatus: 'inProgress', graceActive: true, selectedAppCount: 4 } },
  { id: 'locks-skipped', label: 'Skipped', group: 'Locks', state: { tab: 'locks', dailyStatus: 'skipped', selectedAppCount: 4 } },
  { id: 'locks-unlocked', label: 'Unlocked', group: 'Locks', state: { tab: 'locks', dailyStatus: 'completed', selectedAppCount: 4 } },

  ...Array.from({ length: 11 }, (_, step): Scenario => ({
    id: `onboarding-${step}`,
    label: step === 0 ? '00 · Brand' : `${String(step).padStart(2, '0')} · Screen ${step}`,
    group: 'Onboarding',
    state: { kind: 'onboarding', onboardingStep: step },
  })),

  { id: 'other-profile', label: 'Profile', group: 'Other', state: { subscreen: 'profile' } },
  { id: 'other-settings', label: 'Settings', group: 'Other', state: { subscreen: 'settings' } },
  { id: 'other-history', label: 'History', group: 'Other', state: { subscreen: 'history' } },
  { id: 'other-milestones', label: 'Milestones', group: 'Other', state: { subscreen: 'milestones' } },
  { id: 'other-notifications', label: 'Notifications', group: 'Other', state: { subscreen: 'notifications' } },
  { id: 'other-lock-preferences', label: 'Lock Preferences', group: 'Other', state: { subscreen: 'lockPreferences' } },
  { id: 'other-manage-apps', label: 'Manage Apps', group: 'Other', state: { subscreen: 'manageApps' } },
  { id: 'other-lock-schedule', label: 'Lock Schedule', group: 'Other', state: { subscreen: 'lockSchedule' } },
  { id: 'other-paywall', label: 'Paywall', group: 'Other', state: { kind: 'paywall' } },
  { id: 'other-sign-in', label: 'Sign In', group: 'Other', state: { kind: 'account', accountMode: 'signIn' } },
  { id: 'other-sign-up', label: 'Sign Up', group: 'Other', state: { kind: 'account', accountMode: 'signUp' } },
];

const initialDraft: OnboardingDraft = {
  nickname: 'Edward',
  goal: 'Better control',
  barrier: 'Apps pull me in',
  lockTime: '9:00 PM',
  selectedAppCount: 4,
  screenTimeConnected: true,
};

const previewProgress: ProgressSummary = {
  sessions: 12,
  cycles: 1,
  momentumDays: 4,
  longestMomentum: 7,
  completedDates: ['2026-08-22', '2026-08-23', '2026-08-24'],
  skippedDates: [],
};

// Keep visual QA on the supplied production asset so Home, Begin, and the
// automatic preparation countdown can be reviewed together.
const previewMovement = movementById('kneeling-drive');

export function DesignQAPreview() {
  const { width, height } = useWindowDimensions();
  const wide = Platform.OS === 'web' && width >= 980;
  const [qa, setQa] = useState<QaState>(baseState);
  const [selectedScenario, setSelectedScenario] = useState('home-first');
  const [draft, setDraft] = useState(initialDraft);
  const groups = useMemo(() => ['Home', 'Train', 'Locks', 'Onboarding', 'Other'] as const, []);
  const frameWidth = Math.min(430, wide ? Math.max(360, width - 420) : Math.max(320, width - spacing.xl * 2));
  const frameHeight = wide ? Math.min(880, Math.max(700, height - spacing.xl * 2)) : 820;
  const mainKey = [qa.tab, qa.dailyStatus, qa.session ?? 'none', qa.subscreen, qa.setNumber, qa.reps, qa.restSeconds, qa.graceActive, qa.frozen].join('-');

  const content = (
    <>
      <ScrollView
        scrollEnabled={wide}
        style={[styles.controls, wide ? styles.controlsWide : styles.controlsStacked]}
        contentContainerStyle={styles.controlsContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.qaHeader}>
          <Text style={styles.qaEyebrow}>DEVELOPMENT ONLY</Text>
          <Text style={styles.qaTitle}>VAEL Design QA</Text>
          <Text style={styles.qaSupport}>Shared React Native screens, deterministic states, and web-safe iOS capability mocks.</Text>
        </View>

        {groups.map((group) => (
          <QaSection key={group} title={group}>
            <View style={styles.scenarioGrid}>
              {scenarios.filter((scenario) => scenario.group === group).map((scenario) => (
                <QaButton
                  key={scenario.id}
                  label={scenario.label}
                  selected={selectedScenario === scenario.id}
                  onPress={() => applyScenario(scenario)}
                />
              ))}
            </View>
          </QaSection>
        ))}

        <QaSection title="Session Controls">
          <Text style={styles.controlLabel}>Phase</Text>
          <View style={styles.segmentRow}>
            {(['ready', 'countdown', 'active', 'rest', 'complete'] as const).map((phase) => (
              <QaButton key={phase} compact label={phase} selected={(qa.session ?? 'ready') === phase} onPress={() => setPhase(phase)} />
            ))}
          </View>

          <Text style={styles.controlLabel}>Current Set</Text>
          <View style={styles.segmentRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <QaButton key={value} compact label={String(value)} selected={qa.setNumber === value} onPress={() => patchQa({ setNumber: value })} />
            ))}
          </View>

          <Text style={styles.controlLabel}>Reps · 0–15</Text>
          <Counter value={qa.reps} min={0} max={15} onChange={(reps) => patchQa({ reps })} />

          <Text style={styles.controlLabel}>Rest Countdown</Text>
          <View style={styles.segmentRow}>
            {[20, 10, 5, 0].map((value) => (
              <QaButton key={value} compact label={`${value}s`} selected={qa.restSeconds === value} onPress={() => patchQa({ restSeconds: value, session: 'rest', tab: 'train', dailyStatus: 'inProgress' })} />
            ))}
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleCopy}>
              <Text style={styles.controlLabel}>Live Motion</Text>
              <Text style={styles.controlSupport}>{qa.frozen ? 'Frozen for visual inspection' : 'Timers and progress are running'}</Text>
            </View>
            <QaButton compact label={qa.frozen ? 'Play' : 'Freeze'} selected={!qa.frozen} onPress={() => patchQa({ frozen: !qa.frozen })} />
          </View>
        </QaSection>

        <QaSection title="State Actions">
          <View style={styles.actionGrid}>
            <QaButton label="Simulate Routine Complete" onPress={() => patchQa({ kind: 'main', tab: 'train', dailyStatus: 'completed', session: 'complete', setNumber: 5, reps: 15 })} />
            <QaButton label="Simulate Unlock" onPress={() => patchQa({ kind: 'main', tab: 'locks', dailyStatus: 'completed', session: null })} />
            <QaButton label="Grace Active" onPress={() => patchQa({ kind: 'main', tab: 'locks', dailyStatus: 'inProgress', graceActive: true, session: null })} />
            <QaButton label="Skip Today" onPress={() => patchQa({ kind: 'main', tab: 'home', dailyStatus: 'skipped', graceActive: false, session: null })} />
            <QaButton label="Reset Session" onPress={() => patchQa({ kind: 'main', tab: 'train', dailyStatus: 'revealed', session: null, setNumber: 1, reps: 0, restSeconds: 20 })} />
            <QaButton label="Reset State" onPress={() => { setQa(baseState); setDraft(initialDraft); setSelectedScenario('home-first'); }} />
          </View>
          <View style={styles.mockNotice}>
            <Text style={styles.mockTitle}>WEB CAPABILITY ADAPTER</Text>
            <Text style={styles.mockCopy}>Routine completion and unlock are preview-only state changes here. iOS continues to use the existing Family Controls and Device Activity implementation.</Text>
          </View>
        </QaSection>
      </ScrollView>

      <View style={[styles.previewStage, !wide && styles.previewStageStacked]}>
        <View style={styles.previewMeta}>
          <Text style={styles.previewTitle}>{selectedScenario === 'custom' ? 'Custom State' : scenarios.find((scenario) => scenario.id === selectedScenario)?.label}</Text>
          <Text style={styles.previewSize}>{Math.round(frameWidth)} × {Math.round(frameHeight)}</Text>
        </View>
        <View style={[styles.deviceFrame, { width: frameWidth, height: frameHeight }]}>
          {renderPreview()}
        </View>
      </View>
    </>
  );

  return wide ? (
    <View style={styles.shell}>{content}</View>
  ) : (
    <ScrollView style={styles.shell} contentContainerStyle={styles.stackedShell}>{content}</ScrollView>
  );

  function renderPreview() {
    if (qa.kind === 'onboarding') {
      return (
        <OnboardingFlow
          step={qa.onboardingStep}
          draft={draft}
          updateDraft={(patch) => setDraft((current) => ({ ...current, ...patch }))}
          goNext={() => patchQa({ onboardingStep: Math.min(10, qa.onboardingStep + 1) })}
          goBack={() => patchQa({ onboardingStep: Math.max(0, qa.onboardingStep - 1) })}
          onSignIn={() => patchQa({ kind: 'account', accountMode: 'signIn' })}
          requestScreenTime={() => setDraft((current) => ({ ...current, screenTimeConnected: true }))}
          chooseApps={() => setDraft((current) => ({ ...current, selectedAppCount: 4 }))}
          authorizationBusy={false}
          pickerBusy={false}
        />
      );
    }

    if (qa.kind === 'account') {
      return (
        <AccountScreen
          mode={qa.accountMode}
          setMode={(accountMode) => patchQa({ accountMode })}
          onContinue={() => patchQa({ kind: 'paywall' })}
          onBack={() => patchQa({ kind: 'main', tab: 'home' })}
          onNotNow={() => patchQa({ kind: 'main', tab: 'home' })}
          onAuthenticate={mockAuthentication}
          onForgotPassword={mockAuthentication}
        />
      );
    }

    if (qa.kind === 'paywall') {
      return <PaywallScreen onClose={() => patchQa({ kind: 'main', tab: 'home' })} onStartTrial={() => patchQa({ kind: 'main', tab: 'home', dailyStatus: 'completed' })} />;
    }

    const grace: GraceState = {
      dateKey: '2026-08-25',
      remaining: qa.graceActive ? 2 : 3,
      activeUntil: qa.graceActive ? Date.now() + 5 * 60 * 1000 : null,
    };
    return (
      <MainExperience
        key={mainKey}
        nickname={draft.nickname}
        draft={{ ...draft, selectedAppCount: qa.selectedAppCount }}
        movement={previewMovement}
        canReplaceMovement
        tab={qa.tab}
        setTab={(tab) => patchQa({ tab, session: null, subscreen: 'main' })}
        dailyStatus={qa.dailyStatus}
        progress={previewProgress}
        grace={grace}
        setGrace={(next) => {
          const resolved = typeof next === 'function' ? next(grace) : next;
          patchQa({ graceActive: resolved.activeUntil !== null });
        }}
        setDailyStatus={(dailyStatus) => patchQa({ dailyStatus })}
        onRoutineCompleted={() => patchQa({ dailyStatus: 'completed', session: 'complete', setNumber: 5, reps: 20 })}
        onCompletionContinue={() => patchQa({ kind: 'account', accountMode: 'signUp', session: null })}
        onOpenAccount={() => patchQa({ kind: 'account', accountMode: 'signIn' })}
        onOpenPaywall={() => patchQa({ kind: 'paywall' })}
        onResetOnboarding={() => patchQa({ kind: 'onboarding', onboardingStep: 0 })}
        onChooseApps={() => patchQa({ selectedAppCount: 4 })}
        onSkipToday={() => patchQa({ dailyStatus: 'skipped', session: null, graceActive: false })}
        onUpdateLockTime={(lockTime) => setDraft((current) => ({ ...current, lockTime }))}
        onReplaceMovement={() => undefined}
        previewState={{
          subscreen: qa.subscreen,
          session: qa.session,
          setNumber: qa.setNumber,
          reps: qa.reps,
          restSeconds: qa.restSeconds,
          frozen: qa.frozen,
        }}
      />
    );
  }

  function applyScenario(scenario: Scenario) {
    setQa((current) => ({ ...baseState, frozen: current.frozen, ...scenario.state }));
    setSelectedScenario(scenario.id);
  }

  function patchQa(patch: Partial<QaState>) {
    setQa((current) => ({ ...current, ...patch }));
    setSelectedScenario('custom');
  }

  function setPhase(phase: 'ready' | 'countdown' | 'active' | 'rest' | 'complete') {
    if (phase === 'ready') {
      patchQa({ kind: 'main', tab: 'train', dailyStatus: 'revealed', session: null });
      return;
    }
    patchQa({
      kind: 'main',
      tab: 'train',
      dailyStatus: phase === 'complete' ? 'completed' : 'inProgress',
      session: phase,
      setNumber: phase === 'complete' ? 5 : qa.setNumber,
      reps: phase === 'complete' ? 15 : qa.reps,
    });
  }
}

async function mockAuthentication(): Promise<AuthResult> {
  return { ok: false, error: 'Design QA mock: no authentication provider or backend is called.' };
}

function QaSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function QaButton({ label, selected = false, compact = false, onPress }: { label: string; selected?: boolean; compact?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.qaButton, compact && styles.qaButtonCompact, selected && styles.qaButtonSelected, pressed && styles.qaButtonPressed]}
    >
      <Text style={[styles.qaButtonText, selected && styles.qaButtonTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function Counter({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <View style={styles.counter}>
      <QaButton compact label="0" selected={value === min} onPress={() => onChange(min)} />
      <QaButton compact label="−" onPress={() => onChange(Math.max(min, value - 1))} />
      <Text style={styles.counterValue}>{value}</Text>
      <QaButton compact label="+" onPress={() => onChange(Math.min(max, value + 1))} />
      <QaButton compact label={String(max)} selected={value === max} onPress={() => onChange(max)} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, flexDirection: 'row', backgroundColor: colors.canvas },
  stackedShell: { flexGrow: 1, paddingBottom: spacing.xxxl },
  controls: { width: 350, flexShrink: 0, borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: colors.borderStrong, backgroundColor: colors.surfaceSoft },
  controlsWide: { height: '100%' },
  controlsStacked: { width: '100%', borderRightWidth: 0 },
  controlsContent: { padding: spacing.xl, gap: spacing.xxl },
  qaHeader: { gap: spacing.sm, paddingTop: spacing.sm },
  qaEyebrow: { ...typography.eyebrow, color: colors.accent },
  qaTitle: { color: colors.primary, fontSize: 28, lineHeight: 34, fontWeight: '800' },
  qaSupport: { color: colors.secondary, fontSize: 13, lineHeight: 19 },
  section: { gap: spacing.md },
  sectionTitle: { ...typography.eyebrow, color: colors.primary, paddingBottom: spacing.xs, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  scenarioGrid: { gap: spacing.sm },
  qaButton: { minHeight: 38, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: spacing.md, alignItems: 'center', justifyContent: 'center' },
  qaButtonCompact: { minWidth: 42, minHeight: 36, flexGrow: 1 },
  qaButtonSelected: { borderColor: colors.accent, backgroundColor: colors.accentSurface },
  qaButtonPressed: { opacity: 0.74 },
  qaButtonText: { color: colors.secondary, fontSize: 12, lineHeight: 16, fontWeight: '600', textAlign: 'center' },
  qaButtonTextSelected: { color: colors.accent },
  controlLabel: { color: colors.primary, fontSize: 12, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase', marginTop: spacing.sm },
  controlSupport: { color: colors.tertiary, fontSize: 11, lineHeight: 16 },
  segmentRow: { flexDirection: 'row', gap: spacing.sm },
  counter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  counterValue: { minWidth: 34, color: colors.primary, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, marginTop: spacing.sm },
  toggleCopy: { flex: 1 },
  actionGrid: { gap: spacing.sm },
  mockNotice: { borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.md, gap: spacing.xs, marginTop: spacing.sm },
  mockTitle: { ...typography.eyebrow, color: colors.accent },
  mockCopy: { color: colors.secondary, fontSize: 11, lineHeight: 17 },
  previewStage: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  previewStageStacked: { minHeight: 900, paddingTop: spacing.xxxl },
  previewMeta: { width: '100%', maxWidth: 430, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewTitle: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  previewSize: { color: colors.tertiary, fontSize: 11, fontVariant: ['tabular-nums'] },
  deviceFrame: { overflow: 'hidden', borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 34, backgroundColor: colors.canvas, shadowColor: '#000', shadowOpacity: 0.46, shadowRadius: 28, shadowOffset: { width: 0, height: 16 } },
});
