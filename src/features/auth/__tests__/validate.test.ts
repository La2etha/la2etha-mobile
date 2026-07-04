import { validateLogin, validateRegister } from '../validate';

test('rejects empty email with a helpful message', () => {
  expect(validateLogin({ email: '', password: 'x' })).toMatchObject({ ok: false });
});
test('accepts a plausible email + password', () => {
  expect(validateLogin({ email: 'a@b.com', password: 'secret' }).ok).toBe(true);
});

test('register needs a name', () => {
  expect(validateRegister({ name: '', email: 'a@b.com', password: 'secret1' }).ok).toBe(false);
});
test('register needs a 6+ char password', () => {
  expect(validateRegister({ name: 'Ziad', email: 'a@b.com', password: '123' }).ok).toBe(false);
});
test('valid registration passes', () => {
  expect(validateRegister({ name: 'Ziad', email: 'a@b.com', password: 'secret1' }).ok).toBe(true);
});
