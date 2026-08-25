import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Body,
  Card,
  Eyebrow,
  Field,
  Icon,
  PrimaryButton,
  Screen,
  TextButton,
  Title,
  TopBar,
} from '../components/ui';
import { colors, spacing } from '../theme/designSystem';

export function AccountScreen({
  mode,
  setMode,
  onContinue,
  onBack,
  onNotNow,
}: {
  mode: 'signUp' | 'signIn';
  setMode: (mode: 'signUp' | 'signIn') => void;
  onContinue: () => void;
  onBack: () => void;
  onNotNow: () => void;
}) {
  const signUp = mode === 'signUp';
  return (
    <Screen scroll testID={`account-${mode}`}>
      <TopBar onBack={onBack} />
      <View style={styles.accountHeader}>
        <View style={styles.accountIcon}><Icon name="person.crop.circle.badge.checkmark" color={colors.accent} size={35} /></View>
        <Eyebrow accent>{signUp ? 'Keep Your Progress' : 'Welcome Back'}</Eyebrow>
        <Title>{signUp ? 'Create your account.' : 'Sign in to continue.'}</Title>
        <Body muted>{signUp ? 'Save your momentum, history, and accountability setup.' : 'Your progress and setup will be ready where you left them.'}</Body>
      </View>
      <View style={styles.fields}>
        <Field placeholder="Email" keyboardType="email-address" autoCapitalize="none" textContentType="emailAddress" />
        <Field placeholder="Password" secureTextEntry textContentType={signUp ? 'newPassword' : 'password'} />
      </View>
      <View style={styles.accountActions}>
        <PrimaryButton label={signUp ? 'Create Account' : 'Sign In'} onPress={onContinue} />
        <TextButton
          label={signUp ? 'Already have an account? Sign In' : 'New here? Create Account'}
          onPress={() => setMode(signUp ? 'signIn' : 'signUp')}
        />
        <TextButton label="Not Now" onPress={onNotNow} color={colors.tertiary} />
      </View>
    </Screen>
  );
}

export function PaywallScreen({ onClose, onStartTrial }: { onClose: () => void; onStartTrial: () => void }) {
  const [selected, setSelected] = useState<'annual' | 'monthly'>('annual');
  return (
    <Screen scroll testID="subscription-paywall">
      <TopBar action={<Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose}><Icon name="xmark" color={colors.secondary} size={20} /></Pressable>} />
      <View style={styles.paywallHeader}>
        <Eyebrow accent>Membership</Eyebrow>
        <Title>Keep your momentum going.</Title>
        <Body muted>Daily training, accountability, and a clear record of progress.</Body>
      </View>

      <View style={styles.benefits}>
        <Benefit icon="figure.strengthtraining.traditional" title="A complete seven-movement cycle" />
        <Benefit icon="lock.shield" title="Daily accountability controls" />
        <Benefit icon="chart.line.uptrend.xyaxis" title="Progress, history, and milestones" />
      </View>

      <View style={styles.plans}>
        <PlanCard
          selected={selected === 'annual'}
          eyebrow="Annual · Best Value"
          price="$39.99 / year"
          support="$3.33 / month · 3 days free"
          onPress={() => setSelected('annual')}
        />
        <PlanCard
          selected={selected === 'monthly'}
          eyebrow="Monthly"
          price="$9.99 / month"
          support="Cancel anytime"
          onPress={() => setSelected('monthly')}
        />
      </View>

      <View style={styles.paywallActions}>
        <PrimaryButton label={selected === 'annual' ? 'Start 3-Day Free Trial' : 'Continue Monthly'} onPress={onStartTrial} />
        <Text style={styles.renewalCopy}>
          {selected === 'annual'
            ? '3 days free, then $39.99/year. Auto-renews until cancelled.'
            : '$9.99/month. Auto-renews until cancelled.'}
        </Text>
        <TextButton label="Restore Purchases" onPress={onStartTrial} color={colors.primary} />
        <Text style={styles.terms}>Terms · Privacy</Text>
      </View>
    </Screen>
  );
}

function Benefit({ icon, title }: { icon: Parameters<typeof Icon>[0]['name']; title: string }) {
  return (
    <View style={styles.benefit}>
      <View style={styles.benefitIcon}><Icon name={icon} color={colors.accent} size={19} /></View>
      <Text style={styles.benefitTitle}>{title}</Text>
    </View>
  );
}

function PlanCard({
  selected,
  eyebrow,
  price,
  support,
  onPress,
}: {
  selected: boolean;
  eyebrow: string;
  price: string;
  support: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${eyebrow}, ${price}, ${support}`}
      accessibilityState={{ selected }}
      onPress={onPress}
    >
      <Card style={[styles.plan, selected ? styles.planSelected : {}]}>
        <View style={styles.planTop}>
          <Eyebrow accent={selected}>{eyebrow}</Eyebrow>
          <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View>
        </View>
        <Text style={styles.planPrice}>{price}</Text>
        <Text style={styles.planSupport}>{support}</Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  accountHeader: { paddingTop: spacing.xxxl, gap: spacing.md },
  accountIcon: { width: 72, height: 72, borderRadius: 24, backgroundColor: '#181B16', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  fields: { gap: spacing.md, marginTop: spacing.xxxl },
  accountActions: { gap: spacing.sm, marginTop: spacing.xxxl, paddingBottom: spacing.xl },
  paywallHeader: { gap: spacing.md, paddingTop: spacing.xl },
  benefits: { gap: spacing.md, marginVertical: spacing.xxl },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  benefitIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: '#181B16', alignItems: 'center', justifyContent: 'center' },
  benefitTitle: { color: colors.primary, fontSize: 14, flex: 1 },
  plans: { gap: spacing.md },
  plan: { gap: spacing.sm, padding: spacing.lg },
  planSelected: { borderColor: colors.accent, borderWidth: 1.5 },
  planTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: colors.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  planPrice: { color: colors.primary, fontSize: 22, fontWeight: '700', textTransform: 'uppercase' },
  planSupport: { color: colors.secondary, fontSize: 13 },
  paywallActions: { gap: spacing.md, marginTop: spacing.xxxl, paddingBottom: spacing.xl },
  renewalCopy: { color: colors.secondary, fontSize: 11, lineHeight: 16, textAlign: 'center', paddingHorizontal: spacing.md },
  terms: { color: colors.tertiary, fontSize: 12, textAlign: 'center' },
});
