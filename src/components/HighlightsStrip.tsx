import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { AppText } from './Text';
import { PhotoCard } from './PhotoCard';
import type { Highlight } from '../api/events';
import { colors, space } from '../theme';

const STRIP_CELL = 96;

/** Event Highlights strip (spec 004 US2): the event's standout shots, already
 *  filtered server-side to what the caller may open (R5). Renders nothing
 *  while loading or when the strip is empty — no placeholder skeleton for a
 *  feature that may legitimately have nothing to show yet ("still developing"
 *  is just "not here yet", not an error). */
export function HighlightsStrip({
  highlights,
  token,
  onOpen,
}: {
  highlights: Highlight[] | undefined;
  token: string;
  onOpen: (photoId: string) => void;
}) {
  if (!highlights || highlights.length === 0) return null;

  return (
    // No horizontal padding here — this sits inside a parent that already
    // applies it, so the strip's edges line up with the grid below.
    <View style={{ paddingBottom: space.lg }}>
      <AppText variant="label" color={colors.inkSoft} style={{ paddingBottom: space.sm }}>
        Highlights
      </AppText>
      <FlashList
        data={highlights}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.photo_id}
        renderItem={({ item }) => (
          <PhotoCard photoId={item.photo_id} token={token} size={STRIP_CELL} onPress={() => onOpen(item.photo_id)} />
        )}
      />
    </View>
  );
}
