import { uniqueDemotedPhotos } from '../dedupe';

test('collapses repeated photos, keeps first reason and order', () => {
  const out = uniqueDemotedPhotos([
    { photo_id: 'a', account_id: 'u1', demote_reason: 'blurry' },
    { photo_id: 'a', account_id: 'u2', demote_reason: 'background' },
    { photo_id: 'b', account_id: 'u1', demote_reason: 'background' },
  ]);
  expect(out.map((x) => x.photo_id)).toEqual(['a', 'b']);
  expect(out[0].demote_reason).toBe('blurry');
});
