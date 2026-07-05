import { useState } from 'react';
import { Alert, ScrollView, Switch, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../../../src/components/Screen';
import { AppText } from '../../../../src/components/Text';
import { StateView } from '../../../../src/components/StateView';
import { EmptyState } from '../../../../src/components/EmptyState';
import { IconLabelAction } from '../../../../src/components/IconLabelAction';
import { ActionSheet } from '../../../../src/components/ActionSheet';
import { useAuth } from '../../../../src/auth/AuthContext';
import { useDeleteEvent, useEvent, useUpdateEventSettings } from '../../../../src/features/events/hooks';
import { type EventSettingsUpdate } from '../../../../src/api/events';
import { ApiError } from '../../../../src/api/errors';
import { colors, radius, role, space } from '../../../../src/theme';

const NAME_POLICY_OPTIONS = [
  { value: 'nobody', label: 'Nobody' },
  { value: 'host_only', label: 'Only me (host)' },
  { value: 'everyone', label: 'Everyone in the event' },
] as const;

const GALLERY_VIS_OPTIONS = [
  { value: 'own_only', label: 'Only their own photos' },
  { value: 'everyone_sees_all', label: 'The whole pool' },
] as const;

const AI_EDIT_OPTIONS = [
  { value: 'solo_only', label: 'Only solo photos' },
  { value: 'any_photo', label: 'Any photo' },
] as const;

const MEMBER_UPLOADS_OPTIONS = [
  { value: 'enabled', label: 'Everyone can add photos' },
  { value: 'host_only', label: 'Only me (host)' },
] as const;

const EVENT_TYPE_OPTIONS = [
  { value: null, label: 'Not set' },
  { value: 'wedding', label: '💍 Wedding' },
  { value: 'graduation', label: '🎓 Graduation' },
  { value: 'iftar', label: '🌙 Iftar' },
  { value: 'birthday', label: '🎂 Birthday' },
  { value: 'trip', label: '🧳 Trip' },
  { value: 'other', label: 'Other' },
] as const;

export default function EventSettings() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const eventQ = useEvent(id, token);
  const update = useUpdateEventSettings(id, token);
  const del = useDeleteEvent(id, token);

  if (eventQ.isLoading) {
    return (
      <Screen>
        <StateView kind="loading" title="Loading settings…" />
      </Screen>
    );
  }
  if (eventQ.isError || !eventQ.data) {
    const forbidden = eventQ.error instanceof ApiError && eventQ.error.status === 403;
    return (
      <Screen>
        <EmptyState
          art={forbidden ? 'permission' : 'offline'}
          title={forbidden ? 'Hosts only' : 'Couldn’t load settings'}
          body={forbidden ? 'Only the event host can change these.' : 'Please try again in a moment.'}
          actionLabel="Back"
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  const event = eventQ.data;
  const patch = (payload: EventSettingsUpdate) => update.mutate(payload);

  function confirmDeleteEvent() {
    Alert.alert(
      `Delete "${event.name}"?`,
      'This permanently deletes the event, every photo in it, and everyone’s galleries. There’s no undo.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete event',
          style: 'destructive',
          onPress: async () => {
            try {
              await del.mutateAsync();
              router.replace('/(app)' as never);
            } catch (e) {
              Alert.alert(
                'Couldn’t delete',
                e instanceof ApiError ? e.friendly : 'Please try again in a moment.'
              );
            }
          },
        },
      ]
    );
  }

  return (
    <Screen style={{ padding: space.xl }}>
      <View style={{ alignSelf: 'flex-start', marginBottom: space.sm }}>
        <IconLabelAction icon="arrow-left" label="Event" onPress={() => router.back()} tone={colors.inkSoft} />
      </View>
      <AppText variant="display" style={{ marginBottom: space.md }}>Event settings</AppText>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: space.sm, paddingBottom: space.xxl }} showsVerticalScrollIndicator={false}>
        <IconLabelAction
          icon="users"
          label="Manage members"
          onPress={() => router.push(`/(app)/event/${id}/members` as never)}
          variant="card"
          tone={role.actionDeep}
        />

        <SectionLabel text="Who can see" />
        <PickerRow
          icon="tag"
          label="Names on faces"
          options={NAME_POLICY_OPTIONS}
          value={event.name_policy}
          onSelect={(v) => patch({ name_policy: v })}
        />
        <PickerRow
          icon="image"
          label="Gallery shows"
          options={GALLERY_VIS_OPTIONS}
          value={event.gallery_visibility}
          onSelect={(v) => patch({ gallery_visibility: v })}
        />
        <SwitchRow
          icon="users"
          label="Member list visible to everyone"
          value={event.member_list_visible}
          onChange={(v) => patch({ member_list_visible: v })}
        />

        <SectionLabel text="What members can do" />
        <PickerRow
          icon="upload"
          label="Add photos"
          options={MEMBER_UPLOADS_OPTIONS}
          value={event.member_uploads}
          onSelect={(v) => patch({ member_uploads: v })}
        />
        <SwitchRow
          icon="trash-2"
          label="Delete their own uploads"
          value={event.member_delete_own}
          onChange={(v) => patch({ member_delete_own: v })}
        />
        <PickerRow
          icon="edit-3"
          label="AI edit works on"
          options={AI_EDIT_OPTIONS}
          value={event.ai_edit_scope}
          onSelect={(v) => patch({ ai_edit_scope: v })}
        />

        <SectionLabel text="Event" />
        <PickerRow
          icon="tag"
          label="Type"
          options={EVENT_TYPE_OPTIONS}
          value={event.event_type}
          onSelect={(v) => patch({ event_type: v ?? undefined })}
        />
        <SwitchRow
          icon="user-check"
          label="Approve joins before letting people in"
          value={event.join_approval}
          onChange={(v) => patch({ join_approval: v })}
        />
        <SwitchRow
          icon="archive"
          label="Archive (close uploads & enrollment)"
          value={event.status === 'archived'}
          onChange={(v) => patch({ uploads_closed: v })}
        />

        <SectionLabel text="Danger zone" />
        <View style={{ backgroundColor: colors.card, borderRadius: radius.md }}>
          <IconLabelAction
            icon="trash-2"
            label={del.isPending ? 'Deleting…' : 'Delete event'}
            onPress={confirmDeleteEvent}
            tone={colors.danger}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <AppText variant="caption" color={colors.inkFaint} style={{ marginTop: space.md }}>
      {text.toUpperCase()}
    </AppText>
  );
}

/** A row that opens a bottom-sheet dropdown of every option (reuses the same
 *  ActionSheet the lightbox's "⋯" menu uses) instead of blind-cycling on tap. */
function PickerRow<T extends string | null>({
  icon,
  label,
  options,
  value,
  onSelect,
}: {
  icon: keyof typeof import('@expo/vector-icons').Feather.glyphMap;
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onSelect: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value)?.label ?? String(value);

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: radius.md }}>
      <IconLabelAction
        icon={icon}
        label={label}
        onPress={() => setOpen(true)}
        trailing={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
            <AppText variant="label" color={colors.inkFaint}>{current}</AppText>
            <AppText variant="label" color={colors.inkFaint}>⌄</AppText>
          </View>
        }
      />
      <ActionSheet
        visible={open}
        onClose={() => setOpen(false)}
        items={options.map((o) => ({
          icon: o.value === value ? 'check' : 'circle',
          label: o.label,
          onPress: () => onSelect(o.value),
        }))}
      />
    </View>
  );
}

function SwitchRow({
  icon,
  label,
  value,
  onChange,
}: {
  icon: keyof typeof import('@expo/vector-icons').Feather.glyphMap;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: radius.md }}>
      <IconLabelAction
        icon={icon}
        label={label}
        onPress={() => onChange(!value)}
        trailing={
          <Switch
            value={value}
            onValueChange={onChange}
            trackColor={{ false: colors.line, true: role.action }}
            thumbColor={colors.paper}
          />
        }
      />
    </View>
  );
}
