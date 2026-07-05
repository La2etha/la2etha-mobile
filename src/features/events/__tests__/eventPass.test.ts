import { buildEventPassVM } from '../eventPass';
import type { EventListItem } from '../../../api/events';

const base: EventListItem = {
  id: '1',
  name: 'Wedding',
  owner_id: 'u1',
  join_code: 'ABC123',
  status: 'active',
  privacy_default_remove_strangers: true,
  has_cover: false,
  created_at: '2026-01-01',
  role: 'member',
  member_count: 6,
  photo_count: 12,
  name_policy: 'nobody',
  event_type: 'wedding',
  gallery_visibility: 'own_only',
  ai_edit_scope: 'solo_only',
  member_uploads: 'enabled',
  member_delete_own: true,
  join_approval: false,
  member_list_visible: false,
};

test('cover present and loaded → boarding variant', () => {
  const vm = buildEventPassVM(base, { coverUri: 'https://x/cover.jpg' });
  expect(vm.variant).toBe('boarding');
});

test('no cover → people variant', () => {
  const vm = buildEventPassVM(base);
  expect(vm.variant).toBe('people');
});

test('cover load failure → falls back to people variant', () => {
  const vm = buildEventPassVM(base, { coverUri: 'https://x/cover.jpg', coverFailed: true });
  expect(vm.variant).toBe('people');
});

test('member preview is monogram-only, never identifying, capped with overflow', () => {
  const vm = buildEventPassVM(base);
  expect(vm.memberPreview).toHaveLength(4);
  expect(vm.memberPreview.every((m) => !m.uri)).toBe(true);
  expect(vm.overflowCount).toBe(2);
});

test('host role is reflected on the VM', () => {
  const vm = buildEventPassVM({ ...base, role: 'host' });
  expect(vm.isHost).toBe(true);
});
