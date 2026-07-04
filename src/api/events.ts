import { apiFetch } from './client';

export type EventRole = 'host' | 'member';

/** An event as it appears in the home list (GET /events). */
export type EventListItem = {
  id: string;
  name: string;
  owner_id: string;
  join_code: string;
  status: string;
  privacy_default_remove_strangers: boolean;
  created_at: string;
  role: EventRole;
  member_count: number;
  photo_count: number;
};

/** A single event (GET /events/{id}). No role/counts — that's the list shape. */
export type EventDetail = {
  id: string;
  name: string;
  owner_id: string;
  join_code: string;
  status: string;
  privacy_default_remove_strangers: boolean;
  created_at: string;
};

/** POST /events also returns a ready-to-share join link. */
export type EventCreated = EventDetail & { join_link: string };

export function listEvents(token: string): Promise<EventListItem[]> {
  return apiFetch<EventListItem[]>('/events', { token });
}

export function getEvent(id: string, token: string): Promise<EventDetail> {
  return apiFetch<EventDetail>(`/events/${id}`, { token });
}

export function createEvent(name: string, token: string): Promise<EventCreated> {
  return apiFetch<EventCreated>('/events', { method: 'POST', jsonBody: { name }, token });
}

export function joinEvent(joinCode: string, token: string): Promise<EventDetail> {
  return apiFetch<EventDetail>('/events/join', {
    method: 'POST',
    jsonBody: { join_code: joinCode },
    token,
  });
}
