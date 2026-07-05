import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../../../src/components/Screen';
import { AppText } from '../../../../src/components/Text';
import { GlowButton } from '../../../../src/components/GlowButton';
import { IconLabelAction } from '../../../../src/components/IconLabelAction';
import { StateView } from '../../../../src/components/StateView';
import { EmptyState } from '../../../../src/components/EmptyState';
import { JobProgress } from '../../../../src/components/JobProgress';
import { ScanRing } from '../../../../src/components/ScanRing';
import { useAuth } from '../../../../src/auth/AuthContext';
import { useReducedMotion } from '../../../../src/lib/reduceMotion';
import { enroll, enrollStatus, enrollVideo } from '../../../../src/api/enroll';
import { enrolledStore } from '../../../../src/features/events/enrolledStore';
import { enrollPhase, enrollMessage } from '../../../../src/features/jobs';
import { ApiError } from '../../../../src/api/errors';
import { colors, space } from '../../../../src/theme';

// Cycled while the enroll job runs (no server-side increments to show) so the
// wait feels alive and honest — no fabricated percentage.
const REASSURANCE = [
  'Reading your features…',
  'Comparing against the event photos…',
  'Lining up your best angles…',
  'Almost there…',
] as const;

// Multi-angle prompts. 5 samples sits comfortably inside the backend's 3–8 range.
const ANGLES = [
  'Look straight at the camera',
  'Turn your head slightly left',
  'Turn your head slightly right',
  'Lift your chin a little',
  'One more — straight on',
] as const;

export default function Enroll() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [shots, setShots] = useState<string[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hintI, setHintI] = useState(0);
  // "Record instead" (spec 003 US1): a single ~3s selfie video, sampled server-side.
  const [captureMode, setCaptureMode] = useState<'photo' | 'video'>('photo');
  const [recording, setRecording] = useState(false);
  const reduce = useReducedMotion();

  const statusQ = useQuery({
    queryKey: ['enrollStatus', jobId],
    queryFn: () => enrollStatus(id, jobId!, token!),
    enabled: !!jobId && !!token,
    refetchInterval: (q) => (enrollPhase(q.state.data) === 'working' ? 1500 : false),
  });
  const phase = jobId ? enrollPhase(statusQ.data) : 'capture';

  // Stamp-thunk when enrollment lands.
  useEffect(() => {
    if (phase === 'done') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      enrolledStore.set(id).then(() => qc.invalidateQueries({ queryKey: ['enrolled', id] }));
    }
  }, [phase, id, qc]);

  // Cycle the reassurance copy while we wait on the CV job.
  useEffect(() => {
    if (phase !== 'working') return;
    const t = setInterval(() => setHintI((i) => (i + 1) % REASSURANCE.length), 2500);
    return () => clearInterval(t);
  }, [phase]);

  async function capture() {
    if (!cameraRef.current || busy) return;
    setBusy(true);
    try {
      const pic = await cameraRef.current.takePictureAsync({ quality: 0.6, skipProcessing: true });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const next = [...shots, pic!.uri];
      setShots(next);
      if (next.length >= ANGLES.length) await submit(next);
    } catch {
      setError('That shot didn’t take. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function submit(uris: string[]) {
    try {
      const r = await enroll(id, uris, token!);
      setJobId(r.job_id);
    } catch (e) {
      setError(e instanceof ApiError ? e.friendly : 'Couldn’t start enrollment. Please try again.');
    }
  }

  async function recordVideo() {
    if (!cameraRef.current || recording) return;
    setRecording(true);
    try {
      const video = await cameraRef.current.recordAsync({ maxDuration: 3 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (video?.uri) {
        try {
          const r = await enrollVideo(id, video.uri, token!);
          setJobId(r.job_id);
        } catch (e) {
          setError(e instanceof ApiError ? e.friendly : 'Couldn’t start enrollment. Please try again.');
        }
      }
    } catch {
      setError('That recording didn’t take. Try again.');
    } finally {
      setRecording(false);
    }
  }

  function reset() {
    setShots([]);
    setJobId(null);
    setError(null);
  }

  // --- Permission gates ---
  if (!permission) {
    return (
      <Screen>
        <StateView kind="loading" title="Preparing the camera…" />
      </Screen>
    );
  }
  if (!permission.granted) {
    return (
      <Screen>
        <EmptyState
          art="permission"
          title="Camera access needed"
          body="Lahza needs your camera to scan your face for this event. Nothing is shared — it only helps find you in the photos."
          actionLabel="Allow camera"
          onAction={requestPermission}
        />
      </Screen>
    );
  }

  // --- Tracking the CV job ---
  if (jobId && phase !== 'capture') {
    if (phase === 'done') {
      return (
        <Screen style={{ padding: space.xl, gap: space.lg, justifyContent: 'center' }}>
          <AppText variant="display" style={{ textAlign: 'center' }}>You’re in ✨</AppText>
          <AppText variant="body" color={colors.inkSoft} style={{ textAlign: 'center' }}>
            {enrollMessage(statusQ.data)}
          </AppText>
          <GlowButton label="Done" onPress={() => router.back()} />
        </Screen>
      );
    }
    if (phase === 'failed') {
      return (
        <Screen>
          <StateView
            kind="error"
            title="Let’s try that again"
            message={enrollMessage(statusQ.data)}
            actionLabel="Retake"
            onAction={reset}
          />
        </Screen>
      );
    }
    return (
      <Screen style={{ justifyContent: 'center' }}>
        <JobProgress
          title="Finding you…"
          hint={`${REASSURANCE[hintI]}\nThis usually takes a few seconds.`}
          reduceMotion={reduce}
        />
      </Screen>
    );
  }

  // --- Capture ---
  if (captureMode === 'video') {
    return (
      <Screen style={{ padding: space.xl, alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ alignItems: 'center', gap: space.xs }}>
          <AppText variant="h1">Enroll your face</AppText>
          <AppText variant="body" color={colors.inkSoft} style={{ textAlign: 'center' }}>
            Slowly turn your head left, then right
          </AppText>
        </View>

        <ScanRing total={1} captured={recording ? 1 : 0} reduceMotion={reduce}>
          <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front" mode="video" />
        </ScanRing>

        <View style={{ width: '100%', gap: space.md, alignItems: 'center' }}>
          {error ? <AppText variant="label" color={colors.danger}>{error}</AppText> : null}
          <GlowButton
            label={recording ? 'Recording… (3s)' : 'Record'}
            onPress={recordVideo}
            loading={recording}
          />
          <IconLabelAction
            icon="camera"
            label="Take photos instead"
            onPress={() => setCaptureMode('photo')}
            tone={colors.inkSoft}
          />
          <IconLabelAction icon="x" label="Cancel" onPress={() => router.back()} tone={colors.inkSoft} />
        </View>
      </Screen>
    );
  }

  const prompt = ANGLES[Math.min(shots.length, ANGLES.length - 1)];
  return (
    <Screen style={{ padding: space.xl, alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ alignItems: 'center', gap: space.xs }}>
        <AppText variant="h1">Enroll your face</AppText>
        <AppText variant="body" color={colors.inkSoft} style={{ textAlign: 'center' }}>
          {prompt}
        </AppText>
      </View>

      <ScanRing total={ANGLES.length} captured={shots.length} reduceMotion={reduce}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front" />
      </ScanRing>

      <View style={{ width: '100%', gap: space.md, alignItems: 'center' }}>
        <AppText variant="mono" color={colors.inkFaint}>
          {shots.length} / {ANGLES.length}
        </AppText>
        {error ? <AppText variant="label" color={colors.danger}>{error}</AppText> : null}
        <GlowButton label={busy ? 'Hold still…' : 'Capture'} onPress={capture} loading={busy} />
        <IconLabelAction
          icon="video"
          label="Record instead"
          onPress={() => setCaptureMode('video')}
          tone={colors.inkSoft}
        />
        <IconLabelAction icon="x" label="Cancel" onPress={() => router.back()} tone={colors.inkSoft} />
      </View>
    </Screen>
  );
}
