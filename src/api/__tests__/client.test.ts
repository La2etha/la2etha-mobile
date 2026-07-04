import { apiFetch } from '../client';
import { ApiError } from '../errors';

const g: any = global;
afterEach(() => {
  g.fetch = undefined;
});

test('sends bearer token and parses JSON', async () => {
  g.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ name: 'Ziad' }) });
  const out = await apiFetch<{ name: string }>('/users/me', { token: 'abc' });
  expect(out.name).toBe('Ziad');
  const [, init] = g.fetch.mock.calls[0];
  expect(init.headers.Authorization).toBe('Bearer abc');
});

test('form body is url-encoded, not JSON', async () => {
  g.fetch = jest
    .fn()
    .mockResolvedValue({ ok: true, status: 200, json: async () => ({ access_token: 't', token_type: 'bearer' }) });
  await apiFetch('/auth/jwt/login', { method: 'POST', formBody: { username: 'a@b.com', password: 'pw' } });
  const [, init] = g.fetch.mock.calls[0];
  expect(init.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
  expect(init.body).toContain('username=a%40b.com');
});

test('http failure throws ApiError with friendly message', async () => {
  g.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });
  await expect(apiFetch('/x')).rejects.toMatchObject({ status: 503 } as Partial<ApiError>);
});

test('network failure throws friendly ApiError', async () => {
  g.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
  await expect(apiFetch('/x')).rejects.toHaveProperty('friendly', expect.stringMatching(/reach Lahza/i));
});
