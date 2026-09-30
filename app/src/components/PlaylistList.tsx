import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import type { Playlist } from '../model';
import { colors, s } from '../theme';
import Button from './Button';

type Props = {
  playlists: Playlist[];
  busy: boolean;
  name: string;
  onNameChange: (name: string) => void;
  onCreate: () => void;
  onOpen: (id: string) => void;
};

export default function PlaylistList({ playlists, busy, name, onNameChange, onCreate, onOpen }: Props) {
  return (
    <>
      <View style={s.header}>
        <TextInput accessibilityLabel="新播放清單名稱" style={s.input} placeholder="新播放清單名稱" placeholderTextColor={colors.placeholder} value={name} onChangeText={onNameChange} maxLength={60} />
        <Button title="建立清單" disabled={busy || !name.trim()} onPress={onCreate} />
      </View>
      <FlatList data={playlists} keyExtractor={p => p.id} contentContainerStyle={s.list}
        ListEmptyComponent={<Text style={s.muted}>建立第一個播放清單，把喜歡的歌曲放在一起。</Text>}
        renderItem={({ item }) => (
          <Pressable style={s.item} onPress={() => onOpen(item.id)}>
            <Text style={s.title}>{item.name}</Text>
            <Text style={s.muted}>{item.trackIds.length} 首 · 點選開啟</Text>
          </Pressable>
        )} />
    </>
  );
}
