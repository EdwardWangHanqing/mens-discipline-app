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

export function hasActiveEntitlement(status: EntitlementStatus) {
  return status === 'monthlyActive' || status === 'annualTrial' || status === 'annualActive';
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
