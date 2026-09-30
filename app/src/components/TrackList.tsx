import { FlatList, Pressable, Text, View } from 'react-native';
import type { Playlist, Track } from '../model';
import { s } from '../theme';
import Button from './Button';

type Props = {
  tracks: Track[];
  // Set when showing a playlist: rows get reorder/remove actions instead of delete.
  playlist?: Playlist;
  activeId: string | null;
  busy: boolean;
  emptyText: string;
  onPlay: (track: Track) => void;
  onMove: (track: Track, direction: number) => void;
  onRemove: (track: Track) => void;
  onDelete: (track: Track) => void;
};

export default function TrackList({ tracks, playlist, activeId, busy, emptyText, onPlay, onMove, onRemove, onDelete }: Props) {
  return (
    <FlatList data={tracks} keyExtractor={t => t.id} contentContainerStyle={s.list}
      ListEmptyComponent={<Text style={s.muted}>{emptyText}</Text>}
      renderItem={({ item }) => {
        const index = playlist?.trackIds.indexOf(item.id) ?? -1;
        return (
          <View style={[s.item, item.id === activeId && s.active]}>
            <Pressable accessibilityRole="button" accessibilityLabel={`播放 ${item.name}`} onPress={() => onPlay(item)}>
              <Text style={s.title}>{item.name}</Text>
              <Text style={s.muted}>{(item.size / 1024 / 1024).toFixed(1)} MB{item.id === activeId ? ' · 已選取' : ' · 點選播放'}</Text>
            </Pressable>
            <View style={s.row}>
              {playlist ? <>
                <Button title="上移" disabled={busy || index === 0} onPress={() => onMove(item, -1)} />
                <Button title="下移" disabled={busy || index === playlist.trackIds.length - 1} onPress={() => onMove(item, 1)} />
                <Button title="移出清單" disabled={busy} onPress={() => onRemove(item)} />
              </> : <Button title="刪除歌曲" danger disabled={busy} onPress={() => onDelete(item)} />}
            </View>
          </View>
        );
      }} />
  );
}
