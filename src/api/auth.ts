import { apiFetch } from './client';

export type User = { id: string; email: string; name: string };

export function register(email: string, password: string, name: string): Promise<User> {
  return apiFetch<User>('/auth/register', { method: 'POST', jsonBody: { email, password, name } });
}

// FastAPI-Users JWT login is OAuth2 form-encoded: username = email.
export async function login(email: string, password: string): Promise<string> {
  const r = await apiFetch<{ access_token: string }>('/auth/jwt/login', {
    method: 'POST',
    formBody: { username: email, password },
  });
  return r.access_token;
}

export function me(token: string): Promise<User> {
  return apiFetch<User>('/users/me', { token });
}

/** Delete the caller's face data: enrollments, gallery entries, cluster claims
 *  (FR-022). The account itself stays. */
export function deleteIdentity(token: string): Promise<void> {
  return apiFetch<void>('/users/me/identity', { method: 'DELETE', token });
}
