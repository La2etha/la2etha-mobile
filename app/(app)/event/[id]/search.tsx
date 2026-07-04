import { useState } from 'react';
import { Pressable, TextInput, View, useWindowDimensions } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../../../src/components/Screen';
import { AppText } from '../../../../src/components/Text';
import { StateView } from '../../../../src/components/StateView';
import { PhotoCard } from '../../../../src/components/PhotoCard';
import { useAuth } from '../../../../src/auth/AuthContext';
import { useReducedMotion } from '../../../../src/lib/reduceMotion';
import { useSearch } from '../../../../src/features/gallery/hooks';
import { ApiError } from '../../../../src/api/errors';
import { colors, radius, space, type } from '../../../../src/theme';

// Warm NL examples (mixed EN/AR) to teach what search understands.
const EXAMPLES = ['near the cake', 'dancing', 'group photo', 'جمب الورد'] as const;

export default function Search() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const reduce = useReducedMotion();
  const { width } = useWindowDimensions();
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const { data, isLoading, isError, error } = useSearch(id, token, query);

  const cell = Math.floor((width - space.xl * 2) / 3);
  const openPhoto = (photoId: string, rect?: { x: number; y: number; w: number; h: number }) => {
    const q = rect
      ? `?ox=${Math.round(rect.x)}&oy=${Math.round(rect.y)}&ow=${Math.round(rect.w)}&oh=${Math.round(rect.h)}`
      : '';
    router.push(`/(app)/event/${id}/photo/${photoId}${q}` as never);
  };

  const input = {
    ...type.body,
    flex: 1,
    color: colors.ink,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    backgroundColor: colors.card,
  } as const;

  function run(q: string) {
    setText(q);
    setQuery(q.trim());
  }

  function body() {
    if (!query) {
      return (
        <View style={{ padding: space.xl, gap: space.md }}>
          <AppText variant="body" color={colors.inkSoft}>
            Search your photos in plain words — where you were, what was happening.
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {EXAMPLES.map((ex) => (
              <Pressable
                key={ex}
                onPress={() => run(ex)}
                style={{
                  borderColor: colors.line,
                  borderWidth: 1,
                  borderRadius: radius.pill,
                  paddingHorizontal: space.md,
                  paddingVertical: space.sm,
                  backgroundColor: colors.card,
                }}
              >
                <AppText variant="label" color={colors.inkSoft}>{ex}</AppText>
              </Pressable>
            ))}
          </View>
        </View>
      );
    }
    if (isLoading) return <StateView kind="loading" title="Searching…" />;
    if (isError) {
      const off = error instanceof ApiError && error.status === 503;
      return (
        <StateView
          kind={off ? 'empty' : 'error'}
          title={off ? 'Search isn’t on yet' : 'Search didn’t work'}
          message={
            off
              ? 'Natural-language search isn’t switched on for this event yet. Your gallery still works.'
              : error instanceof ApiError
                ? error.friendly
                : 'Please try again in a moment.'
          }
        />
      );
    }
    const items = data?.items ?? [];
    if (items.length === 0) {
      return (
        <StateView
          kind="empty"
          title="Nothing matched"
          message={`No photos matched “${query}”. Try different words.`}
        />
      );
    }
    return (
      <FlashList
        data={items}
        keyExtractor={(i) => i.photo_id}
        numColumns={3}
        contentContainerStyle={{ paddingHorizontal: space.xl, paddingBottom: space.xxl }}
        renderItem={({ item }) => (
          <PhotoCard
            photoId={item.photo_id}
            token={token!}
            size={cell}
            reduceMotion={reduce}
            onPress={(rect) => openPhoto(item.photo_id, rect)}
          />
        )}
      />
    );
  }

  return (
    <Screen style={{ paddingTop: space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.xl }}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <AppText variant="label" color={colors.inkSoft}>←</AppText>
        </Pressable>
        <TextInput
          style={input}
          placeholder="Search your photos…"
          placeholderTextColor={colors.inkSoft}
          value={text}
          onChangeText={setText}
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={() => setQuery(text.trim())}
        />
      </View>
      <View style={{ flex: 1 }}>{body()}</View>
    </Screen>
  );
}
