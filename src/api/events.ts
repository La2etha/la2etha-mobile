import { apiFetch } from './client';
import { API_BASE_URL } from './config';
import { imagePart } from './uploads';

export type EventRole = 'host' | 'member';
export type NamePolicy = 'nobody' | 'host_only' | 'everyone';
export type EventType = 'wedding' | 'graduation' | 'iftar' | 'birthday' | 'trip' | 'other';
export type GalleryVisibility = 'own_only' | 'everyone_sees_all';
export type AiEditScope = 'solo_only' | 'any_photo';
export type MemberUploads = 'enabled' | 'host_only';

/** Settings shared by every event shape (spec 005 US5 host toggles). */
type EventSettings = {
  name_policy: NamePolicy;
  event_type: EventType | null;
  gallery_visibility: GalleryVisibility;
  ai_edit_scope: AiEditScope;
  member_uploads: MemberUploads;
  member_delete_own: boolean;
  join_approval: boolean;
  member_list_visible: boolean;
};

/** An event as it appears in the home list (GET /events). */
export type EventListItem = EventSettings & {
  id: string;
  name: string;
  owner_id: string;
  join_code: string;
  status: string;
  privacy_default_remove_strangers: boolean;
  has_cover: boolean;
  created_at: string;
  role: EventRole;
  member_count: number;
  photo_count: number;
};

/** A single event (GET /events/{id}). No role/counts — that's the list shape. */
export type EventDetail = EventSettings & {
  id: string;
  name: string;
  owner_id: string;
  join_code: string;
  status: string;
  privacy_default_remove_strangers: boolean;
  has_cover: boolean;
  created_at: string;
};

/** Source URL for an event's cover image — access-guarded, attach the bearer
 *  token via expo-image's `source.headers` (same pattern as `photoUri`). */
export function coverUri(eventId: string): string {
  return `${API_BASE_URL}/events/${eventId}/cover`;
}

export function uploadCover(eventId: string, uri: string, token: string): Promise<EventDetail> {
  const form = new FormData();
  form.append('file', imagePart(uri, 'cover.jpg'));
  return apiFetch<EventDetail>(`/events/${eventId}/cover`, { method: 'PUT', multipart: form, token });
}

/** POST /events also returns a ready-to-share join link. */
export type EventCreated = EventDetail & { join_link: string };

export function listEvents(token: string): Promise<EventListItem[]> {
  return apiFetch<EventListItem[]>('/events', { token });
}

export function getEvent(id: string, token: string): Promise<EventDetail> {
  return apiFetch<EventDetail>(`/events/${id}`, { token });
}

export function createEvent(
  name: string,
  token: string,
  event_type?: EventType
): Promise<EventCreated> {
  return apiFetch<EventCreated>('/events', {
    method: 'POST',
    jsonBody: { name, event_type },
    token,
  });
}

/** join_approval (spec 005 US5): a join either lands active (event present) or
 *  pending (event null — the caller waits for the host). */
export type EventJoined = { status: 'active' | 'pending'; event: EventDetail | null };

export function joinEvent(joinCode: string, token: string): Promise<EventJoined> {
  return apiFetch<EventJoined>('/events/join', {
    method: 'POST',
    jsonBody: { join_code: joinCode },
    token,
  });
}

export type EventSettingsUpdate = Partial<EventSettings> & {
  privacy_default_remove_strangers?: boolean;
  uploads_closed?: boolean;
};

export function updateEventSettings(
  eventId: string,
  payload: EventSettingsUpdate,
  token: string
): Promise<EventDetail> {
  return apiFetch<EventDetail>(`/events/${eventId}/settings`, {
    method: 'PATCH',
    jsonBody: payload,
    token,
  });
}

export type Member = {
  account_id: string;
  name: string;
  role: EventRole;
  status: 'active' | 'pending';
  enrolled: boolean;
  appearance_count: number;
  joined_at: string;
};

export function listMembers(
  eventId: string,
  token: string,
  status?: 'pending'
): Promise<Member[]> {
  const q = status ? `?status=${status}` : '';
  return apiFetch<Member[]>(`/events/${eventId}/members${q}`, { token });
}

export function removeMember(eventId: string, accountId: string, token: string): Promise<void> {
  return apiFetch<void>(`/events/${eventId}/members/${accountId}`, { method: 'DELETE', token });
}

export function approveMember(eventId: string, accountId: string, token: string): Promise<void> {
  return apiFetch<void>(`/events/${eventId}/members/${accountId}/approve`, {
    method: 'POST',
    token,
  });
}

export function rejectMember(eventId: string, accountId: string, token: string): Promise<void> {
  return apiFetch<void>(`/events/${eventId}/members/${accountId}/reject`, {
    method: 'POST',
    token,
  });
}

/** Host-only, irreversible: deletes the event and every photo/face/gallery in
 *  it (backend cascade — see app/api/events.py delete_event). */
export function deleteEvent(eventId: string, token: string): Promise<void> {
  return apiFetch<void>(`/events/${eventId}`, { method: 'DELETE', token });
}
