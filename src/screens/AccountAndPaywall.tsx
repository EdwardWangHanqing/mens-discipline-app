import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Card, Eyebrow, Field, Icon, PrimaryButton, Screen, TextButton, Title, TopBar } from '../components/ui';
import {
  canDismissPaywall,
  membershipPresentation,
  type EntitlementStatus,
  type PaywallContext,
} from '../state/accessState';
import { colors, radii, spacing, typography } from '../theme/designSystem';

export type AuthRequest =
  | { provider: 'apple' | 'google'; mode: 'signUp' | 'signIn' }
  | { provider: 'email'; mode: 'signUp' | 'signIn'; email: string; password: string };

export type AuthResult = { ok: true } | { ok: false; error: string };
export type SubscriptionPlan = 'annual' | 'monthly';
export type SubscriptionResult =
  | { ok: true; entitlementStatus: Extract<EntitlementStatus, 'monthlyActive' | 'annualTrial' | 'annualActive'> }
  | { ok: false; error: string };

export function AccountScreen({ mode, setMode, onContinue, onBack, onAuthenticate, onForgotPassword, onOpenDeveloperControls }: {
  mode: 'signUp' | 'signIn';
  setMode: (mode: 'signUp' | 'signIn') => void;
  onContinue: () => void;
  onBack: () => void;
  onAuthenticate: (request: AuthRequest) => Promise<AuthResult>;
  onForgotPassword: (email: string) => Promise<AuthResult>;
  onOpenDeveloperControls?: () => void;
}) {
  const signUp = mode === 'signUp';
  const [emailExpanded, setEmailExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<'apple' | 'google' | 'email' | 'forgot' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordValid = signUp ? password.length >= 8 : password.length > 0;

  return (
    <KeyboardAvoidingView style={styles.keyboardRoot} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen scroll testID={`account-${mode}`}>
        <TopBar onBack={onBack} />
        <View style={styles.accountHeader}>
          <View style={styles.accountIcon}><Icon name="person.crop.circle.badge.checkmark" color={colors.accent} size={35} /></View>
          <Eyebrow accent>YOUR ACCOUNT</Eyebrow>
          <Title>{signUp ? 'Keep your progress with you.' : 'Welcome back to VAEL.'}</Title>
          <Body muted>{signUp ? 'Create your account to continue with VAEL.' : 'Sign in to restore your account and subscription access.'}</Body>
        </View>

        <View style={styles.providerActions}>
          <ProviderButton provider="apple" loading={loading === 'apple'} disabled={loading !== null} onPress={() => void authenticate({ provider: 'apple', mode })} />
          <ProviderButton provider="google" loading={loading === 'google'} disabled={loading !== null} onPress={() => void authenticate({ provider: 'google', mode })} />
          <ProviderButton provider="email" loading={loading === 'email'} disabled={loading !== null} onPress={() => setEmailExpanded(true)} />
        </View>

        {emailExpanded ? (
          <View style={styles.emailPanel}>
            <View style={styles.orRow}><View style={styles.orLine} /><Text style={styles.orText}>EMAIL</Text><View style={styles.orLine} /></View>
            <Field value={email} onChangeText={(value) => { setEmail(value); setError(null); }} placeholder="Email" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} textContentType="emailAddress" returnKeyType="next" accessibilityLabel="Email" />
            <Field value={password} onChangeText={(value) => { setPassword(value); setError(null); }} placeholder={signUp ? 'Password · 8+ characters' : 'Password'} secureTextEntry textContentType={signUp ? 'newPassword' : 'password'} returnKeyType="go" onSubmitEditing={() => emailValid && passwordValid && void authenticate({ provider: 'email', mode, email: email.trim(), password })} accessibilityLabel="Password" />
            {!signUp ? <View style={styles.forgotRow}><TextButton label={loading === 'forgot' ? 'Sending…' : 'Forgot Password?'} onPress={() => void forgotPassword()} /></View> : null}
            <PrimaryButton label={loading === 'email' ? 'Please Wait…' : signUp ? 'Create Account' : 'Sign In'} disabled={loading !== null} onPress={() => void authenticate({ provider: 'email', mode, email: email.trim(), password })} />
          </View>
        ) : null}

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

        <View style={styles.accountFooter}>
          <TextButton label={signUp ? 'Already have an account? Sign In' : 'New to VAEL? Create Account'} onPress={() => { setMode(signUp ? 'signIn' : 'signUp'); setError(null); }} />
          <View style={styles.trustRow}><Icon name="lock.shield" color={colors.accent} size={17} /><Text style={styles.trustCopy}>Your identity and subscription are separate. Signing in never creates paid access.</Text></View>
          {onOpenDeveloperControls ? <TextButton label="Developer Controls" onPress={onOpenDeveloperControls} color={colors.tertiary} /> : null}
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );

  async function authenticate(request: AuthRequest) {
    if (request.provider === 'email') {
      if (!emailValid) { setError('Enter a valid email address.'); return; }
      if (!passwordValid) { setError(signUp ? 'Password must be at least 8 characters.' : 'Enter your password.'); return; }
    }
    setError(null);
    setLoading(request.provider);
    try {
      const result = await onAuthenticate(request);
      if (result.ok) onContinue(); else setError(result.error);
    } catch {
      setError('VAEL could not complete authentication. Try again.');
    } finally {
      setLoading(null);
    }
  }

  async function forgotPassword() {
    if (!emailValid) { setError('Enter your email first, then request a reset link.'); return; }
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

function ProviderButton({ provider, loading, disabled, onPress }: { provider: 'apple' | 'google' | 'email'; loading: boolean; disabled: boolean; onPress: () => void }) {
  const apple = provider === 'apple';
  const label = `Continue with ${provider === 'apple' ? 'Apple' : provider === 'google' ? 'Google' : 'Email'}`;
  const symbol = provider === 'apple' ? 'apple.logo' : provider === 'google' ? 'g.circle' : 'envelope.fill';
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled, busy: loading }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.providerButton, apple ? styles.appleButton : styles.providerOutline, pressed && styles.providerPressed, disabled && !loading && styles.providerDisabled]}>
      {loading ? <ActivityIndicator color={apple ? colors.accentInk : colors.primary} /> : <Icon name={symbol} color={apple ? colors.accentInk : colors.primary} size={21} weight="semibold" />}
      <Text style={[styles.providerLabel, apple ? styles.appleLabel : styles.providerOutlineLabel]}>{label}</Text>
    </Pressable>
  );
}

export function PaywallScreen({ context, entitlementStatus, onClose, onPurchase, onRestore, onAccessActivated, onManageSubscription, onOpenLegal, onOpenDeveloperControls }: {
  context: PaywallContext;
  entitlementStatus: EntitlementStatus;
  onClose?: () => void;
  onPurchase: (plan: SubscriptionPlan) => Promise<SubscriptionResult>;
  onRestore: () => Promise<SubscriptionResult>;
  onAccessActivated: (status: Extract<EntitlementStatus, 'monthlyActive' | 'annualTrial' | 'annualActive'>) => void;
  onManageSubscription: () => void;
  onOpenLegal: (page: 'terms' | 'privacy') => void;
  onOpenDeveloperControls?: () => void;
}) {
  const [selected, setSelected] = useState<SubscriptionPlan>('annual');
  const [busy, setBusy] = useState<'purchase' | 'restore' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dismissible = canDismissPaywall(context);
  const currentMembership = context === 'membership' ? membershipPresentation(entitlementStatus) : null;

  if (currentMembership) {
    return (
      <Screen scroll testID="membership-current">
        <TopBar title="Membership" onBack={dismissible ? onClose : undefined} />
        <View style={styles.currentHeader}>
          <View style={styles.membershipMark}><Icon name="checkmark.shield.fill" color={colors.accent} size={34} /></View>
          <Eyebrow accent>CURRENT MEMBERSHIP</Eyebrow>
          <Title compact>Your plan is active.</Title>
          <Body muted>Manage billing through Apple while VAEL keeps your training access in sync.</Body>
        </View>
        <Card style={styles.currentPlanCard} elevated>
          <View style={styles.currentPlanTop}>
            <View><Text style={styles.currentPlanName}>{currentMembership.plan}</Text><Text style={styles.currentPlanStatus}>{currentMembership.status}</Text></View>
            <View style={styles.currentBadge}><Text style={styles.currentBadgeText}>{currentMembership.badge}</Text></View>
          </View>
          <View style={styles.currentDivider} />
          <View style={styles.currentRenewalRow}><Icon name="calendar" color={colors.accent} size={20} /><Text style={styles.currentRenewal}>{currentMembership.renewal}</Text></View>
        </Card>
        <View style={styles.paywallActions}>
          <PrimaryButton label="Manage Subscription" onPress={onManageSubscription} />
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <TextButton label={busy === 'restore' ? 'Restoring…' : 'Restore Purchases'} onPress={() => void restore()} color={colors.primary} />
          <LegalLinks onOpenLegal={onOpenLegal} />
          {onOpenDeveloperControls ? <TextButton label="Developer Controls" onPress={onOpenDeveloperControls} color={colors.tertiary} /> : null}
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll testID={context === 'required' ? 'required-paywall' : 'membership-purchase'}>
      {dismissible ? <TopBar title="Membership" onBack={onClose} /> : null}
      <View style={styles.paywallHeader}>
        <View style={styles.membershipMark}><Icon name="checkmark.shield.fill" color={colors.accent} size={34} /></View>
        <Eyebrow accent>{context === 'required' ? 'VAEL MEMBERSHIP' : 'MEMBERSHIP'}</Eyebrow>
        <Title>{context === 'required' ? 'Your daily standard starts here.' : entitlementStatus === 'expired' ? 'Return to your standard.' : 'Choose your membership.'}</Title>
        <Body muted>{context === 'required' ? 'Daily men’s performance training, guided structure, accountability, and momentum.' : entitlementStatus === 'expired' ? 'Your previous access has ended. Choose a plan to continue when you are ready.' : 'Choose Annual or Monthly. You can close this screen without changing your current app state.'}</Body>
      </View>

      <View style={styles.benefits}>
        <Benefit icon="figure.strengthtraining.traditional" title="One focused movement every day" />
        <Benefit icon="timer" title="Five guided sets with the pace handled" />
        <Benefit icon="lock.shield" title="Accountability tied only to apps you choose" />
      </View>

      <View style={styles.plans}>
        <PlanCard selected={selected === 'annual'} title="Annual" price="$39.99 / YEAR" badge="BEST VALUE" support="$3.33 / month · 3 days free" onPress={() => setSelected('annual')} />
        <PlanCard selected={selected === 'monthly'} title="Monthly" price="$9.99 / MONTH" badge="NO FREE TRIAL" support="No free trial · Cancel anytime" onPress={() => setSelected('monthly')} />
      </View>

      <View style={styles.paywallActions}>
        <PrimaryButton label={busy === 'purchase' ? 'Please Wait…' : selected === 'annual' ? 'START 3-DAY FREE TRIAL' : 'CONTINUE — $9.99/MONTH'} disabled={busy !== null} onPress={() => void purchase()} />
        <Text style={styles.renewalCopy}>{selected === 'annual' ? '3 days free, then $39.99/year. Cancel anytime.' : '$9.99/month billed immediately. Auto-renews until cancelled.'}</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <TextButton label={busy === 'restore' ? 'Restoring…' : 'Restore Purchases'} onPress={() => void restore()} color={colors.primary} />
        <LegalLinks onOpenLegal={onOpenLegal} includeBillingCopy />
        {onOpenDeveloperControls ? <TextButton label="Developer Controls" onPress={onOpenDeveloperControls} color={colors.tertiary} /> : null}
      </View>
    </Screen>
  );

  async function purchase() {
    setBusy('purchase'); setError(null);
    try { const result = await onPurchase(selected); if (result.ok) onAccessActivated(result.entitlementStatus); else setError(result.error); }
    catch { setError('VAEL could not start the App Store purchase. Try again.'); }
    finally { setBusy(null); }
  }

  async function restore() {
    setBusy('restore'); setError(null);
    try { const result = await onRestore(); if (result.ok) onAccessActivated(result.entitlementStatus); else setError(result.error); }
    catch { setError('VAEL could not restore purchases. Try again.'); }
    finally { setBusy(null); }
  }
}

function LegalLinks({ onOpenLegal, includeBillingCopy = false }: { onOpenLegal: (page: 'terms' | 'privacy') => void; includeBillingCopy?: boolean }) {
  return (
    <>
      <View style={styles.legalRow}>
        <Pressable accessibilityRole="link" onPress={() => onOpenLegal('terms')}><Text style={styles.legalLink}>Terms</Text></Pressable>
        <Text style={styles.legalDot}>·</Text>
        <Pressable accessibilityRole="link" onPress={() => onOpenLegal('privacy')}><Text style={styles.legalLink}>Privacy</Text></Pressable>
      </View>
      {includeBillingCopy ? <Text style={styles.legalCopy}>Payment is charged to your Apple ID. Subscriptions renew automatically unless cancelled at least 24 hours before the current period ends.</Text> : null}
    </>
  );
}

function Benefit({ icon, title }: { icon: Parameters<typeof Icon>[0]['name']; title: string }) {
  return <View style={styles.benefit}><View style={styles.benefitIcon}><Icon name={icon} color={colors.accent} size={19} /></View><Text style={styles.benefitTitle}>{title}</Text></View>;
}

function PlanCard({ selected, title, price, badge, support, onPress }: { selected: boolean; title: string; price: string; badge: string; support: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${title}, ${price}, ${badge}`} accessibilityState={{ selected }} onPress={onPress}>
      <Card style={[styles.plan, selected ? styles.planSelected : {}]}>
        <View style={styles.planTop}><Text style={styles.planTitle}>{title}</Text><View style={[styles.badge, selected && styles.badgeSelected]}><Text style={[styles.badgeText, selected && styles.badgeTextSelected]}>{badge}</Text></View></View>
        <Text style={styles.planPrice}>{price}</Text>
        <Text style={styles.planSupport}>{support}</Text>
        <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: { flex: 1, backgroundColor: colors.canvas },
  accountHeader: { paddingTop: spacing.xxxl, gap: spacing.md },
  accountIcon: { width: 72, height: 72, borderRadius: 24, backgroundColor: colors.accentSurface, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.borderStrong },
  providerActions: { gap: spacing.md, marginTop: spacing.xxxl },
  providerButton: { minHeight: 56, borderRadius: radii.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing.xl },
  appleButton: { backgroundColor: colors.primary }, providerOutline: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong }, providerPressed: { opacity: 0.84, transform: [{ scale: 0.99 }] }, providerDisabled: { opacity: 0.46 }, providerLabel: { fontSize: 15, fontWeight: '700' }, appleLabel: { color: colors.accentInk }, providerOutlineLabel: { color: colors.primary },
  emailPanel: { gap: spacing.md, marginTop: spacing.xxl }, orRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, orLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.borderStrong }, orText: { color: colors.tertiary, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 }, forgotRow: { alignItems: 'flex-end', marginTop: -spacing.xs },
  error: { color: colors.danger, fontSize: 13, lineHeight: 19, marginTop: spacing.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.danger, borderRadius: 12, backgroundColor: colors.dangerSurface },
  accountFooter: { gap: spacing.lg, marginTop: spacing.xxxl, paddingBottom: spacing.xl }, trustRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.surfaceSoft, borderRadius: radii.md }, trustCopy: { flex: 1, color: colors.secondary, fontSize: 11, lineHeight: 16 },
  paywallHeader: { gap: spacing.md, paddingTop: spacing.xxxl }, membershipMark: { width: 70, height: 70, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentSurface, borderWidth: 1, borderColor: colors.borderStrong, marginBottom: spacing.md },
  currentHeader: { gap: spacing.md, paddingTop: spacing.xl },
  currentPlanCard: { marginTop: spacing.xxxl, gap: spacing.lg, borderColor: colors.accent, borderWidth: 1.5, backgroundColor: colors.accentSurface },
  currentPlanTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.lg },
  currentPlanName: { color: colors.primary, fontSize: 28, lineHeight: 34, fontWeight: '800' },
  currentPlanStatus: { color: colors.secondary, fontSize: 15, lineHeight: 22, marginTop: spacing.xs },
  currentBadge: { borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.accent },
  currentBadgeText: { ...typography.eyebrow, color: colors.accentInk, fontSize: 9 },
  currentDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderStrong },
  currentRenewalRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  currentRenewal: { flex: 1, color: colors.primary, fontSize: 14, lineHeight: 20 },
  benefits: { gap: spacing.md, marginVertical: spacing.xxl }, benefit: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, benefitIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: colors.accentSurface, alignItems: 'center', justifyContent: 'center' }, benefitTitle: { color: colors.primary, fontSize: 14, flex: 1 },
  plans: { gap: spacing.md }, plan: { gap: spacing.sm, padding: spacing.lg, position: 'relative' }, planSelected: { borderColor: colors.accent, borderWidth: 1.5, backgroundColor: colors.accentSurface }, planTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: spacing.xxxl }, planTitle: { color: colors.primary, fontSize: 17, fontWeight: '700' }, badge: { borderRadius: radii.pill, borderWidth: 1, borderColor: colors.borderStrong, paddingHorizontal: spacing.sm, paddingVertical: 5 }, badgeSelected: { backgroundColor: colors.accent, borderColor: colors.accent }, badgeText: { ...typography.eyebrow, color: colors.secondary, fontSize: 9 }, badgeTextSelected: { color: colors.accentInk }, planPrice: { color: colors.primary, fontSize: 24, fontWeight: '800' }, planSupport: { color: colors.secondary, fontSize: 12 }, radio: { position: 'absolute', right: spacing.lg, top: spacing.lg, width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' }, radioSelected: { borderColor: colors.accent }, radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  paywallActions: { gap: spacing.md, marginTop: spacing.xxxl, paddingBottom: spacing.xl }, renewalCopy: { color: colors.secondary, fontSize: 11, lineHeight: 16, textAlign: 'center', paddingHorizontal: spacing.md }, legalRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.sm }, legalLink: { color: colors.secondary, fontSize: 12, textDecorationLine: 'underline' }, legalDot: { color: colors.tertiary }, legalCopy: { color: colors.tertiary, fontSize: 10, lineHeight: 15, textAlign: 'center', paddingHorizontal: spacing.sm },
});
