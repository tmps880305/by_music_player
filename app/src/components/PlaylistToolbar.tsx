import { TextInput, View } from 'react-native';
import { colors, s } from '../theme';
import Button from './Button';

// Editing tools shown under "編輯" on a playlist page.
type Props = {
  busy: boolean;
  name: string;
  onNameChange: (name: string) => void;
  onPick: () => void;
  onRename: () => void;
};

export default function PlaylistToolbar({ busy, name, onNameChange, onPick, onRename }: Props) {
  return (
    <>
      <View style={s.row}>
        <Button title="加入／移除歌曲" disabled={busy} onPress={onPick} />
      </View>
      <View style={s.row}>
        <TextInput style={[s.input, { flex: 1 }]} accessibilityLabel="重新命名清單" placeholder="輸入新名稱" placeholderTextColor={colors.placeholder} value={name} maxLength={60} onChangeText={onNameChange} />
        <Button title="改名" disabled={busy || !name.trim()} onPress={onRename} />
      </View>
    </>
  );
}
