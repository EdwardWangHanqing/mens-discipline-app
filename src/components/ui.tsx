import type { PropsWithChildren, ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import type { SFSymbol } from 'sf-symbols-typescript';

import { colors, radii, spacing, typography } from '../theme/designSystem';

export function Icon({
  name,
  color = colors.secondary,
  size = 22,
  weight = 'regular',
}: {
  name: SFSymbol;
  color?: string;
  size?: number;
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
}) {
  return (
    <SymbolView
      name={name}
      size={size}
      tintColor={color}
      weight={weight}
      resizeMode="scaleAspectFit"
    />
  );
}

export function Screen({
  children,
  scroll = false,
  contentStyle,
  testID,
}: PropsWithChildren<{
  scroll?: boolean;
  contentStyle?: ViewStyle;
  testID?: string;
}>) {
  const content = <View style={[styles.screenContent, contentStyle]}>{children}</View>;
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']} testID={testID}>
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

export function Eyebrow({ children, accent = false }: PropsWithChildren<{ accent?: boolean }>) {
  return <Text style={[styles.eyebrow, accent && styles.accentText]}>{children}</Text>;
}

export function Title({ children, compact = false }: PropsWithChildren<{ compact?: boolean }>) {
  return <Text style={[styles.title, compact && styles.compactTitle]}>{children}</Text>;
}

export function Body({ children, muted = false }: PropsWithChildren<{ muted?: boolean }>) {
  return <Text style={[styles.body, muted && styles.muted]}>{children}</Text>;
}

export function Card({
  children,
  style,
  elevated = false,
}: PropsWithChildren<{ style?: ViewStyle | ViewStyle[]; elevated?: boolean }>) {
  return <View style={[styles.card, elevated && styles.cardElevated, style]}>{children}</View>;
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  disabled = false,
  testID,
}: {
  label: string;
  onPress: () => void;
  icon?: SFSymbol;
  disabled?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && !disabled && styles.primaryButtonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      {icon ? <Icon name={icon} color={colors.accentInk} size={18} weight="semibold" /> : null}
      <Text style={styles.primaryButtonLabel}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  icon,
  danger = false,
  testID,
}: {
  label: string;
  onPress: () => void;
  icon?: SFSymbol;
  danger?: boolean;
  testID?: string;
}) {
  const color = danger ? colors.danger : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
    >
      {icon ? <Icon name={icon} color={color} size={18} /> : null}
      <Text style={[styles.secondaryButtonLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

export function TextButton({
  label,
  onPress,
  color = colors.secondary,
}: {
  label: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={10}>
      <Text style={[styles.textButton, { color }]}>{label}</Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps) {
  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.tertiary}
      selectionColor={colors.accent}
      style={[styles.field, props.style]}
    />
  );
}

export function ChoiceCard({
  label,
  selected,
  onPress,
  supporting,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  supporting?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        selected && styles.choiceSelected,
        pressed && styles.choicePressed,
      ]}
    >
      <View style={styles.choiceCopy}>
        <Text style={styles.choiceLabel}>{label}</Text>
        {supporting ? <Text style={styles.choiceSupporting}>{supporting}</Text> : null}
      </View>
      <View style={[styles.choiceIndicator, selected && styles.choiceIndicatorSelected]}>
        {selected ? <Icon name="checkmark" color={colors.accentInk} size={12} weight="bold" /> : null}
      </View>
    </Pressable>
  );
}

export function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.stepProgress} accessibilityLabel={`Step ${current} of ${total}`}>
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          style={[styles.stepSegment, index < current && styles.stepSegmentActive]}
        />
      ))}
    </View>
  );
}

export function TopBar({
  title,
  onBack,
  action,
}: {
  title?: string;
  onBack?: () => void;
  action?: ReactNode;
}) {
  return (
    <View style={styles.topBar}>
      <View style={styles.topBarSide}>
        {onBack ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} hitSlop={8}>
            <Icon name="chevron.left" color={colors.primary} size={22} weight="semibold" />
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.topBarTitle}>{title}</Text>
      <View style={[styles.topBarSide, styles.topBarAction]}>{action}</View>
    </View>
  );
}

export function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  screenContent: { flex: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  eyebrow: { ...typography.eyebrow, color: colors.secondary, textTransform: 'uppercase' },
  accentText: { color: colors.accent },
  title: { ...typography.title, color: colors.primary, letterSpacing: -0.6 },
  compactTitle: { fontSize: 26, lineHeight: 32 },
  body: { ...typography.body, color: colors.primary },
  muted: { color: colors.secondary },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  cardElevated: { backgroundColor: colors.surfaceRaised },
  primaryButton: {
    minHeight: 54,
    borderRadius: radii.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  primaryButtonPressed: { backgroundColor: colors.accentPressed, transform: [{ scale: 0.99 }] },
  primaryButtonLabel: {
    color: colors.accentInk,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.25,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  buttonDisabled: { opacity: 0.42 },
  secondaryButton: {
    minHeight: 50,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  secondaryButtonPressed: { backgroundColor: colors.surfaceRaised },
  secondaryButtonLabel: { fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  textButton: { fontSize: 15, fontWeight: '600', textAlign: 'center', paddingVertical: spacing.sm },
  field: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    color: colors.primary,
    fontSize: 18,
    paddingHorizontal: spacing.lg,
  },
  choice: {
    minHeight: 68,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  choiceSelected: { borderColor: colors.accent, backgroundColor: '#171B16' },
  choicePressed: { opacity: 0.85 },
  choiceCopy: { flex: 1 },
  choiceLabel: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  choiceSupporting: { color: colors.secondary, fontSize: 13, lineHeight: 18, marginTop: spacing.xs },
  choiceIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceIndicatorSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  stepProgress: { flexDirection: 'row', gap: spacing.xs, height: 4 },
  stepSegment: { flex: 1, height: 3, borderRadius: 2, backgroundColor: colors.border },
  stepSegmentActive: { backgroundColor: colors.accent },
  topBar: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topBarSide: { width: 44, minHeight: 44, justifyContent: 'center' },
  topBarAction: { alignItems: 'flex-end' },
  topBarTitle: { color: colors.primary, fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  metric: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  metricValue: { color: colors.primary, fontSize: 32, lineHeight: 38, fontWeight: '700' },
  metricLabel: { ...typography.eyebrow, color: colors.secondary, fontSize: 10, marginTop: spacing.xs },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});
