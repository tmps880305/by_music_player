import type { ReactElement } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import ReorderableList from 'react-native-reorderable-list';
import type { Playlist } from '../model';
import { colors, s } from '../theme';
import { useLongPressDrag } from '../useLongPressDrag';
import Button from './Button';
import IconButton from './IconButton';

type Props = {
  playlists: Playlist[];
  busy: boolean;
  name: string;
  onNameChange: (name: string) => void;
  onCreate: () => void;
  onOpen: (id: string) => void;
  onRename: (playlist: Playlist) => void;
  onDelete: (playlist: Playlist) => void;
  onReorder: (from: number, to: number) => void;
};

type CardProps = { playlist: Playlist; busy: boolean; onOpen: () => void; onRename: () => void; onDelete: () => void };

// Long-press a card to drag it to a new position.
function PlaylistCard({ playlist, busy, onOpen, onRename, onDelete }: CardProps) {
  const drag = useLongPressDrag(!busy);
  return (
    <View ref={drag.ref} style={[s.item, s.cardRow]}>
      <Pressable style={{ flex: 1 }} accessibilityRole="button" accessibilityLabel={`開啟 ${playlist.name}`} accessibilityHint="長按後拖曳可調整順序"
        onPress={onOpen} onLongPress={drag.onLongPress}>
        <Text style={s.title}>{playlist.name}</Text>
        <Text style={s.muted}>{playlist.trackIds.length} 首 · 點選開啟</Text>
      </Pressable>
      <IconButton icon="pencil-outline" label={`重新命名 ${playlist.name}`} size={22} color={colors.muted} disabled={busy} onPress={onRename} />
      <IconButton icon="trash-outline" label={`刪除 ${playlist.name}`} size={22} color={colors.muted} disabled={busy} onPress={onDelete} />
    </View>
  );
}

export default function PlaylistList({ playlists, busy, name, onNameChange, onCreate, onOpen, onRename, onDelete, onReorder }: Props) {
  return (
    <>
      <View style={[s.header, s.inputRow]}>
        <TextInput accessibilityLabel="新播放清單名稱" style={[s.input, { flex: 1 }]} placeholder="新播放清單名稱" placeholderTextColor={colors.placeholder} value={name} onChangeText={onNameChange} maxLength={60} />
        <Button title="建立清單" filled disabled={busy || !name.trim()} onPress={onCreate} />
      </View>
      <ReorderableList data={playlists} keyExtractor={p => p.id} contentContainerStyle={s.list}
        ListEmptyComponent={<View><Text style={s.muted}>建立第一個播放清單，把喜歡的歌曲放在一起。</Text></View>}
        onReorder={({ from, to }) => onReorder(from, to)}
        renderItem={({ item }): ReactElement => (
          <PlaylistCard playlist={item} busy={busy} onOpen={() => onOpen(item.id)} onRename={() => onRename(item)} onDelete={() => onDelete(item)} />
        )} />
    </>
  );
}
