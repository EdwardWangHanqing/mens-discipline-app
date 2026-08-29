import { Linking } from 'react-native';
import { useRouter } from 'expo-router';

import { PaywallScreen, type SubscriptionPlan, type SubscriptionResult } from '../../screens/AccountAndPaywall';
import { useAppShell } from '../../state/appShell';

export default function MembershipRoute() {
  const router = useRouter();
  const { access, setAccess } = useAppShell();

  return (
    <PaywallScreen
      context="membership"
      entitlementStatus={access.entitlementStatus}
      onClose={() => router.back()}
      onPurchase={purchaseSubscription}
      onRestore={restorePurchases}
      onAccessActivated={(entitlementStatus) => setAccess((current) => ({ ...current, authStatus: 'signedIn', entitlementStatus }))}
      onManageSubscription={() => void Linking.openURL('https://apps.apple.com/account/subscriptions')}
      onOpenLegal={(page) => router.push({ pathname: '/profile/settings/[page]', params: { page } })}
      onOpenDeveloperControls={undefined}
    />
  );
}

async function purchaseSubscription(_plan: SubscriptionPlan): Promise<SubscriptionResult> {
  return { ok: false, error: 'App Store purchasing is not connected in this build. Use Debug Developer Controls to test entitlement routing.' };
}

async function restorePurchases(): Promise<SubscriptionResult> {
  return { ok: false, error: 'Restore Purchases will activate when the StoreKit or RevenueCat entitlement adapter is connected.' };
}
