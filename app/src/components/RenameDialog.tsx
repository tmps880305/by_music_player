import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Text, TextInput, View } from 'react-native';
import type { Playlist } from '../model';
import { colors, s } from '../theme';
import Button from './Button';

// Rename prompt for a playlist. Alert.prompt is iOS-only, so this small modal works the same on iOS, Android and web.
type Props = { playlist: Playlist | null; busy: boolean; error: string; onCancel: () => void; onSave: (name: string) => void };

export default function RenameDialog({ playlist, busy, error, onCancel, onSave }: Props) {
  const [value, setValue] = useState('');
  useEffect(() => { if (playlist) setValue(playlist.name); }, [playlist?.id]);
  const name = value.trim();
  const canSave = !busy && !!name && name !== playlist?.name;
  const save = () => { if (canSave) onSave(name); };
  return (
    <Modal visible={!!playlist} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView style={s.dialogBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.dialog}>
          <Text style={s.title}>重新命名清單</Text>
          <TextInput accessibilityLabel="清單名稱" style={s.input} value={value} onChangeText={setValue} maxLength={60}
            placeholder="清單名稱" placeholderTextColor={colors.placeholder} autoFocus selectTextOnFocus returnKeyType="done" onSubmitEditing={save} />
          {!!error && <Text style={s.error}>{error}</Text>}
          <View style={s.dialogActions}>
            <Button title="取消" onPress={onCancel} />
            <Button title="儲存" filled compact disabled={!canSave} onPress={save} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
