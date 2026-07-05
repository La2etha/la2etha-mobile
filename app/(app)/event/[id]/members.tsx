import { Alert, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../../../src/components/Screen';
import { AppText } from '../../../../src/components/Text';
import { StateView } from '../../../../src/components/StateView';
import { EmptyState } from '../../../../src/components/EmptyState';
import { IconLabelAction } from '../../../../src/components/IconLabelAction';
import { useAuth } from '../../../../src/auth/AuthContext';
import {
  useApproveMember,
  useMembers,
  useRejectMember,
  useRemoveMember,
} from '../../../../src/features/events/hooks';
import type { Member } from '../../../../src/api/events';
import { ApiError } from '../../../../src/api/errors';
import { colors, radius, space } from '../../../../src/theme';

export default function Members() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const members = useMembers(id, token);
  const pending = useMembers(id, token, 'pending');
  const remove = useRemoveMember(id, token);
  const approve = useApproveMember(id, token);
  const reject = useRejectMember(id, token);

  if (members.isLoading) {
    return (
      <Screen>
        <StateView kind="loading" title="Loading members…" />
      </Screen>
    );
  }
  if (members.isError) {
    const forbidden = members.error instanceof ApiError && members.error.status === 403;
    return (
      <Screen>
        <EmptyState
          art={forbidden ? 'permission' : 'offline'}
          title={forbidden ? 'Hosts only' : 'Couldn’t load members'}
          body={forbidden ? 'Only the event host can manage members.' : 'Please try again in a moment.'}
          actionLabel="Back"
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  function confirmRemove(member: Member) {
    Alert.alert(
      `Remove ${member.name}?`,
      'They lose access to this event and every photo in it. Their uploads stay in the pool.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => remove.mutate(member.account_id) },
      ]
    );
  }

  const active = (members.data ?? []).filter((m) => m.status === 'active');
  const waiting = pending.data ?? [];

  return (
    <Screen style={{ padding: space.xl, gap: space.md }}>
      <View style={{ alignSelf: 'flex-start' }}>
        <IconLabelAction icon="arrow-left" label="Settings" onPress={() => router.back()} tone={colors.inkSoft} />
      </View>
      <AppText variant="display">Members</AppText>

      {waiting.length > 0 ? (
        <View style={{ gap: space.sm }}>
          <AppText variant="caption" color={colors.inkFaint}>WAITING FOR APPROVAL</AppText>
          {waiting.map((m) => (
            <View
              key={m.account_id}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: space.sm,
                backgroundColor: colors.card, borderRadius: radius.md, padding: space.sm,
              }}
            >
              <AppText variant="label" style={{ flex: 1 }}>{m.name}</AppText>
              <IconLabelAction icon="check" label="Approve" onPress={() => approve.mutate(m.account_id)} />
              <IconLabelAction
                icon="x"
                label="Reject"
                onPress={() => reject.mutate(m.account_id)}
                tone={colors.danger}
              />
            </View>
          ))}
        </View>
      ) : null}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: space.xxl }} showsVerticalScrollIndicator={false}>
        <AppText variant="caption" color={colors.inkFaint} style={{ marginBottom: space.sm }}>
          {active.length} {active.length === 1 ? 'member' : 'members'}
        </AppText>
        {active.map((item) => (
          <View
            key={item.account_id}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: space.sm,
              backgroundColor: colors.card, borderRadius: radius.md, padding: space.sm,
              marginBottom: space.sm,
            }}
          >
            <View style={{ flex: 1 }}>
              <AppText variant="label" numberOfLines={1}>
                {item.name || 'Member'}{item.role === 'host' ? ' · Host' : ''}
              </AppText>
              <AppText variant="caption" color={colors.inkFaint} numberOfLines={1}>
                {item.enrolled ? 'Enrolled' : 'Not enrolled'} · in {item.appearance_count}{' '}
                {item.appearance_count === 1 ? 'photo' : 'photos'}
              </AppText>
            </View>
            {item.role !== 'host' ? (
              <IconLabelAction
                icon="user-x"
                label="Remove"
                onPress={() => confirmRemove(item)}
                tone={colors.danger}
              />
            ) : null}
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}
