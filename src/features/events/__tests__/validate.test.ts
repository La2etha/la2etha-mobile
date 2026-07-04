import { validateEventName, validateJoinCode, normalizeJoinCode } from '../validate';

test('event name needs at least 2 characters', () => {
  expect(validateEventName(' ').ok).toBe(false);
  expect(validateEventName('Ziad’s wedding').ok).toBe(true);
});

test('join code is trimmed and upper-cased', () => {
  expect(normalizeJoinCode('  ab12cd ')).toBe('AB12CD');
});

test('empty join code is rejected', () => {
  expect(validateJoinCode('   ').ok).toBe(false);
  expect(validateJoinCode('ab12cd').ok).toBe(true);
});
