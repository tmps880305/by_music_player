import { TextInput, View } from 'react-native';
import type { Playlist } from '../model';
import { colors, s } from '../theme';
import Button from './Button';

type Props = {
  playlist: Playlist;
  busy: boolean;
  name: string;
  onNameChange: (name: string) => void;
  onEdit: () => void;
  onPlayAll: () => void;
  onRename: () => void;
  onDelete: () => void;
};

export default function PlaylistToolbar({ playlist, busy, name, onNameChange, onEdit, onPlayAll, onRename, onDelete }: Props) {
  return (
    <>
      <View style={s.row}>
        <Button title="加入／移除歌曲" disabled={busy} onPress={onEdit} />
        <Button title="依序播放" disabled={!playlist.trackIds.length} onPress={onPlayAll} />
      </View>
      <View style={s.row}>
        <TextInput style={[s.input, { flex: 1 }]} accessibilityLabel="重新命名清單" placeholder="輸入新名稱" placeholderTextColor={colors.placeholder} value={name} maxLength={60} onChangeText={onNameChange} />
        <Button title="改名" disabled={busy || !name.trim()} onPress={onRename} />
        <Button title="刪除清單" danger disabled={busy} onPress={onDelete} />
      </View>
    </>
  );
}
