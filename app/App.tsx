import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Text, TextInput, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import DeviceFrame from './src/DeviceFrame';
import { Alert } from './src/dialogs';
import { toggleTrack, type Track } from './src/model';
import { colors, s } from './src/theme';
import { useLibrary } from './src/useLibrary';
import Button from './src/components/Button';
import IconButton from './src/components/IconButton';
import Player, { type PlayerHandle } from './src/components/Player';
import PlaylistEditor from './src/components/PlaylistEditor';
import PlaylistList from './src/components/PlaylistList';
import RenameDialog from './src/components/RenameDialog';
import TrackList from './src/components/TrackList';

const statusBarStyle = 'light';

export default function App() {
  // GestureHandlerRootView enables the long-press drag to reorder playlist songs.
  return <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider><DeviceFrame statusBar={statusBarStyle}><Main /></DeviceFrame></SafeAreaProvider></GestureHandlerRootView>;
}

function Main() {
  const library = useLibrary();
  const { data, loaded, busy, error, notice } = library;
  const [tab, setTab] = useState<'library' | 'playlists'>('library');
  const [search, setSearch] = useState('');
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  // picking shows the add/remove songs sheet; renamingId is the playlist whose rename dialog is open.
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [name, setName] = useState('');
  const [active, setActive] = useState<string | null>(null);
  const [queue, setQueue] = useState<string[]>([]);
  const [restartToken, setRestartToken] = useState(0);
  // Playlist the queue came from (null = library), so a playlist page knows whether it owns current playback.
  const [queueSource, setQueueSource] = useState<string | null>(null);
  // Playlist whose paused song the play icon may resume. Cleared when leaving a playlist page, so the next visit starts from the top.
  const [resumePlaylist, setResumePlaylist] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const player = useRef<PlayerHandle>(null);
  const playlist = data.playlists.find(p => p.id === playlistId);

  function openPlaylist(id: string | null) {
    // Leaving a playlist whose song is paused resets playback, so the next visit starts with nothing selected.
    if (playlistId && queueSource === playlistId && !playing) { setActive(null); setQueue([]); setQueueSource(null); }
    setPlaylistId(id); setSearch(''); setName(''); setResumePlaylist(null);
  }
  // Android back button/gesture: leave the open playlist instead of exiting the app. The ref keeps the handler
  // calling the latest openPlaylist, which reads current playback state.
  const openPlaylistRef = useRef(openPlaylist);
  openPlaylistRef.current = openPlaylist;
  useEffect(() => {
    if (!playlistId) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => { openPlaylistRef.current(null); return true; });
    return () => subscription.remove();
  }, [playlistId]);
  function showTab(next: typeof tab) { setTab(next); openPlaylist(null); }
  // restart: replay from the beginning even if this track is already the current one.
  function choose(track: Track, ids: string[], source: string | null, restart = false) {
    setQueue(ids); setQueueSource(source); setResumePlaylist(source); setActive(track.id);
    if (restart) setRestartToken(n => n + 1);
  }
  // Playlist play/pause icon: pauses or resumes this playlist's playback, otherwise starts it from the first song.
  function playPlaylist() {
    if (!playlist || !listed.length) return;
    if (playlistPlaying) { player.current?.toggle(); setResumePlaylist(playlist.id); }
    else if (playlistOwnsPlayback && resumePlaylist === playlist.id && player.current?.canResume()) player.current.toggle();
    else choose(listed[0], playlist.trackIds, playlist.id, true);
  }
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
  function removeFromPlaylist(track: Track) {
    Alert.alert('從清單移除？', `「${track.name}」會從這個清單移除，音樂庫中的歌曲仍會保留。`, [
      { text: '取消', style: 'cancel' },
      { text: '移除', style: 'destructive', onPress: () => changePlaylist(p => ({ ...p, trackIds: p.trackIds.filter(id => id !== track.id) })) },
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
  // True when the current song came from the open playlist.
  const playlistOwnsPlayback = !!playlist && queueSource === playlist.id && !!active && playlist.trackIds.includes(active);
  const playlistPlaying = playlistOwnsPlayback && playing;
  const emptyText = search ? '找不到符合的歌曲。'
    : playlist ? '清單還沒有歌曲，點選 + 加入歌曲。'
    : '音樂庫還沒有歌曲。';
  const emptyAction = !playlist && !search && !data.tracks.length ? { title: '加入範例歌曲', onPress: () => void library.addSamples(), coach: '點擊＋加入歌曲' } : undefined;

  // The bottom inset is applied inside Player so its background reaches the screen edge.
  return (
    <SafeAreaView style={s.screen} edges={['top', 'left', 'right']}>
      <StatusBar style={statusBarStyle} />
      <View style={s.header}>
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
        <PlaylistList playlists={data.playlists} busy={busy} name={name} onNameChange={setName} onCreate={() => void createPlaylist()} onOpen={openPlaylist} onRename={p => setRenamingId(p.id)} onDelete={p => deletePlaylist(p.id)}
          onReorder={(from, to) => void library.movePlaylist(from, to)} />
      ) : <>
        <View style={s.header}>
          {playlist ? <>
            <View style={s.actionRow}>
              <View style={[s.leadingIcon, s.iconRow]}>
                {/* Opens the add/remove songs sheet; sized like the play button. */}
                <IconButton icon="add-circle" label="加入／移除歌曲" size={47} onPress={() => setPicking(true)} />
              </View>
              <View style={[s.trailingIcon, s.iconRow]}>
                {/* Restarts the whole playlist from its first song, whatever is currently playing. */}
                <IconButton icon="refresh" label="從第一首重新播放" size={28} disabled={!listed.length} onPress={() => choose(listed[0], playlist.trackIds, playlist.id, true)} />
                {/* The circle glyph is 0.81em tall, so size 47 draws a 38pt circle. */}
                <IconButton icon={playlistPlaying ? 'pause-circle' : 'play-circle'} label={playlistPlaying ? '暫停播放清單' : '播放清單'} size={47} disabled={!listed.length} onPress={playPlaylist} />
              </View>
            </View>
          </> : <>
            <Text style={s.muted}>依名稱排序 · 由小到大</Text>
            <View style={s.inputRow}>
              <TextInput accessibilityLabel="搜尋歌曲" style={[s.input, { flex: 1 }]} placeholder="搜尋歌曲名稱" placeholderTextColor={colors.placeholder} value={search} onChangeText={setSearch} />
              {/* Imports MP3s via the file picker; styled like the playlist page's + button. */}
              <View style={s.trailingIcon}>
                <IconButton icon="add-circle" label="匯入 MP3" size={47} disabled={busy || !loaded} onPress={() => void library.importFiles()} />
              </View>
            </View>
          </>}
        </View>
        <TrackList tracks={visible} playlist={playlist} activeId={active} busy={busy} emptyText={emptyText} emptyAction={emptyAction}
          onPlay={track => choose(track, playlist ? playlist.trackIds : visible.map(t => t.id), playlist?.id ?? null)}
          onReorder={(from, to) => { if (playlist) void library.reorderPlaylist(playlist.id, from, to); }}
          onRemove={removeFromPlaylist}
          onDelete={deleteSong} />
      </>}

      <Player ref={player} track={selected} restartToken={restartToken} onPlayingChange={setPlaying}
        previous={position > 0 ? () => setActive(validQueue[position - 1]) : undefined}
        next={position >= 0 && position < validQueue.length - 1 ? () => setActive(validQueue[position + 1]) : undefined} />
      <PlaylistEditor visible={picking && !!playlist} tracks={sortedTracks} selectedIds={playlist?.trackIds ?? []} busy={busy} error={error}
        onToggle={track => changePlaylist(p => toggleTrack(p, track.id))} onClose={() => setPicking(false)} />
      <RenameDialog playlist={data.playlists.find(p => p.id === renamingId) ?? null} busy={busy} error={error} onCancel={() => setRenamingId(null)}
        onSave={newName => { if (renamingId) void library.updatePlaylist(renamingId, p => ({ ...p, name: newName })).then(ok => { if (ok) setRenamingId(null); }); }} />
    </SafeAreaView>
  );
}
