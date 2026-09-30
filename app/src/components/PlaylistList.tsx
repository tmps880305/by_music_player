import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import type { Playlist } from '../model';
import { colors, s } from '../theme';
import Button from './Button';
import IconButton from './IconButton';

type Props = {
  playlists: Playlist[];
  busy: boolean;
  name: string;
  onNameChange: (name: string) => void;
  onCreate: () => void;
  onOpen: (id: string) => void;
  onDelete: (playlist: Playlist) => void;
};

export default function PlaylistList({ playlists, busy, name, onNameChange, onCreate, onOpen, onDelete }: Props) {
  return (
    <>
      <View style={[s.header, s.inputRow]}>
        <TextInput accessibilityLabel="新播放清單名稱" style={[s.input, { flex: 1 }]} placeholder="新播放清單名稱" placeholderTextColor={colors.placeholder} value={name} onChangeText={onNameChange} maxLength={60} />
        <Button title="建立清單" filled disabled={busy || !name.trim()} onPress={onCreate} />
      </View>
      <FlatList data={playlists} keyExtractor={p => p.id} contentContainerStyle={s.list}
        ListEmptyComponent={<Text style={s.muted}>建立第一個播放清單，把喜歡的歌曲放在一起。</Text>}
        renderItem={({ item }) => (
          <View style={[s.item, s.cardRow]}>
            <Pressable style={{ flex: 1 }} onPress={() => onOpen(item.id)}>
              <Text style={s.title}>{item.name}</Text>
              <Text style={s.muted}>{item.trackIds.length} 首 · 點選開啟</Text>
            </Pressable>
            <IconButton icon="trash-outline" label={`刪除 ${item.name}`} size={22} color={colors.muted} disabled={busy} onPress={() => onDelete(item)} />
          </View>
        )} />
    </>
  );
}
