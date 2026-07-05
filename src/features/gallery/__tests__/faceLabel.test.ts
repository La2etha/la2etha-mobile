import { faceLabelState } from '../faceLabel';

test('is_me → self, "You"', () => {
  expect(faceLabelState({ is_me: true })).toEqual({ state: 'self', text: 'You' });
});

test('has a name → member, shows the name', () => {
  expect(faceLabelState({ is_me: false, name: 'Nour' })).toEqual({ state: 'member', text: 'Nour' });
});

test('no name → guest, never an internal id', () => {
  expect(faceLabelState({ is_me: false })).toEqual({ state: 'guest', text: 'Guest' });
});

test('is_me wins even if a name is present', () => {
  expect(faceLabelState({ is_me: true, name: 'Nour' })).toEqual({ state: 'self', text: 'You' });
});
