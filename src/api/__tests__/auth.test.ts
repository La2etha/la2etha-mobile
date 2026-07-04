import { login, register } from '../auth';

const g: any = global;
afterEach(() => {
  g.fetch = undefined;
});

test('login posts form-encoded username=email and returns token', async () => {
  g.fetch = jest
    .fn()
    .mockResolvedValue({ ok: true, status: 200, json: async () => ({ access_token: 'jwt123', token_type: 'bearer' }) });
  const token = await login('ziad@x.com', 'pw');
  expect(token).toBe('jwt123');
  const [url, init] = g.fetch.mock.calls[0];
  expect(url).toMatch(/\/auth\/jwt\/login$/);
  expect(init.body).toContain('username=ziad%40x.com');
});

test('register posts JSON name+email+password', async () => {
  g.fetch = jest
    .fn()
    .mockResolvedValue({ ok: true, status: 201, json: async () => ({ id: '1', email: 'z@x.com', name: 'Ziad' }) });
  const u = await register('z@x.com', 'pw', 'Ziad');
  expect(u.name).toBe('Ziad');
  const [, init] = g.fetch.mock.calls[0];
  expect(JSON.parse(init.body)).toEqual({ email: 'z@x.com', password: 'pw', name: 'Ziad' });
});
