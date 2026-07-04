import { listEvents, createEvent, joinEvent } from '../events';

const g: any = global;
afterEach(() => {
  g.fetch = undefined;
});

test('listEvents GETs /events with the bearer token', async () => {
  g.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => [] });
  await listEvents('jwt');
  const [url, init] = g.fetch.mock.calls[0];
  expect(url).toMatch(/\/events$/);
  expect(init.method ?? 'GET').toBe('GET');
  expect(init.headers.Authorization).toBe('Bearer jwt');
});

test('createEvent POSTs the name as JSON', async () => {
  g.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 201,
    json: async () => ({ id: '1', name: 'Wedding', join_code: 'AB12', join_link: 'x' }),
  });
  const out = await createEvent('Wedding', 'jwt');
  expect(out.join_code).toBe('AB12');
  const [, init] = g.fetch.mock.calls[0];
  expect(JSON.parse(init.body)).toEqual({ name: 'Wedding' });
});

test('joinEvent POSTs { join_code }', async () => {
  g.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ id: '1', name: 'Wedding', join_code: 'AB12' }),
  });
  await joinEvent('ab12', 'jwt');
  const [url, init] = g.fetch.mock.calls[0];
  expect(url).toMatch(/\/events\/join$/);
  expect(JSON.parse(init.body)).toEqual({ join_code: 'ab12' });
});
