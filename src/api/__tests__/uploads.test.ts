import { enroll, enrollStatus } from '../enroll';
import { uploadPhotos } from '../photos';

const g: any = global;
afterEach(() => {
  g.fetch = undefined;
});

test('enroll POSTs multipart FormData with the token', async () => {
  g.fetch = jest.fn().mockResolvedValue({ ok: true, status: 202, json: async () => ({ job_id: 'j', sample_count: 3 }) });
  const out = await enroll('e1', ['file:///a.jpg', 'file:///b.jpg', 'file:///c.jpg'], 'jwt');
  expect(out.sample_count).toBe(3);
  const [url, init] = g.fetch.mock.calls[0];
  expect(url).toMatch(/\/events\/e1\/enroll$/);
  expect(init.method).toBe('POST');
  expect(init.body).toBeInstanceOf(FormData);
  expect(init.headers.Authorization).toBe('Bearer jwt');
  // No hand-set Content-Type — fetch must add the multipart boundary itself.
  expect(init.headers['Content-Type']).toBeUndefined();
});

test('enrollStatus GETs with the job_id query', async () => {
  g.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ job_id: 'j', status: 'finished', enrolled: true }) });
  const s = await enrollStatus('e1', 'job-abc', 'jwt');
  expect(s.enrolled).toBe(true);
  const [url] = g.fetch.mock.calls[0];
  expect(url).toMatch(/enroll\/status\?job_id=job-abc$/);
});

test('uploadPhotos POSTs multipart to the pool endpoint', async () => {
  g.fetch = jest.fn().mockResolvedValue({ ok: true, status: 202, json: async () => ({ job_id: 'j', photo_ids: ['1'], accepted: 1, duplicates: 0 }) });
  const out = await uploadPhotos('e1', ['file:///p.jpg'], 'jwt');
  expect(out.accepted).toBe(1);
  const [url, init] = g.fetch.mock.calls[0];
  expect(url).toMatch(/\/events\/e1\/photos$/);
  expect(init.body).toBeInstanceOf(FormData);
});
