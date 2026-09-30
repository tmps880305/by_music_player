import { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import DeviceFrame from './src/DeviceFrame';
import { Alert } from './src/dialogs';
import { moveTrack, toggleTrack, type Track } from './src/model';
import { colors, s } from './src/theme';
import { useLibrary } from './src/useLibrary';
import Button from './src/components/Button';
import IconButton from './src/components/IconButton';
import Player from './src/components/Player';
import PlaylistEditor from './src/components/PlaylistEditor';
import PlaylistList from './src/components/PlaylistList';
import PlaylistToolbar from './src/components/PlaylistToolbar';
import TrackList from './src/components/TrackList';

const statusBarStyle = 'light';

export default function App() {
  return <SafeAreaProvider><DeviceFrame statusBar={statusBarStyle}><Main /></DeviceFrame></SafeAreaProvider>;
}

function Main() {
  const library = useLibrary();
  const { data, loaded, busy, error, notice } = library;
  const [tab, setTab] = useState<'library' | 'playlists'>('library');
  const [search, setSearch] = useState('');
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  // editMode reveals the playlist's editing tools; picking shows the add/remove songs sheet.
  const [editMode, setEditMode] = useState(false);
  const [picking, setPicking] = useState(false);
  const [name, setName] = useState('');
  const [active, setActive] = useState<string | null>(null);
  const [queue, setQueue] = useState<string[]>([]);
  const playlist = data.playlists.find(p => p.id === playlistId);

  function openPlaylist(id: string | null) { setPlaylistId(id); setSearch(''); setName(''); setEditMode(false); }
  // Android back button/gesture: leave the open playlist instead of exiting the app.
  useEffect(() => {
    if (!playlistId) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => { openPlaylist(null); return true; });
    return () => subscription.remove();
  }, [playlistId]);
  function showTab(next: typeof tab) { setTab(next); openPlaylist(null); }
  function choose(track: Track, ids: string[]) { setQueue(ids); setActive(track.id); }
  function deleteSong(track: Track) {
    Alert.alert('刪除歌曲？', `「${track.name}」將從音樂庫與所有播放清單移除，原始檔案不受影響。`, [
      { text: '取消', style: 'cancel' },
      { text: '刪除', style: 'destructive', onPress: () => void library.deleteTrack(track).then(ok => {
        if (!ok) return;
        if (active === track.id) setActive(null);
        setQueue(q => q.filter(id => id !== track.id));
      }) },
    ]);
  }
  async function createPlaylist() {
    const id = await library.createPlaylist(name.trim());
    if (id) { setName(''); setPlaylistId(id); }
  }
  function deletePlaylist(id: string) {
    Alert.alert('刪除播放清單？', '音樂庫中的歌曲仍會保留。', [
      { text: '取消', style: 'cancel' },
      { text: '刪除', style: 'destructive', onPress: () => void library.deletePlaylist(id) },
    ]);
  }
  function changePlaylist(transform: Parameters<typeof library.updatePlaylist>[1]) {
    if (playlistId) void library.updatePlaylist(playlistId, transform);
  }

  const validQueue = queue.filter(id => data.tracks.some(t => t.id === id));
  const position = active ? validQueue.indexOf(active) : -1;
  const sortedTracks = [...data.tracks].sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant', { numeric: true, sensitivity: 'base' }));
  const listed = playlist ? playlist.trackIds.map(id => data.tracks.find(t => t.id === id)).filter((t): t is Track => !!t) : sortedTracks;
  const visible = listed.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
  const selected = data.tracks.find(t => t.id === active) ?? null;
  const emptyText = search ? '找不到符合的歌曲。'
    : playlist ? (editMode ? '清單還沒有歌曲，點選「加入／移除歌曲」。' : '清單還沒有歌曲，點選「編輯」加入歌曲。')
    : '點選「匯入 MP3」從裝置選擇音樂檔案，或先加入範例歌曲試聽。';
  const emptyAction = !playlist && !search && !data.tracks.length ? { title: '加入範例歌曲', onPress: () => void library.addSamples() } : undefined;

  // The bottom inset is applied inside Player so its background reaches the screen edge.
  return (
    <SafeAreaView style={s.screen} edges={['top', 'left', 'right']}>
      <StatusBar style={statusBarStyle} />
      <View style={s.header}>
        <Text style={s.label}>BAIYEN MUSIC PLAYER</Text>
        {playlist ? (
          <View style={s.titleRow}>
            <View style={s.backIcon}><IconButton icon="chevron-back" label="返回播放清單" size={30} onPress={() => openPlaylist(null)} /></View>
            <Text style={[s.heading, { flex: 1 }]} numberOfLines={1}>{playlist.name}</Text>
          </View>
        ) : <>
          <Text style={s.heading}>{tab === 'playlists' ? '播放清單' : '音樂庫'}</Text>
          <View style={s.row}>
            <Button title={`音樂庫 ${data.tracks.length}`} onPress={() => showTab('library')} />
            <Button title={`播放清單 ${data.playlists.length}`} onPress={() => showTab('playlists')} />
            <Button title={busy ? '處理中…' : '匯入 MP3'} disabled={busy || !loaded} onPress={() => void library.importFiles()} />
          </View>
        </>}
        {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
        {!!notice && <Text style={s.muted}>{notice}</Text>}
      </View>

      {!loaded ? (
        <View style={s.header}>
          {error ? <Button title="重新載入" onPress={() => void library.load()} /> : <ActivityIndicator color={colors.accent} />}
        </View>
      ) : tab === 'playlists' && !playlist ? (
        <PlaylistList playlists={data.playlists} busy={busy} name={name} onNameChange={setName} onCreate={() => void createPlaylist()} onOpen={openPlaylist} onDelete={p => deletePlaylist(p.id)} />
      ) : <>
        <View style={s.header}>
          {playlist ? <>
            <View style={s.primaryAction}>
              <Button title={editMode ? '完成' : '編輯'} filled compact onPress={() => { setEditMode(!editMode); setName(''); }} />
            </View>
            {editMode && <PlaylistToolbar busy={busy} name={name} onNameChange={setName}
              onPick={() => setPicking(true)}
              onRename={() => { changePlaylist(p => ({ ...p, name: name.trim() })); setName(''); }} />}
          </> : <>
            <Text style={s.muted}>依名稱排序 · 由小到大</Text>
            <TextInput accessibilityLabel="搜尋歌曲" style={s.input} placeholder="搜尋歌曲名稱" placeholderTextColor={colors.placeholder} value={search} onChangeText={setSearch} />
          </>}
        </View>
        <TrackList tracks={visible} playlist={playlist} editing={editMode} activeId={active} busy={busy} emptyText={emptyText} emptyAction={emptyAction}
          onPlay={track => choose(track, playlist ? playlist.trackIds : visible.map(t => t.id))}
          onMove={(track, direction) => changePlaylist(p => moveTrack(p, p.trackIds.indexOf(track.id), direction))}
          onRemove={track => changePlaylist(p => ({ ...p, trackIds: p.trackIds.filter(id => id !== track.id) }))}
          onDelete={deleteSong} />
      </>}

      <Player track={selected}
        previous={position > 0 ? () => setActive(validQueue[position - 1]) : undefined}
        next={position >= 0 && position < validQueue.length - 1 ? () => setActive(validQueue[position + 1]) : undefined} />
      <PlaylistEditor visible={picking && !!playlist} tracks={sortedTracks} selectedIds={playlist?.trackIds ?? []} busy={busy} error={error}
        onToggle={track => changePlaylist(p => toggleTrack(p, track.id))} onClose={() => setPicking(false)} />
    </SafeAreaView>
  );
}
