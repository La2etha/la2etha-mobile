import { useState } from 'react';
import { Alert, Pressable, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../../../src/components/Screen';
import { AppText } from '../../../../src/components/Text';
import { GlowButton } from '../../../../src/components/GlowButton';
import { IconLabelAction } from '../../../../src/components/IconLabelAction';
import { useAuth } from '../../../../src/auth/AuthContext';
import { editPhoto } from '../../../../src/api/edit';
import { saveDataUriToPhotos } from '../../../../src/lib/saveImage';
import { ApiError } from '../../../../src/api/errors';
import { colors, radius, role, space, type } from '../../../../src/theme';

export default function AiEdit() {
  const { photoId } = useLocalSearchParams<{ id: string; photoId: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!prompt.trim() || !consent) return;
    setBusy(true);
    setError(null);
    try {
      setResult(await editPhoto(photoId, token!, prompt.trim()));
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.status === 403
            ? 'AI editing only works on a photo of just you — no other people in it.'
            : e.status === 503
              ? 'AI editing isn’t switched on for this event yet.'
              : e.friendly
          : 'Something went off-script. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!result) return;
    try {
      const ok = await saveDataUriToPhotos(result);
      Alert.alert(ok ? 'Saved' : 'Permission needed', ok ? 'The edited photo is in your library.' : 'Allow photo access to save it.');
    } catch {
      Alert.alert('Couldn’t save', 'Please try again.');
    }
  }

  const input = {
    ...type.body,
    color: colors.ink,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    minHeight: 88,
    textAlignVertical: 'top' as const,
    backgroundColor: colors.card,
  } as const;

  if (result) {
    return (
      <Screen style={{ padding: space.xl, gap: space.lg }}>
        <AppText variant="display">Here you go ✨</AppText>
        <Image
          source={{ uri: result }}
          style={{ width: '100%', aspectRatio: 1, borderRadius: radius.md, backgroundColor: colors.paperSunk }}
          contentFit="contain"
        />
        <GlowButton label="Save to Photos" onPress={save} />
        <IconLabelAction icon="refresh-cw" label="Try another edit" onPress={() => setResult(null)} tone={role.actionDeep} />
      </Screen>
    );
  }

  return (
    <Screen style={{ padding: space.xl, gap: space.lg }}>
      <View style={{ alignSelf: 'flex-start' }}>
        <IconLabelAction icon="arrow-left" label="Back" onPress={() => router.back()} tone={colors.inkSoft} />
      </View>
      <AppText variant="display">AI edit</AppText>
      <AppText variant="body" color={colors.inkSoft}>
        Describe a change. This only works on a photo of just you, and your original is never touched.
      </AppText>
      <TextInput
        style={input}
        placeholder="e.g. make the background a warm sunset"
        placeholderTextColor={colors.inkSoft}
        value={prompt}
        onChangeText={setPrompt}
        multiline
      />
      <Pressable onPress={() => setConsent((c) => !c)} style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: consent ? role.actionDeep : colors.line,
            backgroundColor: consent ? role.actionDeep : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {consent ? <AppText variant="mono" color={colors.paper}>✓</AppText> : null}
        </View>
        <AppText variant="caption" color={colors.inkSoft} style={{ flex: 1 }}>
          I consent to sending this photo to the AI edit service.
        </AppText>
      </Pressable>
      {error ? <AppText variant="label" color={colors.danger}>{error}</AppText> : null}
      <GlowButton label="Generate" onPress={generate} loading={busy} disabled={!prompt.trim() || !consent} />
    </Screen>
  );
}
