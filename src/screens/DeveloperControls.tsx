import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AuthStatus, EntitlementStatus } from '../state/accessState';
import { Card, Eyebrow, Icon, PrimaryButton, Screen, SecondaryButton, Title, TopBar } from '../components/ui';
import { colors, radii, spacing, typography } from '../theme/designSystem';

export function DeveloperControls({ onboardingCompleted, authStatus, entitlementStatus, onBack, onReset, onRestartOnboarding, onMarkOnboardingComplete, onSetAuth, onSetEntitlement, onResolveRoute }: {
  onboardingCompleted: boolean;
  authStatus: AuthStatus;
  entitlementStatus: EntitlementStatus;
  onBack: () => void;
  onReset: () => void;
  onRestartOnboarding: () => void;
  onMarkOnboardingComplete: () => void;
  onSetAuth: (status: AuthStatus) => void;
  onSetEntitlement: (status: EntitlementStatus) => void;
  onResolveRoute: () => void;
}) {
  return (
    <Screen scroll testID="developer-controls">
      <TopBar title="Developer Controls" onBack={onBack} />
      <View style={styles.header}>
        <View style={styles.devBadge}><Icon name="hammer.fill" color={colors.accent} size={20} /><Text style={styles.devBadgeText}>DEBUG BUILD ONLY</Text></View>
        <Title compact>Test the first-run gates.</Title>
        <Text style={styles.support}>These local overrides never create a real account, App Store purchase, or production entitlement.</Text>
      </View>

      <DebugSection label="APP STATE">
        <StateSummary label="Onboarding" value={onboardingCompleted ? 'Complete' : 'Incomplete'} />
        <View style={styles.twoColumns}>
          <SecondaryButton label="Restart Onboarding" onPress={onRestartOnboarding} />
          <SecondaryButton label="Mark Complete" onPress={onMarkOnboardingComplete} />
        </View>
      </DebugSection>

      <DebugSection label="AUTH">
        <SegmentedOptions options={[{ label: 'Signed Out', value: 'signedOut' }, { label: 'Signed In', value: 'signedIn' }]} selected={authStatus} onSelect={onSetAuth} />
      </DebugSection>

      <DebugSection label="ENTITLEMENT">
        <SegmentedOptions options={[
          { label: 'None', value: 'none' },
          { label: 'Monthly Active', value: 'monthlyActive' },
          { label: 'Annual Trial', value: 'annualTrial' },
          { label: 'Annual Active', value: 'annualActive' },
          { label: 'Expired', value: 'expired' },
        ]} selected={entitlementStatus} onSelect={onSetEntitlement} />
      </DebugSection>

      <View style={styles.actions}>
        <PrimaryButton label="Apply & Resolve Route" onPress={onResolveRoute} />
        <SecondaryButton label="Reset Local State" onPress={onReset} danger />
      </View>
    </Screen>
  );
}

function DebugSection({ label, children }: PropsWithChildren<{ label: string }>) {
  return <View style={styles.section}><Eyebrow accent>{label}</Eyebrow><Card style={styles.sectionCard}>{children}</Card></View>;
}

function StateSummary({ label, value }: { label: string; value: string }) {
  return <View style={styles.summary}><Text style={styles.summaryLabel}>{label}</Text><Text style={styles.summaryValue}>{value}</Text></View>;
}

function SegmentedOptions<T extends string>({ options, selected, onSelect }: { options: { label: string; value: T }[]; selected: T; onSelect: (value: T) => void }) {
  return <View style={styles.options}>{options.map((option) => {
    const active = option.value === selected;
    return <Pressable key={option.value} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => onSelect(option.value)} style={({ pressed }) => [styles.option, active && styles.optionActive, pressed && styles.optionPressed]}><Text style={[styles.optionText, active && styles.optionTextActive]}>{option.label}</Text></Pressable>;
  })}</View>;
}

const styles = StyleSheet.create({
  header: { gap: spacing.md, paddingTop: spacing.xl },
  devBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.accentSurface, borderWidth: 1, borderColor: colors.borderStrong },
  devBadgeText: { ...typography.eyebrow, color: colors.accent, fontSize: 10 },
  support: { color: colors.secondary, fontSize: 14, lineHeight: 21 },
  section: { gap: spacing.sm, marginTop: spacing.xxl },
  sectionCard: { gap: spacing.md },
  summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { color: colors.secondary, fontSize: 13 }, summaryValue: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  twoColumns: { gap: spacing.sm }, options: { gap: spacing.sm },
  option: { minHeight: 46, borderRadius: radii.md, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  optionActive: { borderColor: colors.accent, backgroundColor: colors.accentSurface }, optionPressed: { opacity: 0.82 }, optionText: { color: colors.secondary, fontSize: 13, fontWeight: '600' }, optionTextActive: { color: colors.primary },
  actions: { gap: spacing.md, marginTop: spacing.xxxl, paddingBottom: spacing.xl },
});
