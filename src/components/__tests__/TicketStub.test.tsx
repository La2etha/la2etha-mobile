import { render, fireEvent } from '@testing-library/react-native';
import { TicketStub } from '../TicketStub';
import type { EventListItem } from '../../api/events';

const event: EventListItem = {
  id: '1',
  name: 'Ziad’s Wedding',
  owner_id: 'u1',
  join_code: 'AB12CD',
  status: 'active',
  privacy_default_remove_strangers: false,
  created_at: '2026-07-04T00:00:00Z',
  role: 'host',
  member_count: 5,
  photo_count: 12,
};

test('shows name, counts, code, HOST stamp, and opens on press', () => {
  const onPress = jest.fn();
  const { getByText } = render(<TicketStub event={event} onPress={onPress} />);
  getByText('Ziad’s Wedding');
  getByText('12');
  getByText('people');
  getByText('AB12CD');
  getByText('HOST');
  fireEvent.press(getByText('Ziad’s Wedding'));
  expect(onPress).toHaveBeenCalled();
});

test('member (non-host) shows no HOST stamp and singular person', () => {
  const { queryByText, getByText } = render(
    <TicketStub event={{ ...event, role: 'member', member_count: 1 }} onPress={() => {}} />
  );
  expect(queryByText('HOST')).toBeNull();
  getByText('person');
});
