import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createEvent, getEvent, joinEvent, listEvents } from '../../api/events';
import { normalizeJoinCode } from './validate';

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
    mutationFn: (name: string) => createEvent(name, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useJoinEvent(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => joinEvent(normalizeJoinCode(code), token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}
