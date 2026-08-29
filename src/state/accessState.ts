export type AuthStatus = 'signedOut' | 'signedIn';

export type EntitlementStatus =
  | 'none'
  | 'monthlyActive'
  | 'annualTrial'
  | 'annualActive'
  | 'expired';

export type AccessState = {
  onboardingCompleted: boolean;
  authStatus: AuthStatus;
  entitlementStatus: EntitlementStatus;
};

export type AccessDestination = 'onboarding' | 'account' | 'paywall' | 'main';
export type PaywallContext = 'required' | 'membership';

export type MembershipPresentation = {
  plan: 'Annual' | 'Monthly';
  status: '3-Day Free Trial' | 'Active';
  badge: 'TRIAL ACTIVE' | 'ACTIVE';
  renewal: string;
};

export function hasActiveEntitlement(status: EntitlementStatus) {
  return status === 'monthlyActive' || status === 'annualTrial' || status === 'annualActive';
}

export function canDismissPaywall(context: PaywallContext) {
  return context === 'membership';
}

export function membershipPresentation(status: EntitlementStatus): MembershipPresentation | null {
  if (status === 'annualTrial') {
    return {
      plan: 'Annual',
      status: '3-Day Free Trial',
      badge: 'TRIAL ACTIVE',
      renewal: 'Renews at $39.99/year when the trial ends.',
    };
  }
  if (status === 'annualActive') {
    return { plan: 'Annual', status: 'Active', badge: 'ACTIVE', renewal: 'Renews at $39.99/year.' };
  }
  if (status === 'monthlyActive') {
    return { plan: 'Monthly', status: 'Active', badge: 'ACTIVE', renewal: 'Renews at $9.99/month.' };
  }
  return null;
}

export function resolveAccessDestination(state: AccessState): AccessDestination {
  if (state.authStatus === 'signedIn') {
    return hasActiveEntitlement(state.entitlementStatus) ? 'main' : 'paywall';
  }
  return state.onboardingCompleted ? 'account' : 'onboarding';
}

export function normalizeAccessState(value?: Partial<AccessState>): AccessState {
  return {
    onboardingCompleted: Boolean(value?.onboardingCompleted),
    authStatus: value?.authStatus === 'signedIn' ? 'signedIn' : 'signedOut',
    entitlementStatus: value?.entitlementStatus ?? 'none',
  };
}
