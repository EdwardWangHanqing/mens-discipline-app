import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

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

export type AuthRequest =
  | { provider: 'apple' | 'google'; mode: 'signUp' | 'signIn' }
  | { provider: 'email'; mode: 'signUp' | 'signIn'; email: string; password: string };

export type AuthResult = { ok: true } | { ok: false; error: string };

export function AccountScreen({
  mode,
  setMode,
  onContinue,
  onBack,
  onNotNow,
  onAuthenticate,
  onForgotPassword,
}: {
  mode: 'signUp' | 'signIn';
  setMode: (mode: 'signUp' | 'signIn') => void;
  onContinue: () => void;
  onBack: () => void;
  onNotNow: () => void;
  onAuthenticate: (request: AuthRequest) => Promise<AuthResult>;
  onForgotPassword: (email: string) => Promise<AuthResult>;
}) {
  const signUp = mode === 'signUp';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<'apple' | 'google' | 'email' | 'forgot' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordValid = password.length >= 8;

  return (
    <KeyboardAvoidingView style={styles.keyboardRoot} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen scroll testID={`account-${mode}`}>
        <TopBar onBack={onBack} />
        <View style={styles.accountHeader}>
          <View style={styles.accountIcon}><Icon name="person.crop.circle.badge.checkmark" color={colors.accent} size={35} /></View>
          <Eyebrow accent>{signUp ? 'Keep Your Progress' : 'Welcome Back'}</Eyebrow>
          <Title>{signUp ? 'Create your VAEL account.' : 'Sign in to VAEL.'}</Title>
          <Body muted>{signUp ? 'Save your momentum, history, and accountability setup.' : 'Return to your progress and daily setup.'}</Body>
        </View>

        <View style={styles.providerActions}>
          <AuthProviderButton
            provider="apple"
            loading={loading === 'apple'}
            disabled={loading !== null}
            onPress={() => void authenticate({ provider: 'apple', mode })}
          />
          <AuthProviderButton
            provider="google"
            loading={loading === 'google'}
            disabled={loading !== null}
            onPress={() => void authenticate({ provider: 'google', mode })}
          />
        </View>

        <View style={styles.orRow}><View style={styles.orLine} /><Text style={styles.orText}>OR</Text><View style={styles.orLine} /></View>

        <View style={styles.fields}>
          <Field
            value={email}
            onChangeText={(value) => { setEmail(value); setError(null); }}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            returnKeyType="next"
            accessibilityLabel="Email"
          />
          <Field
            value={password}
            onChangeText={(value) => { setPassword(value); setError(null); }}
            placeholder="Password · 8+ characters"
            secureTextEntry
            textContentType={signUp ? 'newPassword' : 'password'}
            returnKeyType="go"
            onSubmitEditing={() => emailValid && passwordValid && void authenticate({ provider: 'email', mode, email: email.trim(), password })}
            accessibilityLabel="Password"
          />
          {!signUp ? (
            <View style={styles.forgotRow}>
              <TextButton label={loading === 'forgot' ? 'Sending…' : 'Forgot Password?'} onPress={() => void forgotPassword()} />
            </View>
          ) : null}
        </View>

        {error ? <Text accessibilityRole="alert" style={styles.authError}>{error}</Text> : null}

        <View style={styles.accountActions}>
          <PrimaryButton
            label={loading === 'email' ? 'Please Wait…' : signUp ? 'Create Account' : 'Sign In'}
            disabled={loading !== null}
            onPress={() => void authenticate({ provider: 'email', mode, email: email.trim(), password })}
          />
          <TextButton
            label={signUp ? 'Already have an account? Sign In' : 'New to VAEL? Create Account'}
            onPress={() => { setMode(signUp ? 'signIn' : 'signUp'); setError(null); }}
          />
          <TextButton label="Not Now" onPress={onNotNow} color={colors.tertiary} />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );

  async function authenticate(request: AuthRequest) {
    if (request.provider === 'email') {
      if (!emailValid) {
        setError('Enter a valid email address.');
        return;
      }
      if (!passwordValid) {
        setError('Password must be at least 8 characters.');
        return;
      }
    }
    setError(null);
    setLoading(request.provider);
    try {
      const result = await onAuthenticate(request);
      if (result.ok) onContinue();
      else setError(result.error);
    } catch {
      setError('VAEL could not complete authentication. Try again.');
    } finally {
      setLoading(null);
    }
  }

  async function forgotPassword() {
    if (!emailValid) {
      setError('Enter your email first, then request a reset link.');
      return;
    }
    setError(null);
    setLoading('forgot');
    try {
      const result = await onForgotPassword(email.trim());
      setError(result.ok ? 'Check your email for password reset instructions.' : result.error);
    } catch {
      setError('VAEL could not send a reset link. Try again.');
    } finally {
      setLoading(null);
    }
  }
}

function AuthProviderButton({
  provider,
  loading,
  disabled,
  onPress,
}: {
  provider: 'apple' | 'google';
  loading: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const apple = provider === 'apple';
  const label = `Sign in with ${apple ? 'Apple' : 'Google'}`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, busy: loading }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.providerButton,
        apple ? styles.appleButton : styles.googleButton,
        pressed && styles.providerPressed,
        disabled && !loading && styles.providerDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={apple ? colors.accentInk : colors.primary} />
      ) : (
        <Icon name={apple ? 'apple.logo' : 'g.circle'} color={apple ? colors.accentInk : colors.primary} size={21} weight="semibold" />
      )}
      <Text style={[styles.providerLabel, apple ? styles.appleLabel : styles.googleLabel]}>{label}</Text>
    </Pressable>
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
  keyboardRoot: { flex: 1, backgroundColor: colors.canvas },
  accountHeader: { paddingTop: spacing.xxxl, gap: spacing.md },
  accountIcon: { width: 72, height: 72, borderRadius: 24, backgroundColor: colors.accentSurface, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  providerActions: { gap: spacing.md, marginTop: spacing.xxxl },
  providerButton: { minHeight: 54, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing.xl },
  appleButton: { backgroundColor: colors.primary },
  googleButton: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong },
  providerPressed: { opacity: 0.84, transform: [{ scale: 0.99 }] },
  providerDisabled: { opacity: 0.46 },
  providerLabel: { fontSize: 15, fontWeight: '700' },
  appleLabel: { color: colors.accentInk },
  googleLabel: { color: colors.primary },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xxl },
  orLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.borderStrong },
  orText: { color: colors.tertiary, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  fields: { gap: spacing.md, marginTop: spacing.xxl },
  forgotRow: { alignItems: 'flex-end', marginTop: -spacing.xs },
  authError: { color: colors.danger, fontSize: 13, lineHeight: 19, marginTop: spacing.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.danger, borderRadius: 12, backgroundColor: colors.dangerSurface },
  accountActions: { gap: spacing.sm, marginTop: spacing.xxxl, paddingBottom: spacing.xl },
  paywallHeader: { gap: spacing.md, paddingTop: spacing.xl },
  benefits: { gap: spacing.md, marginVertical: spacing.xxl },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  benefitIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: colors.accentSurface, alignItems: 'center', justifyContent: 'center' },
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
