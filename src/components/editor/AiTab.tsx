import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { AppText } from '../Text';
import { GlowButton } from '../GlowButton';
import { editPhoto } from '../../api/edit';
import { ApiError } from '../../api/errors';
import { colors, radius, role, space, type } from '../../theme';

/** The former standalone AI-edit screen (edit.tsx), folded into the editor's
 *  AI tab (FR-011): same prompt/consent/403/503 states, but the result is
 *  handed back as a step instead of a separate confirmation screen — it
 *  becomes the new `aiBaseImage` on top of the shared edit history (R6). */
export function AiTab({
  photoId,
  token,
  onResult,
}: {
  photoId: string;
  token: string;
  onResult: (dataUri: string) => void;
}) {
  const [prompt, setPrompt] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!prompt.trim() || !consent) return;
    setBusy(true);
    setError(null);
    try {
      const result = await editPhoto(photoId, token, prompt.trim());
      onResult(result);
      setPrompt('');
      setConsent(false);
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

  return (
    <View style={{ padding: space.xl, gap: space.lg }}>
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
      <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
        <View
          onTouchEnd={() => setConsent((c) => !c)}
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
      </View>
      {error ? <AppText variant="label" color={colors.danger}>{error}</AppText> : null}
      <GlowButton label="Generate" onPress={generate} loading={busy} disabled={!prompt.trim() || !consent} />
    </View>
  );
}
