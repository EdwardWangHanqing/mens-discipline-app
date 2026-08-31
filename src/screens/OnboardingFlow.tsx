import type { ReactNode } from 'react';
import { Linking, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Animated, { FadeInRight, FadeOutLeft, useReducedMotion } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import type { FamilyControlsAuthorizationDisplayStatus } from '../../modules/family-controls';
import { Body, Icon, PrimaryButton, Screen, TextButton, Title, TopBar } from '../components/ui';
import { VaelMark } from '../components/Brand';
import { colors, radii, spacing, typography } from '../theme/designSystem';

const foundationCoach = require('../../assets/images/onboarding-foundation-coach.png');
const foundationHips = require('../../assets/images/onboarding-foundation-hips.png');
const foundationCore = require('../../assets/images/onboarding-foundation-core.png');
const foundationPelvicControl = require('../../assets/images/onboarding-foundation-pelvic-control.png');
const accountabilityCoach = require('../../assets/images/onboarding-accountability-coach.png');

export type OnboardingDraft = {
  nickname: string;
  avatarUri?: string;
  goal: string;
  barrier: string;
  lockTime: string;
  selectedAppCount: number;
  screenTimeConnected: boolean;
};

export function OnboardingFlow({ step, draft, updateDraft, goNext, goBack, onSignIn, chooseApps, pickerBusy, authorizationStatus, familyControlsMessage }: {
  step: number;
  draft: OnboardingDraft;
  updateDraft: (patch: Partial<OnboardingDraft>) => void;
  goNext: () => void;
  goBack: () => void;
  onSignIn: () => void;
  chooseApps: () => void;
  pickerBusy: boolean;
  authorizationStatus: FamilyControlsAuthorizationDisplayStatus;
  familyControlsMessage: string | null;
}) {
  const reduceMotion = useReducedMotion();
  if (step === 0) return <BrandStep onContinue={goNext} onSignIn={onSignIn} />;
  if (step === 1) return <FoundationStep onContinue={goNext} />;
  return (
    <Screen scroll testID={`onboarding-step-${step}`} contentStyle={styles.stepScreen}>
      <TopBar onBack={goBack} />
      <Animated.View key={step} entering={reduceMotion ? undefined : FadeInRight.duration(280)} exiting={reduceMotion ? undefined : FadeOutLeft.duration(180)} style={styles.stepBody}>
        {step === 2 ? <DailyRuleStep onContinue={goNext} /> : null}
        {step === 3 ? <LockTimeStep value={draft.lockTime} onChange={(lockTime) => updateDraft({ lockTime })} onContinue={goNext} /> : null}
        {step === 4 ? <AccountabilityStep selectedAppCount={draft.selectedAppCount} authorizationStatus={authorizationStatus} message={familyControlsMessage} busy={pickerBusy} chooseApps={chooseApps} onContinue={goNext} /> : null}
      </Animated.View>
      <ProgressDots current={step} total={5} />
    </Screen>
  );
}

function BrandStep({ onContinue, onSignIn }: { onContinue: () => void; onSignIn: () => void }) {
  return (
    <Screen testID="onboarding-brand" contentStyle={styles.brandScreen}>
      <View style={styles.brandAtmosphere} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 393 560" style={StyleSheet.absoluteFill}>
          <Path d="M-24 420 L95 252 L146 305 L198 224 L265 300 L318 244 L430 405" fill="none" stroke={colors.borderStrong} strokeWidth={1} />
          <Path d="M-24 456 L95 288 L146 341 L198 260 L265 336 L318 280 L430 441" fill="none" stroke={colors.border} strokeWidth={1} />
          <Circle cx={304} cy={182} r={5} fill={colors.accent} />
        </Svg>
      </View>
      <View style={styles.brandIdentity}>
        <VaelMark size={116} strokeWidth={2.8} />
        <Text style={styles.brandWordmark}>VAEL</Text>
        <Text style={styles.brandAttributes}>FOCUSED · DISCIPLINED · PRIVATE</Text>
      </View>
      <View style={styles.brandCopy}>
        <Text style={styles.brandHeadline}>Train what{`\n`}most men <Text style={styles.accentWord}>ignore.</Text></Text>
        <Text style={styles.brandSupport}>Short, private training for the foundation most routines overlook.</Text>
        <Text style={styles.brandAreas}>HIPS · CORE · PELVIC CONTROL</Text>
      </View>
      <View style={styles.brandActions}>
        <PrimaryButton label="Get Started" onPress={onContinue} testID="get-started" />
        <TextButton label="Sign In" onPress={onSignIn} />
        <ProgressDots current={0} total={5} />
      </View>
    </Screen>
  );
}

function FoundationStep({ onContinue }: { onContinue: () => void }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const compactHeight = width <= 390 || height <= 820;
  const coachWidth = Math.min(430, Math.max(344, width * 0.99));
  const actionInset = Math.max(insets.bottom, spacing.xl) + spacing.xs;
  return (
    <Screen testID="onboarding-step-1" contentStyle={styles.foundationScreen}>
      <View style={styles.foundationHeader}>
        <Text style={styles.eyebrow}>THE FOUNDATION</Text>
        <Text style={styles.foundationHeadline}>
          Most men train{`\n`}what shows.{`\n`}We train <Text style={styles.accentWord}>what controls.</Text>
        </Text>
        <Text style={styles.foundationSupport}>Hips, Core, Pelvic control.{`\n`}The foundation of men’s{`\n`}performance.</Text>
      </View>
      <View style={[styles.foundationStage, compactHeight && styles.foundationStageCompact]}>
        <Image
          source={foundationCoach}
          style={[styles.foundationCoach, { width: coachWidth }, compactHeight && styles.foundationCoachCompact]}
          contentFit="contain"
          transition={180}
        />
        <View style={[styles.foundationList, compactHeight && styles.foundationListCompact]}>
          <FoundationFocusRow image={foundationHips} title="Hips" support="Power and stability." />
          <FoundationFocusRow image={foundationCore} title="Core" support="Strength and control." />
          <FoundationFocusRow image={foundationPelvicControl} title="Pelvic Control" support="Control that carries over." />
        </View>
      </View>
      <View style={[styles.foundationActions, { paddingBottom: actionInset }]}>
        <PrimaryButton label="Continue" onPress={onContinue} />
        <ProgressDots current={1} total={5} />
      </View>
    </Screen>
  );
}

function DailyRuleStep({ onContinue }: { onContinue: () => void }) {
  return (
    <StepScaffold eyebrow="THE DAILY RULE" title={<Text>One movement.{`\n`}Five sets. <Text style={styles.accentWord}>Done.</Text></Text>} support="Your session is already structured. We handle the pace. You do the work." action={<PrimaryButton label="Continue" onPress={onContinue} />}>
      <View style={styles.ruleHero}>
        <StatHero value="1" label="MOVEMENT" />
        <View style={styles.ruleDivider} />
        <StatHero value="5" label="GUIDED SETS" />
        <View style={styles.ruleDivider} />
        <StatHero value="20" suffix="SEC" label="BETWEEN SETS" />
      </View>
      <View style={styles.ruleNote}><Icon name="timer" color={colors.accent} size={22} weight="semibold" /><Text style={styles.ruleNoteText}>No planning. No logging. Just follow the pace.</Text></View>
    </StepScaffold>
  );
}

function LockTimeStep({ value, onChange, onContinue }: { value: string; onChange: (value: string) => void; onContinue: () => void }) {
  return (
    <StepScaffold eyebrow="DAILY COMMITMENT" title={<Text>When do you{`\n`}want it <Text style={styles.accentWord}>done?</Text></Text>} support="Finish before your Lock Time and nothing changes. If you don't, the apps you choose wait until you're finished." action={<PrimaryButton label="Set Lock Time" onPress={onContinue} />}>
      <View style={styles.timePickerCard}>
        <View style={styles.timeHeader}><Icon name="clock" color={colors.accent} size={21} /><Text style={styles.timeLabel}>DAILY LOCK TIME</Text></View>
        <DateTimePicker value={dateFromLockTime(value)} mode="time" display="spinner" themeVariant="dark" accentColor={colors.accent} style={styles.timePicker} onValueChange={(_, date) => onChange(formatLockTime(date))} testID="lock-time-wheel" />
        <Text style={styles.timeValue}>{value}</Text>
      </View>
      <Text style={styles.trustLine}>Repeats daily. You can change it later in Locks.</Text>
    </StepScaffold>
  );
}

function AccountabilityStep({ selectedAppCount, authorizationStatus, message, busy, chooseApps, onContinue }: {
  selectedAppCount: number;
  authorizationStatus: FamilyControlsAuthorizationDisplayStatus;
  message: string | null;
  busy: boolean;
  chooseApps: () => void;
  onContinue: () => void;
}) {
  const denied = authorizationStatus === 'denied';
  const selected = selectedAppCount > 0 && (authorizationStatus === 'approved' || authorizationStatus === 'approvedWithDataAccess');
  return (
    <StepScaffold eyebrow="ACCOUNTABILITY" title={<Text>Choose what <Text style={styles.accentWord}>waits.</Text></Text>} support="VAEL uses Apple's Screen Time controls to restrict only the apps you choose when today's training isn't complete." action={<View style={styles.actionStack}>
      {selected ? <PrimaryButton label="Continue" onPress={onContinue} /> : null}
      {!selected ? <PrimaryButton label={busy ? 'Opening…' : denied ? 'Open Settings' : 'Connect & Choose Apps'} onPress={denied ? () => void Linking.openSettings() : chooseApps} disabled={busy} /> : null}
      {selected ? <TextButton label="Change Selection" onPress={chooseApps} /> : null}
    </View>}>
      <View style={styles.accountabilityVisual}>
        <Image source={accountabilityCoach} style={styles.accountabilityCoach} contentFit="cover" />
        <View style={styles.accountabilityShade} pointerEvents="none" />
        <View style={styles.accountabilityStatus}>
          <View style={[styles.lockOrb, denied && styles.lockOrbDenied]}><Icon name={denied ? 'exclamationmark.lock' : selected ? 'checkmark.shield.fill' : 'lock.fill'} color={colors.accent} size={36} weight="semibold" /></View>
          <Text style={styles.appsCount}>{denied ? 'ACCESS OFF' : selected ? selectedAppCount : 'ONLY YOUR CHOICES'}</Text>
          <Text style={styles.appsLabel}>{denied ? 'Screen Time access is disabled.' : selected ? `${selectedAppCount === 1 ? 'app' : 'apps'} selected` : 'You stay in control.'}</Text>
        </View>
      </View>
      {message ? <Text accessibilityRole="alert" style={styles.permissionMessage}>{message}</Text> : null}
      <View style={styles.privacyRow}><Icon name="hand.raised.fill" color={colors.accent} size={18} /><Text style={styles.privacyText}>VAEL never sees which apps you select. Apple keeps that selection private.</Text></View>
    </StepScaffold>
  );
}

function StepScaffold({ eyebrow, title, support, children, action }: { eyebrow: string; title: ReactNode; support: string; children: ReactNode; action: ReactNode }) {
  return <View style={styles.scaffold}><View style={styles.stepHeader}><Text style={styles.eyebrow}>{eyebrow}</Text><Title>{title}</Title><Body muted>{support}</Body></View><View style={styles.stepContent}>{children}</View><View style={styles.stepAction}>{action}</View></View>;
}

function FoundationFocusRow({ image, title, support }: { image: number; title: string; support: string }) {
  return <View style={styles.focusRow}><Image source={image} style={styles.focusIcon} contentFit="contain" /><View style={styles.focusCopy}><Text style={styles.focusTitle}>{title}</Text><Text style={styles.focusSupport}>{support}</Text></View></View>;
}

function StatHero({ value, suffix, label }: { value: string; suffix?: string; label: string }) {
  return <View style={styles.statHero}><View style={styles.statValueRow}><Text style={styles.statValue}>{value}</Text>{suffix ? <Text style={styles.statSuffix}>{suffix}</Text> : null}</View><Text style={styles.statLabel}>{label}</Text></View>;
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return <View accessibilityLabel={`Step ${current + 1} of ${total}`} style={styles.progressDots}>{Array.from({ length: total }, (_, index) => <View key={index} style={[styles.progressDot, index === current && styles.progressDotActive]} />)}</View>;
}

function dateFromLockTime(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/i);
  const date = new Date();
  if (!match) { date.setHours(21, 0, 0, 0); return date; }
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  date.setHours(hour, Number(match[2]), 0, 0);
  return date;
}

function formatLockTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
}

const styles = StyleSheet.create({
  stepScreen: { paddingBottom: spacing.md }, stepBody: { flex: 1 }, brandScreen: { overflow: 'hidden' },
  brandAtmosphere: { position: 'absolute', left: -spacing.xl, right: -spacing.xl, top: 60, height: 510, opacity: 0.72 },
  brandIdentity: { flex: 1.15, alignItems: 'center', justifyContent: 'center', paddingTop: spacing.xxxl },
  brandWordmark: { color: colors.primary, fontSize: 31, fontWeight: '300', letterSpacing: 14, marginLeft: 14, marginTop: spacing.md },
  brandAttributes: { color: colors.secondary, fontSize: 9, letterSpacing: 2.1, marginTop: spacing.sm },
  brandCopy: { gap: spacing.lg, paddingBottom: spacing.xxxl }, brandHeadline: { color: colors.primary, fontSize: 43, lineHeight: 49, letterSpacing: -1.2, fontWeight: '800' },
  brandSupport: { color: colors.secondary, fontSize: 17, lineHeight: 25, maxWidth: 330 }, brandAreas: { ...typography.eyebrow, color: colors.accent, fontSize: 10 },
  brandActions: { gap: spacing.sm, paddingBottom: spacing.md }, accentWord: { color: colors.accent }, scaffold: { flex: 1, minHeight: 560 },
  stepHeader: { gap: spacing.md, paddingTop: spacing.sm }, eyebrow: { ...typography.eyebrow, color: colors.accent }, stepContent: { flex: 1, justifyContent: 'center', paddingVertical: spacing.md, gap: spacing.md }, stepAction: { paddingBottom: spacing.xs },
  foundationScreen: { overflow: 'hidden', paddingTop: 27, paddingBottom: spacing.md },
  foundationHeader: { zIndex: 2, gap: 11 },
  foundationHeadline: { color: colors.primary, fontSize: 28, lineHeight: 36, letterSpacing: -0.7, fontWeight: '800' },
  foundationSupport: { color: colors.secondary, fontSize: 14, lineHeight: 20 },
  foundationStage: { flex: 1, minHeight: 358, position: 'relative', marginHorizontal: -spacing.xl },
  foundationStageCompact: { minHeight: 330 },
  foundationCoach: { position: 'absolute', aspectRatio: 2 / 3, right: '-17%', bottom: -78 },
  foundationCoachCompact: { right: '-15%', bottom: -136 },
  foundationList: { zIndex: 2, width: 174, gap: 22, paddingTop: spacing.xxxl + spacing.md, paddingLeft: spacing.sm },
  foundationListCompact: { paddingTop: spacing.xxl + spacing.md },
  focusRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 5 },
  focusIcon: { width: 48, height: 48, borderRadius: 24 },
  focusCopy: { flex: 1, gap: 3 },
  focusTitle: { color: colors.primary, fontSize: 14, lineHeight: 18, fontWeight: '700' },
  focusSupport: { maxWidth: 98, color: colors.secondary, fontSize: 12, lineHeight: 17 },
  foundationActions: { zIndex: 3, gap: spacing.sm },
  ruleHero: { borderRadius: radii.xl, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface, overflow: 'hidden' }, ruleDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderStrong, marginHorizontal: spacing.xl },
  statHero: { minHeight: 96, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xxl }, statValueRow: { width: 116, flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs }, statValue: { color: colors.accent, fontSize: 52, lineHeight: 58, fontWeight: '800', letterSpacing: -2 }, statSuffix: { color: colors.accent, fontSize: 12, fontWeight: '800', letterSpacing: 1.2 }, statLabel: { color: colors.primary, fontSize: 13, fontWeight: '700', letterSpacing: 1.5 },
  ruleNote: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.sm }, ruleNoteText: { flex: 1, color: colors.secondary, fontSize: 13, lineHeight: 19 },
  timePickerCard: { borderRadius: radii.xl, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface, overflow: 'hidden', alignItems: 'center' }, timeHeader: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingTop: spacing.md }, timeLabel: { ...typography.eyebrow, color: colors.accent }, timePicker: { width: '100%', height: 188 }, timeValue: { color: colors.primary, fontSize: 24, fontWeight: '700', paddingBottom: spacing.lg }, trustLine: { color: colors.tertiary, fontSize: 12, textAlign: 'center' },
  accountabilityVisual: { height: 235, overflow: 'hidden', borderRadius: radii.xl, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.borderStrong, backgroundColor: colors.surface }, accountabilityCoach: { position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.58 }, accountabilityShade: { position: 'absolute', inset: 0, backgroundColor: 'rgba(3,4,5,0.48)' }, accountabilityStatus: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm }, lockOrb: { width: 80, height: 80, borderRadius: 40, borderWidth: 1.5, borderColor: colors.accent, backgroundColor: 'rgba(255,201,77,0.08)', alignItems: 'center', justifyContent: 'center', shadowColor: colors.accent, shadowOpacity: 0.24, shadowRadius: 16 }, lockOrbDenied: { borderColor: colors.borderStrong, shadowOpacity: 0 }, appsCount: { color: colors.accent, fontSize: 15, fontWeight: '800', letterSpacing: 1.8, marginTop: spacing.sm }, appsLabel: { color: colors.secondary, fontSize: 14 },
  permissionMessage: { color: colors.primary, fontSize: 13, lineHeight: 19, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radii.md, backgroundColor: colors.surface, padding: spacing.md }, privacyRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', paddingHorizontal: spacing.sm }, privacyText: { flex: 1, color: colors.secondary, fontSize: 11, lineHeight: 16 }, actionStack: { gap: spacing.xs },
  progressDots: { minHeight: 22, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.md }, progressDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.borderStrong }, progressDotActive: { backgroundColor: colors.accent, width: 9, height: 9, borderRadius: 5 },
});
