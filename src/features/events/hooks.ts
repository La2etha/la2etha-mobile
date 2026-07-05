import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveMember,
  createEvent,
  deleteEvent,
  getEvent,
  joinEvent,
  listEvents,
  listMembers,
  rejectMember,
  removeMember,
  updateEventSettings,
  uploadCover,
  type EventSettingsUpdate,
  type EventType,
} from '../../api/events';
import { normalizeJoinCode } from './validate';
import { enrolledStore } from './enrolledStore';

export function useEvents(token: string | null) {
  return useQuery({
    queryKey: ['events'],
    queryFn: () => listEvents(token!),
    enabled: !!token,
  });
}

export function useEvent(id: string, token: string | null) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => getEvent(id, token!),
    enabled: !!token && !!id,
  });
}

export function useCreateEvent(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, eventType }: { name: string; eventType?: EventType }) =>
      createEvent(name, token!, eventType),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useEnrolled(eventId: string) {
  return useQuery({
    queryKey: ['enrolled', eventId],
    queryFn: () => enrolledStore.get(eventId),
    enabled: !!eventId,
  });
}

export function useUploadCover(eventId: string, token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uri: string) => uploadCover(eventId, uri, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] });
      qc.invalidateQueries({ queryKey: ['event', eventId] });
    },
  });
}

export function useJoinEvent(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => joinEvent(normalizeJoinCode(code), token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useUpdateEventSettings(eventId: string, token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EventSettingsUpdate) => updateEventSettings(eventId, payload, token!),
    onSuccess: (event) => {
      qc.setQueryData(['event', eventId], event);
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useMembers(eventId: string, token: string | null, status?: 'pending') {
  return useQuery({
    queryKey: ['members', eventId, status ?? 'all'],
    queryFn: () => listMembers(eventId, token!, status),
    enabled: !!token && !!eventId,
  });
}

export function useRemoveMember(eventId: string, token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (accountId: string) => removeMember(eventId, accountId, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members', eventId] }),
  });
}

export function useApproveMember(eventId: string, token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (accountId: string) => approveMember(eventId, accountId, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members', eventId] }),
  });
}

export function useRejectMember(eventId: string, token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (accountId: string) => rejectMember(eventId, accountId, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members', eventId] }),
  });
}

export function useDeleteEvent(eventId: string, token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deleteEvent(eventId, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}
