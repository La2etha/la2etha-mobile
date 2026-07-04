import { toFriendly } from '../errors';

test('network failure is friendly, no codes', () => {
  const m = toFriendly(0, 'network');
  expect(m).toMatch(/reach Lahza/i);
  expect(m).not.toMatch(/\b(0|500|error)\b/i);
});

test('503 reads as feature-not-on, not a crash', () => {
  expect(toFriendly(503, 'http')).toMatch(/isn't switched on|not available/i);
});

test('401 reads as sign-in needed', () => {
  expect(toFriendly(401, 'http')).toMatch(/sign in/i);
});

test('unknown 5xx is calm and blameless', () => {
  const m = toFriendly(500, 'http');
  expect(m).not.toMatch(/500|stack|exception/i);
  expect(m.length).toBeGreaterThan(10);
});
