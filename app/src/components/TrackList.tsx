import { FlatList, Pressable, Text, View } from 'react-native';
import type { Playlist, Track } from '../model';
import { colors, s } from '../theme';
import Button from './Button';
import IconButton from './IconButton';

type Props = {
  tracks: Track[];
  // Set when showing a playlist: the trash icon removes from it, and edit mode adds reorder buttons.
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
        // Trailing trash icon: deletes from the library, or removes from the playlist on a playlist page.
        return (
          <View style={[s.item, s.cardEnd, item.id === activeId && s.active]}>
            <View style={s.cardMain}>
              <Pressable style={{ flex: 1 }} accessibilityRole="button" accessibilityLabel={`播放 ${item.name}`} onPress={() => onPlay(item)}>
                <Text style={s.title}>{item.name}</Text>
                <Text style={s.muted}>{(item.size / 1024 / 1024).toFixed(1)} MB{item.id === activeId ? ' · 已選取' : ' · 點選播放'}</Text>
              </Pressable>
              <IconButton icon="trash-outline" label={playlist ? `從清單移除 ${item.name}` : `刪除 ${item.name}`} size={22} color={colors.muted} disabled={busy}
                onPress={() => playlist ? onRemove(item) : onDelete(item)} />
            </View>
            {playlist && editing && (
              <View style={s.row}>
                <Button title="上移" disabled={busy || index === 0} onPress={() => onMove(item, -1)} />
                <Button title="下移" disabled={busy || index === playlist.trackIds.length - 1} onPress={() => onMove(item, 1)} />
              </View>
            )}
          </View>
        );
      }} />
  );
}
