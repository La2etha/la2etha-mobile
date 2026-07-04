type Args = { status: 'loading' | 'signedOut' | 'signedIn'; firstRun: boolean };
type BootRoute = '/splash' | '/(app)' | '/onboarding' | '/(auth)/login';

// Pure decision for where the splash sends the user once auth resolves.
export function decideBootRoute({ status, firstRun }: Args): BootRoute {
  if (status === 'loading') return '/splash';
  if (status === 'signedIn') return '/(app)';
  return firstRun ? '/onboarding' : '/(auth)/login';
}
