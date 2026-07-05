import { useState } from 'react';
import { Alert, Share, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../../../../src/components/Screen';
import { AppText } from '../../../../../src/components/Text';
import { IconLabelAction } from '../../../../../src/components/IconLabelAction';
import { SecondaryButton } from '../../../../../src/components/SecondaryButton';
import { StateView } from '../../../../../src/components/StateView';
import { EmptyState } from '../../../../../src/components/EmptyState';
import { useAuth } from '../../../../../src/auth/AuthContext';
import { useClearCoverPhoto, useEvent, useUploadCover } from '../../../../../src/features/events/hooks';
import { ApiError } from '../../../../../src/api/errors';
import { colors, space } from '../../../../../src/theme';

/** "You" tab (T020): the re-enroll entry point once inside the tabbed shell,
 *  plus host-only actions that used to live on the pre-enroll launcher. */
export default function You() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, user } = useAuth();
  const router = useRouter();
  const { data: event, isLoading, isError, error, refetch } = useEvent(id, token);
  const uploadCover = useUploadCover(id, token);
  const clearCoverPhoto = useClearCoverPhoto(id, token);
  const [coverBusy, setCoverBusy] = useState(false);

  async function pickCover() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (res.canceled || !res.assets?.length) return;
    setCoverBusy(true);
    try {
      await uploadCover.mutateAsync(res.assets[0].uri);
    } catch (e) {
      Alert.alert('Couldn’t set cover', e instanceof ApiError ? e.friendly : 'Please try again.');
    } finally {
      setCoverBusy(false);
    }
  }

  if (isLoading) {
    return (
      <Screen>
        <StateView kind="loading" title="One moment…" />
      </Screen>
    );
  }
  if (isError || !event) {
    return (
      <Screen>
        <EmptyState
          art="offline"
          title="Couldn’t load this"
          body={error instanceof ApiError ? error.friendly : 'Please try again in a moment.'}
          actionLabel="Try again"
          onAction={() => refetch()}
        />
      </Screen>
    );
  }

  const isHost = event.owner_id === user?.id;

  return (
    <Screen style={{ padding: space.xl, gap: space.md }}>
      <AppText variant="display">{event.name}</AppText>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.xs, marginBottom: space.md }}>
        <AppText variant="caption" color={colors.inkFaint}>CODE</AppText>
        <AppText variant="mono" color={colors.inkSoft}>{event.join_code}</AppText>
        {isHost ? <AppText variant="caption" color={colors.inkFaint}>· you host this</AppText> : null}
      </View>

      <IconLabelAction
        icon="aperture"
        label="Re-scan your face"
        variant="card"
        onPress={() => router.push(`/(app)/event/${event.id}/enroll` as never)}
      />

      {isHost ? (
        <>
          <IconLabelAction
            icon="image"
            label={coverBusy ? 'Uploading…' : event.has_cover ? 'Change cover photo' : 'Set a cover photo'}
            variant="card"
            onPress={pickCover}
          />
          {event.cover_source === 'host' ? (
            <IconLabelAction
              icon="refresh-cw"
              label={clearCoverPhoto.isPending ? 'Reverting…' : 'Use auto-picked cover'}
              variant="card"
              onPress={() => !clearCoverPhoto.isPending && clearCoverPhoto.mutate()}
            />
          ) : null}
          <IconLabelAction
            icon="check-circle"
            label="Host review"
            variant="card"
            onPress={() => router.push(`/(app)/event/${event.id}/review` as never)}
          />
          <IconLabelAction
            icon="bar-chart-2"
            label="Event stats"
            variant="card"
            onPress={() => router.push(`/(app)/event/${event.id}/stats` as never)}
          />
          <IconLabelAction
            icon="sliders"
            label="Members & settings"
            variant="card"
            onPress={() => router.push(`/(app)/event/${event.id}/settings` as never)}
          />
          <SecondaryButton
            label="Share invite"
            icon="share-2"
            onPress={() => Share.share({ message: `Join my لمّة on Lahza — code ${event.join_code}` })}
          />
        </>
      ) : null}
    </Screen>
  );
}
