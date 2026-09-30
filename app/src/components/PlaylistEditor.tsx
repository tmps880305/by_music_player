import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Track } from '../model';
import { s } from '../theme';
import Button from './Button';

type Props = {
  visible: boolean;
  tracks: Track[];
  selectedIds: string[];
  busy: boolean;
  error: string;
  onToggle: (track: Track) => void;
  onClose: () => void;
};

export default function PlaylistEditor({ visible, tracks, selectedIds, busy, error, onToggle, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.screen}>
        <View style={s.header}>
          <Text style={s.heading}>選擇清單歌曲</Text>
          <Text style={s.muted}>點選歌曲即可加入或移除，變更會立即儲存。</Text>
          <View style={s.primaryAction}><Button title="完成" filled compact onPress={onClose} /></View>
          {!!error && <Text style={s.error}>{error}</Text>}
        </View>
        <FlatList data={tracks} keyExtractor={t => t.id} contentContainerStyle={s.list}
          ListEmptyComponent={<Text style={s.muted}>音樂庫尚無歌曲，請先完成並匯入 MP3。</Text>}
          renderItem={({ item }) => {
            const checked = selectedIds.includes(item.id);
            return (
              <Pressable accessibilityRole="checkbox" accessibilityState={{ checked, disabled: busy }} disabled={busy} style={s.item} onPress={() => onToggle(item)}>
                <Text style={s.title}>{checked ? '✓ ' : '＋ '}{item.name}</Text>
              </Pressable>
            );
          }} />
      </SafeAreaView>
    </Modal>
  );
}
