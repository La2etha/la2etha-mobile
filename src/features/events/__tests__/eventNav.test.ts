import { decideEventNav } from '../eventNav';

test('not enrolled → launcher', () => {
  expect(decideEventNav({ enrolled: false })).toBe('launcher');
});
test('enrolled → tabbed shell', () => {
  expect(decideEventNav({ enrolled: true })).toBe('tabbed');
});
