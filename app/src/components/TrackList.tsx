import { FlatList, Pressable, Text, View } from 'react-native';
import type { Playlist, Track } from '../model';
import { colors, s } from '../theme';
import Button from './Button';
import IconButton from './IconButton';

type Props = {
  tracks: Track[];
  // Set when showing a playlist: rows have no actions, or reorder/remove actions while editing.
  playlist?: Playlist;
  editing?: boolean;
  activeId: string | null;
  busy: boolean;
  emptyText: string;
  // Optional button under the empty-state text.
  emptyAction?: { title: string; onPress: () => void };
  onPlay: (track: Track) => void;
  onMove: (track: Track, direction: number) => void;
  onRemove: (track: Track) => void;
  onDelete: (track: Track) => void;
};

export default function TrackList({ tracks, playlist, editing = false, activeId, busy, emptyText, emptyAction, onPlay, onMove, onRemove, onDelete }: Props) {
  return (
    <FlatList data={tracks} keyExtractor={t => t.id} contentContainerStyle={s.list}
      ListEmptyComponent={<>
        <Text style={s.muted}>{emptyText}</Text>
        {emptyAction && <View style={s.primaryAction}><Button title={emptyAction.title} filled compact disabled={busy} onPress={emptyAction.onPress} /></View>}
      </>}
      renderItem={({ item }) => {
        const index = playlist?.trackIds.indexOf(item.id) ?? -1;
        const info = (
          <Pressable style={playlist ? undefined : { flex: 1 }} accessibilityRole="button" accessibilityLabel={`播放 ${item.name}`} onPress={() => onPlay(item)}>
            <Text style={s.title}>{item.name}</Text>
            <Text style={s.muted}>{(item.size / 1024 / 1024).toFixed(1)} MB{item.id === activeId ? ' · 已選取' : ' · 點選播放'}</Text>
          </Pressable>
        );
        // Library rows put delete as a trailing trash icon, like playlist cards.
        if (!playlist) return (
          <View style={[s.item, s.cardRow, item.id === activeId && s.active]}>
            {info}
            <IconButton icon="trash-outline" label={`刪除 ${item.name}`} size={22} color={colors.muted} disabled={busy} onPress={() => onDelete(item)} />
          </View>
        );
        return (
          <View style={[s.item, item.id === activeId && s.active]}>
            {info}
            {editing && (
              <View style={s.row}>
                <Button title="上移" disabled={busy || index === 0} onPress={() => onMove(item, -1)} />
                <Button title="下移" disabled={busy || index === playlist.trackIds.length - 1} onPress={() => onMove(item, 1)} />
                <Button title="移出清單" disabled={busy} onPress={() => onRemove(item)} />
              </View>
            )}
          </View>
        );
      }} />
  );
}
