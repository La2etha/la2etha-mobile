import { useState } from 'react';
import { Pressable, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../../../src/components/Screen';
import { AppText } from '../../../../src/components/Text';
import { GlowButton } from '../../../../src/components/GlowButton';
import { JobProgress } from '../../../../src/components/JobProgress';
import { useAuth } from '../../../../src/auth/AuthContext';
import { useReducedMotion } from '../../../../src/lib/reduceMotion';
import { uploadPhotos, processingStatus, UploadAccepted } from '../../../../src/api/photos';
import { processingPhase } from '../../../../src/features/jobs';
import { ApiError } from '../../../../src/api/errors';
import { colors, space } from '../../../../src/theme';

export default function AddPhotos() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
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
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (res.canceled || !res.assets?.length) return;
    setBusy(true);
    try {
      const r = await uploadPhotos(id, res.assets.map((a) => a.uri), token!);
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
        ? `Added ${result.accepted} photo${result.accepted === 1 ? '' : 's'}${
            result.duplicates ? `, skipped ${result.duplicates} already in the pool` : ''
          }.`
        : result.duplicates > 0
          ? 'Those photos are already in the pool.'
          : 'Nothing new to add.';

    return (
      <Screen style={{ padding: space.xl, gap: space.lg, justifyContent: 'center' }}>
        <AppText variant="body" color={colors.inkSoft} style={{ textAlign: 'center' }}>
          {summary}
        </AppText>
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
        <Pressable onPress={addMore} style={{ alignItems: 'center', paddingVertical: space.sm }}>
          <AppText variant="label" color={colors.stamp}>Add more</AppText>
        </Pressable>
      </Screen>
    );
  }

  // --- Pick view ---
  return (
    <Screen style={{ padding: space.xl, gap: space.lg, justifyContent: 'center' }}>
      <AppText variant="display">Add photos</AppText>
      <AppText variant="body" color={colors.inkSoft}>
        Pick shots from your camera roll to drop into the shared pool. Everyone’s photos land in one place.
      </AppText>
      {error ? <AppText variant="label" color={colors.danger}>{error}</AppText> : null}
      <GlowButton label={busy ? 'Uploading…' : 'Choose photos'} onPress={pick} loading={busy} />
      <Pressable onPress={() => router.back()} style={{ alignItems: 'center', paddingVertical: space.sm }}>
        <AppText variant="label" color={colors.inkSoft}>Cancel</AppText>
      </Pressable>
    </Screen>
  );
}
