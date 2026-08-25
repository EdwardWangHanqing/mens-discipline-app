import type { ReactNode } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

import {
  Body,
  Card,
  ChoiceCard,
  Divider,
  Eyebrow,
  Field,
  Icon,
  PrimaryButton,
  Screen,
  StepProgress,
  TextButton,
  Title,
  TopBar,
} from '../components/ui';
import { colors, radii, spacing, typography } from '../theme/designSystem';

const revealCover = require('../../assets/images/reveal-cover.png');

const goals = [
  'Better control',
  'Stronger hips & lower body',
  'More consistency',
  'More confidence',
];

const barriers = [
  'I put it off',
  'Apps pull me in',
  'My schedule gets busy',
  'I forget',
  'I want more structure',
];

export type OnboardingDraft = {
  nickname: string;
  goal: string;
  barrier: string;
  lockTime: string;
  selectedAppCount: number;
  screenTimeConnected: boolean;
};

export function OnboardingFlow({
  step,
  draft,
  updateDraft,
  goNext,
  goBack,
  onSignIn,
  requestScreenTime,
  chooseApps,
  authorizationBusy,
  pickerBusy,
}: {
  step: number;
  draft: OnboardingDraft;
  updateDraft: (patch: Partial<OnboardingDraft>) => void;
  goNext: () => void;
  goBack: () => void;
  onSignIn: () => void;
  requestScreenTime: () => void;
  chooseApps: () => void;
  authorizationBusy: boolean;
  pickerBusy: boolean;
}) {
  if (step === 0) {
    return (
      <Screen testID="onboarding-brand">
        <View style={styles.brandTop}>
          <Eyebrow>MEN&apos;S DISCIPLINE</Eyebrow>
        </View>
        <View style={styles.brandHero}>
          <View style={styles.brandImageWell}>
            <Image source={revealCover} style={styles.brandImage} resizeMode="cover" />
            <View style={styles.brandMark}>
              <Icon name="figure.strengthtraining.traditional" color={colors.accent} size={38} />
            </View>
          </View>
          <Title>Train what most men ignore.</Title>
          <Body muted>Short, private training built for men&apos;s performance and consistency.</Body>
        </View>
        <View style={styles.bottomActions}>
          <PrimaryButton label="Get Started" onPress={goNext} testID="get-started" />
          <TextButton label="Sign In" onPress={onSignIn} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll testID={`onboarding-step-${step}`}>
      <TopBar onBack={goBack} />
      <StepProgress current={step} total={11} />
      <Animated.View
        key={step}
        entering={FadeInRight.duration(260)}
        exiting={FadeOutLeft.duration(180)}
        style={styles.stepBody}
      >
        {renderStep()}
      </Animated.View>
    </Screen>
  );

  function renderStep() {
    switch (step) {
      case 1:
        return (
          <StepLayout
            eyebrow="YOUR SPACE"
            title="First, what should we call you?"
            support="A nickname is enough. This stays personal."
            action={
              <PrimaryButton label="Continue" onPress={goNext} disabled={!draft.nickname.trim()} />
            }
          >
            <Field
              autoFocus
              autoCapitalize="words"
              maxLength={24}
              value={draft.nickname}
              onChangeText={(nickname) => updateDraft({ nickname })}
              placeholder="Nickname"
              returnKeyType="next"
              onSubmitEditing={() => draft.nickname.trim() && goNext()}
              accessibilityLabel="Nickname"
            />
          </StepLayout>
        );
      case 2:
        return (
          <StepLayout
            eyebrow="THE OVERLOOKED FOUNDATION"
            title="Most men train what shows."
            support="Chest. Arms. Abs. The hips get overlooked. That’s where we start."
            action={<PrimaryButton label="Continue" onPress={goNext} />}
          >
            <Card style={styles.ahaCard} elevated>
              <View style={styles.ahaIcon}>
                <Icon name="figure.flexibility" color={colors.accent} size={46} />
              </View>
              <Text style={styles.ahaTitle}>Control begins at the center.</Text>
              <Text style={styles.ahaCopy}>
                Guided training built around hip control, lower-body strength, and consistency.
              </Text>
            </Card>
          </StepLayout>
        );
      case 3:
        return (
          <ChoiceStep
            eyebrow="YOUR FOCUS"
            title="What are you here to build?"
            options={goals}
            selected={draft.goal}
            select={(goal) => updateDraft({ goal })}
            next={goNext}
          />
        );
      case 4:
        return (
          <ChoiceStep
            eyebrow="YOUR BARRIER"
            title="What usually gets in the way?"
            options={barriers}
            selected={draft.barrier}
            select={(barrier) => updateDraft({ barrier })}
            next={goNext}
          />
        );
      case 5:
        return (
          <StepLayout
            eyebrow="THE DAILY FORMAT"
            title="One movement. Five guided sets."
            support="We handle the pace. You do the work."
            action={<PrimaryButton label="Continue" onPress={goNext} />}
          >
            <Card style={styles.structureCard}>
              <StructureRow icon="figure.strengthtraining.traditional" value="1" label="movement" />
              <Divider />
              <StructureRow icon="square.stack.3d.up" value="5" label="guided sets" />
              <Divider />
              <StructureRow icon="timer" value="20 sec" label="rest between sets" />
            </Card>
          </StepLayout>
        );
      case 6:
        return (
          <StepLayout
            eyebrow="DAILY COMMITMENT"
            title="When do you want today’s training done by?"
            support="This becomes your recurring daily Lock Time."
            action={<PrimaryButton label="Confirm Lock Time" onPress={goNext} />}
          >
            <View style={styles.timePickerCard}>
              <DateTimePicker
                value={dateFromLockTime(draft.lockTime)}
                mode="time"
                display="spinner"
                themeVariant="dark"
                accentColor={colors.accent}
                style={styles.timePicker}
                onValueChange={(_, date) => updateDraft({ lockTime: formatLockTime(date) })}
                testID="lock-time-wheel"
              />
              <Text style={styles.timePickerValue}>{draft.lockTime}</Text>
            </View>
          </StepLayout>
        );
      case 7:
        return (
          <StepLayout
            eyebrow="ACCOUNTABILITY"
            title="Now make it a commitment."
            support={`If today’s training isn’t complete by ${draft.lockTime}, the apps you choose will wait until you’re finished.`}
            action={<PrimaryButton label="Set Up Accountability" onPress={goNext} />}
          >
            <View style={styles.commitmentFlow}>
              <FlowNode icon="figure.run" label="Train" active />
              <View style={styles.flowLine} />
              <FlowNode icon="clock" label={draft.lockTime} />
              <View style={styles.flowLine} />
              <FlowNode icon="lock" label="Apps wait" />
              <View style={styles.flowLine} />
              <FlowNode icon="checkmark.shield" label="Clear" active />
            </View>
          </StepLayout>
        );
      case 8:
        return (
          <StepLayout
            eyebrow="APPLE SCREEN TIME"
            title="Connect Screen Time"
            support="Men’s Discipline uses Apple’s Screen Time controls to apply the accountability rules you choose."
            action={
              <View style={styles.stackedActions}>
                <PrimaryButton
                  label={authorizationBusy ? 'Connecting…' : 'Connect Screen Time'}
                  onPress={requestScreenTime}
                  disabled={authorizationBusy}
                  icon="checkmark.shield"
                />
                <TextButton label="Continue Without Locks" onPress={goNext} />
              </View>
            }
          >
            <Card style={styles.privacyCard}>
              <Icon name="hand.raised" color={colors.accent} size={26} />
              <View style={styles.privacyCopy}>
                <Text style={styles.privacyTitle}>You stay in control.</Text>
                <Text style={styles.privacyBody}>You choose which apps are included.</Text>
              </View>
            </Card>
          </StepLayout>
        );
      case 9:
        return (
          <StepLayout
            eyebrow="SELECTED APPS"
            title="Which apps should wait until you’ve shown up?"
            support="Choose the apps you want tied to your daily commitment."
            action={
              <View style={styles.stackedActions}>
                <PrimaryButton
                  label={draft.selectedAppCount ? 'Continue' : 'Choose Apps'}
                  onPress={draft.selectedAppCount ? goNext : chooseApps}
                  disabled={pickerBusy}
                />
                {draft.selectedAppCount ? (
                  <TextButton label="Change Selection" onPress={chooseApps} />
                ) : (
                  <TextButton label="Continue Without Locks" onPress={goNext} />
                )}
              </View>
            }
          >
            <Card style={styles.appsCard}>
              <View style={styles.appsIcon}>
                <Icon name="app.dashed" color={colors.accent} size={34} />
              </View>
              <Text style={styles.appsCount}>{draft.selectedAppCount || 'No'}</Text>
              <Text style={styles.appsLabel}>
                {draft.selectedAppCount === 1 ? 'app selected' : 'apps selected'}
              </Text>
              <Text style={styles.appsSupport}>
                {draft.selectedAppCount
                  ? 'Your selection can be changed later in Locks.'
                  : 'Training still works without accountability.'}
              </Text>
            </Card>
          </StepLayout>
        );
      case 10:
        return (
          <StepLayout
            eyebrow="READY FOR TODAY"
            title="Your Daily Setup"
            support="Simple enough to repeat. Structured enough to keep you honest."
            action={
              <View style={styles.stackedActions}>
                <PrimaryButton label="Continue to Home" onPress={goNext} />
                <Text style={styles.reassurance}>Your first full session is on us.</Text>
              </View>
            }
          >
            <Card style={styles.setupCard}>
              <SetupRow label="Focus" value={draft.goal} />
              <Divider />
              <SetupRow label="Daily training" value="1 movement · 5 guided sets" />
              <Divider />
              <SetupRow label="Done by" value={draft.lockTime} />
              <Divider />
              <SetupRow
                label="Accountability"
                value={draft.selectedAppCount ? `${draft.selectedAppCount} selected apps` : 'Inactive'}
              />
            </Card>
          </StepLayout>
        );
      default:
        return null;
    }
  }
}

function StepLayout({
  eyebrow,
  title,
  support,
  children,
  action,
}: {
  eyebrow: string;
  title: string;
  support?: string;
  children: ReactNode;
  action: ReactNode;
}) {
  return (
    <View style={styles.stepLayout}>
      <View style={styles.stepHeader}>
        <Eyebrow accent>{eyebrow}</Eyebrow>
        <Title>{title}</Title>
        {support ? <Body muted>{support}</Body> : null}
      </View>
      <View style={styles.stepContent}>{children}</View>
      <View style={styles.stepAction}>{action}</View>
    </View>
  );
}

function ChoiceStep({
  eyebrow,
  title,
  options,
  selected,
  select,
  next,
}: {
  eyebrow: string;
  title: string;
  options: string[];
  selected: string;
  select: (value: string) => void;
  next: () => void;
}) {
  return (
    <StepLayout
      eyebrow={eyebrow}
      title={title}
      action={<PrimaryButton label="Continue" onPress={next} disabled={!selected} />}
    >
      <View style={styles.choiceList}>
        {options.map((option) => (
          <ChoiceCard
            key={option}
            label={option}
            selected={selected === option}
            onPress={() => select(option)}
          />
        ))}
      </View>
    </StepLayout>
  );
}

function StructureRow({ icon, value, label }: { icon: Parameters<typeof Icon>[0]['name']; value: string; label: string }) {
  return (
    <View style={styles.structureRow}>
      <View style={styles.structureIcon}>
        <Icon name={icon} color={colors.accent} size={24} />
      </View>
      <Text style={styles.structureValue}>{value}</Text>
      <Text style={styles.structureLabel}>{label}</Text>
    </View>
  );
}

function FlowNode({ icon, label, active = false }: { icon: Parameters<typeof Icon>[0]['name']; label: string; active?: boolean }) {
  return (
    <View style={styles.flowNode}>
      <View style={[styles.flowIcon, active && styles.flowIconActive]}>
        <Icon name={icon} color={active ? colors.accent : colors.secondary} size={20} />
      </View>
      <Text numberOfLines={1} style={styles.flowLabel}>{label}</Text>
    </View>
  );
}

function SetupRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.setupRow}>
      <Text style={styles.setupLabel}>{label}</Text>
      <Text style={styles.setupValue}>{value}</Text>
    </View>
  );
}

function dateFromLockTime(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/i);
  const date = new Date();
  if (!match) {
    date.setHours(21, 0, 0, 0);
    return date;
  }
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  date.setHours(hour, Number(match[2]), 0, 0);
  return date;
}

function formatLockTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

const styles = StyleSheet.create({
  brandTop: { paddingTop: spacing.md },
  brandHero: { flex: 1, justifyContent: 'center', gap: spacing.lg, paddingBottom: spacing.xxxl },
  brandImageWell: {
    width: 128,
    height: 128,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    marginBottom: spacing.md,
  },
  brandImage: { width: '100%', height: '100%' },
  brandMark: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(3,7,11,0.45)',
  },
  bottomActions: { gap: spacing.sm, paddingBottom: spacing.xl },
  stepBody: { flex: 1 },
  timePickerCard: {
    minHeight: 250,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePicker: { width: '100%', height: 200 },
  timePickerValue: { ...typography.eyebrow, color: colors.accent, marginBottom: spacing.lg },
  stepLayout: { flex: 1, minHeight: 720 },
  stepHeader: { gap: spacing.md, paddingTop: spacing.xxxl },
  stepContent: { flex: 1, paddingTop: spacing.xxxl },
  stepAction: { paddingTop: spacing.xxl, paddingBottom: spacing.lg },
  stackedActions: { gap: spacing.sm },
  choiceList: { gap: spacing.md },
  ahaCard: { padding: spacing.xxl, minHeight: 300, justifyContent: 'flex-end', gap: spacing.md },
  ahaIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#181B16',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxxl,
  },
  ahaTitle: { color: colors.primary, fontSize: 22, fontWeight: '700' },
  ahaCopy: { color: colors.secondary, fontSize: 15, lineHeight: 22 },
  structureCard: { paddingVertical: spacing.sm },
  structureRow: { minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  structureIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: '#181B16',
    alignItems: 'center',
    justifyContent: 'center',
  },
  structureValue: { color: colors.primary, fontSize: 25, fontWeight: '700', minWidth: 62 },
  structureLabel: { color: colors.secondary, fontSize: 15, flex: 1 },
  commitmentFlow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  flowNode: { width: 62, alignItems: 'center', gap: spacing.sm },
  flowIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowIconActive: { borderColor: colors.accent },
  flowLabel: { color: colors.secondary, fontSize: 10, textAlign: 'center' },
  flowLine: { height: 1, flex: 1, backgroundColor: colors.borderStrong, marginTop: 26 },
  privacyCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, padding: spacing.xl },
  privacyCopy: { flex: 1, gap: spacing.xs },
  privacyTitle: { color: colors.primary, fontSize: 17, fontWeight: '700' },
  privacyBody: { color: colors.secondary, fontSize: 14 },
  appsCard: { alignItems: 'center', paddingVertical: spacing.xxxl },
  appsIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#181B16',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  appsCount: { color: colors.primary, fontSize: 42, fontWeight: '700' },
  appsLabel: { ...typography.eyebrow, color: colors.accent, marginTop: spacing.xs },
  appsSupport: { color: colors.secondary, fontSize: 13, textAlign: 'center', marginTop: spacing.lg },
  setupCard: { paddingVertical: spacing.sm },
  setupRow: { paddingVertical: spacing.lg, gap: spacing.xs },
  setupLabel: { ...typography.eyebrow, color: colors.secondary, textTransform: 'uppercase' },
  setupValue: { color: colors.primary, fontSize: 17, fontWeight: '600' },
  reassurance: { color: colors.secondary, fontSize: 13, textAlign: 'center' },
});
