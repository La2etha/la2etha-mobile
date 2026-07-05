import { useState } from 'react';
import { View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../../../src/components/Screen';
import { AppText } from '../../../../src/components/Text';
import { GlowButton } from '../../../../src/components/GlowButton';
import { IconLabelAction } from '../../../../src/components/IconLabelAction';
import { EmptyState } from '../../../../src/components/EmptyState';
import { JobProgress } from '../../../../src/components/JobProgress';
import { useAuth } from '../../../../src/auth/AuthContext';
import { useReducedMotion } from '../../../../src/lib/reduceMotion';
import { useEvent } from '../../../../src/features/events/hooks';
import { uploadMedia, processingStatus, UploadAccepted } from '../../../../src/api/photos';
import { processingPhase } from '../../../../src/features/jobs';
import { ApiError } from '../../../../src/api/errors';
import { colors, role, space } from '../../../../src/theme';

export default function AddPhotos() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const eventQ = useEvent(id, token);
  const [result, setResult] = useState<UploadAccepted | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reduce = useReducedMotion();

  const statusQ = useQuery({
    queryKey: ['processing', jobId],
    queryFn: () => processingStatus(id, jobId!, token!),
    enabled: !!jobId && !!token,
    refetchInterval: (q) => (processingPhase(q.state.data) === 'working' ? 1500 : false),
  });

  async function pick() {
    setError(null);
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 0.7,
      videoMaxDuration: 60,
    });
    if (res.canceled || !res.assets?.length) return;
    setBusy(true);
    try {
      const r = await uploadMedia(id, res.assets.map((a) => a.uri), token!);
      setResult(r);
      if (r.job_id) setJobId(r.job_id);
      qc.invalidateQueries({ queryKey: ['events'] }); // photo_count changed
    } catch (e) {
      setError(e instanceof ApiError ? e.friendly : 'Upload didn’t go through. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function addMore() {
    setResult(null);
    setJobId(null);
  }

  // --- Result / processing view ---
  if (result) {
    const processing = jobId ? processingPhase(statusQ.data) : 'done';
    const summary =
      result.accepted > 0
        ? `Added ${result.accepted} item${result.accepted === 1 ? '' : 's'}${
            result.duplicates ? `, skipped ${result.duplicates} already in the pool` : ''
          }.`
        : result.duplicates > 0
          ? 'Those items are already in the pool.'
          : 'Nothing new to add.';
    const rejectedSummary =
      result.rejected?.length > 0
        ? `${result.rejected.length} item${result.rejected.length === 1 ? '' : 's'} couldn't be added (unsupported file or over the 60s video limit).`
        : null;

    return (
      <Screen style={{ padding: space.xl, gap: space.lg, justifyContent: 'center' }}>
        <AppText variant="body" color={colors.inkSoft} style={{ textAlign: 'center' }}>
          {summary}
        </AppText>
        {rejectedSummary ? (
          <AppText variant="label" color={colors.danger} style={{ textAlign: 'center' }}>
            {rejectedSummary}
          </AppText>
        ) : null}
        {processing === 'working' ? (
          <JobProgress
            title="Scanning for faces…"
            processed={statusQ.data?.processed}
            total={statusQ.data?.total}
            hint="You can leave this screen — it keeps going in the background."
            reduceMotion={reduce}
          />
        ) : (
          <>
            <AppText variant="display" style={{ textAlign: 'center' }}>All set 🎞️</AppText>
            <GlowButton label="Done" onPress={() => router.back()} />
          </>
        )}
        <IconLabelAction icon="plus" label="Add more" onPress={addMore} tone={role.actionDeep} />
      </Screen>
    );
  }

  // --- Host-set toggles (spec 005 US5) block adding before the picker even opens ---
  const event = eventQ.data;
  const isHost = event?.owner_id === user?.id;
  if (event?.status === 'archived') {
    return (
      <Screen>
        <EmptyState
          art="offline"
          title="This event is archived"
          body="The host closed it to new uploads. Your gallery and search still work."
          actionLabel="Back"
          onAction={() => router.back()}
        />
      </Screen>
    );
  }
  if (event?.member_uploads === 'host_only' && !isHost) {
    return (
      <Screen>
        <EmptyState
          art="permission"
          title="The host is managing photos"
          body="Only the host can add photos to this event right now."
          actionLabel="Back"
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  // --- Pick view ---
  return (
    <Screen style={{ padding: space.xl, gap: space.lg, justifyContent: 'center' }}>
      <AppText variant="display">Add photos & videos</AppText>
      <AppText variant="body" color={colors.inkSoft}>
        Pick shots or short clips (up to 60s) from your camera roll to drop into the shared pool. Everyone’s media lands in one place.
      </AppText>
      {error ? <AppText variant="label" color={colors.danger}>{error}</AppText> : null}
      <GlowButton label={busy ? 'Uploading…' : 'Choose photos or videos'} onPress={pick} loading={busy} />
      <IconLabelAction icon="x" label="Cancel" onPress={() => router.back()} tone={colors.inkSoft} />
    </Screen>
  );
}
