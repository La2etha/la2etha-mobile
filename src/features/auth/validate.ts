export function validateLogin({ email, password }: { email: string; password: string }) {
  if (!email.includes('@')) return { ok: false, error: 'Enter the email you signed up with.' };
  if (password.length < 1) return { ok: false, error: 'Enter your password.' };
  return { ok: true };
}

export function validateRegister({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  if (name.trim().length < 2) return { ok: false, error: 'What should we call you?' };
  if (!email.includes('@')) return { ok: false, error: 'Enter a valid email.' };
  if (password.length < 6) return { ok: false, error: 'Use at least 6 characters for your password.' };
  return { ok: true };
}
