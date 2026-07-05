import type { EventListItem } from '../../api/events';

export type PassMember = { uri?: string; monogram: string };

export type EventPassVM = {
  variant: 'boarding' | 'people';
  isHost: boolean;
  code: string;
  photoCount: number;
  memberCount: number;
  memberPreview: PassMember[]; // non-identifying monogram avatars for non-hosts (Principle IV, D6)
  overflowCount: number;
};

const MAX_PREVIEW = 4;

// Non-identifying placeholder monogram avatars: numbered, never a real name/photo,
// so the people pass never leaks who is actually in the event to a non-host.
function monogramPreview(memberCount: number): { preview: PassMember[]; overflow: number } {
  const shown = Math.min(memberCount, MAX_PREVIEW);
  return {
    preview: Array.from({ length: shown }, (_, i) => ({ monogram: String(i + 1) })),
    overflow: Math.max(0, memberCount - shown),
  };
}

/** Cover→boarding, no cover/cover-fail→people; non-host member preview is always
 *  the non-identifying monogram treatment (D6) regardless of variant. */
export function buildEventPassVM(
  event: EventListItem,
  opts: { coverUri?: string; coverFailed?: boolean } = {}
): EventPassVM {
  const isHost = event.role === 'host';
  const variant: EventPassVM['variant'] = opts.coverUri && !opts.coverFailed ? 'boarding' : 'people';
  const { preview, overflow } = monogramPreview(event.member_count);

  return {
    variant,
    isHost,
    code: event.join_code,
    photoCount: event.photo_count,
    memberCount: event.member_count,
    memberPreview: preview,
    overflowCount: overflow,
  };
}
