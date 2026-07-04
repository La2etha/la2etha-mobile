import { decideBootRoute } from '../route';

test('still loading → stay on splash', () => {
  expect(decideBootRoute({ status: 'loading', firstRun: true })).toBe('/splash');
});
test('signed out + first run → onboarding', () => {
  expect(decideBootRoute({ status: 'signedOut', firstRun: true })).toBe('/onboarding');
});
test('signed out + returning → login', () => {
  expect(decideBootRoute({ status: 'signedOut', firstRun: false })).toBe('/(auth)/login');
});
test('signed in → app home', () => {
  expect(decideBootRoute({ status: 'signedIn', firstRun: false })).toBe('/(app)');
});
