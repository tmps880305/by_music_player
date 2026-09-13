import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker';
import { emptyLibrary, moveTrack, removeTrack, toggleTrack, type Library, type Track } from './src/model';
import { copyTrack, deleteTrackFile, loadLibrary, newId, saveLibrary, trackUri } from './src/storage';

function Button({ title, onPress, disabled = false, danger = false }: { title: string; onPress: () => void; disabled?: boolean; danger?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} onPress={onPress} disabled={disabled} style={[s.button, disabled && { opacity: .35 }]}><Text style={{ color: danger ? '#FFB4A9' : '#C1E4A5', fontWeight: '600' }}>{title}</Text></Pressable>;
}
function time(value: number) { const n = Math.max(0, Math.floor(value || 0)); return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`; }
function Player({ track, next, previous }: { track: Track | null; next?: () => void; previous?: () => void }) {
  const player = useAudioPlayer(track ? { uri: trackUri(track) } : null);
  const status = useAudioPlayerStatus(player);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const autoStarted = useRef(false);
  const finished = useRef(false);
  useEffect(() => { let active = true; setAudioModeAsync({ playsInSilentMode: true }).then(() => { if (active) setReady(true); }).catch(() => { if (active) setError('音訊初始化失敗'); }); return () => { active = false; }; }, []);
  useEffect(() => { if (ready && status.isLoaded && track && !autoStarted.current) { autoStarted.current = true; try { player.play(); } catch { setError('無法播放此音檔'); } } }, [ready, status.isLoaded, player, track]);
  useEffect(() => { if (status.didJustFinish && !finished.current) { finished.current = true; next?.(); } if (status.playing) finished.current = false; }, [status.didJustFinish, status.playing, next]);
  async function play(restart = false) {
    setSeeking(true); setError('');
    try { if (restart || (status.duration > 0 && status.currentTime >= status.duration)) { await player.seekTo(0); player.play(); } else if (status.playing) player.pause(); else player.play(); } catch { setError('無法播放此音檔'); } finally { setSeeking(false); }
  }
  return <View style={s.player}>
    <Text style={s.label}>正在播放</Text><Text style={s.title} numberOfLines={1}>{track?.name ?? '請從音樂庫選擇歌曲'}</Text>
    <View style={s.progress}><View style={{ height: 3, backgroundColor: '#C1E4A5', width: `${status.duration ? Math.min(100, status.currentTime / status.duration * 100) : 0}%` }} /></View>
    <Text style={s.muted}>{time(status.currentTime)} / {time(status.duration)}{!track ? '' : !status.isLoaded ? ' · 載入中' : ''}</Text>
    <View style={s.row}><Button title="上一首" onPress={() => previous?.()} disabled={!previous} /><Button title={status.playing ? '暫停' : '播放'} onPress={() => void play()} disabled={!ready || !status.isLoaded || seeking} /><Button title="下一首" onPress={() => next?.()} disabled={!next} /><Button title="重播" onPress={() => void play(true)} disabled={!ready || !status.isLoaded || seeking} /></View>
    {!!(error || status.error) && <Text accessibilityRole="alert" style={s.error}>{error || status.error}</Text>}
  </View>;
}
export default function App() { return <SafeAreaProvider><Main /></SafeAreaProvider>; }
function Main() {
  const [data, setData] = useState<Library>(emptyLibrary);
  const current = useRef(data);
  const locked = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState<'library' | 'playlists'>('library');
  const [search, setSearch] = useState('');
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [active, setActive] = useState<string | null>(null);
  const [queue, setQueue] = useState<string[]>([]);
  const playlist = data.playlists.find(p => p.id === playlistId);
  async function load() { try { const value = await loadLibrary(); current.current = value; setData(value); setLoaded(true); setError(''); } catch { setError('無法讀取音樂庫，原有資料已保留。請重新嘗試。'); } }
  useEffect(() => { void load(); }, []);
  async function commit(value: Library) { await saveLibrary(value); current.current = value; setData(value); }
  async function run(action: () => Promise<void>) {
    if (locked.current || !loaded) return;
    locked.current = true; setBusy(true); setError(''); setNotice('');
    try { await action(); } catch (e) { setError(e instanceof Error ? e.message : '操作失敗，請再試一次'); } finally { locked.current = false; setBusy(false); }
  }
  async function importFiles() {
    await run(async () => {
      const result = await DocumentPicker.getDocumentAsync({ type: ['audio/mpeg', 'audio/mp3'], multiple: true, copyToCacheDirectory: true });
      if (result.canceled) return;
      const added: Track[] = []; const failed: string[] = [];
      for (const asset of result.assets) { try { added.push(await copyTrack(asset)); } catch { failed.push(asset.name); } }
      try { if (added.length) await commit({ ...current.current, tracks: [...current.current.tracks, ...added] }); }
      catch { await Promise.all(added.map(t => deleteTrackFile(t).catch(() => {}))); throw Error('儲存失敗，這次匯入未加入音樂庫，請重試。'); }
      setNotice(`已匯入 ${added.length} 首${failed.length ? `；${failed.length} 個失敗：${failed.join('、')}` : ''}`);
    });
  }
  function choose(track: Track, ids: string[]) { setQueue(ids); setActive(track.id); }
  function deleteSong(track: Track) {
    Alert.alert('刪除歌曲？', `「${track.name}」將從音樂庫與所有播放清單移除，原始檔案不受影響。`, [{ text: '取消', style: 'cancel' }, { text: '刪除', style: 'destructive', onPress: () => void run(async () => {
      await commit(removeTrack(current.current, track.id));
      if (active === track.id) setActive(null);
      setQueue(q => q.filter(id => id !== track.id));
      try { await deleteTrackFile(track); } catch { setNotice('歌曲已移除，但無法清理儲存副本。'); }
    }) }]);
  }
  function changePlaylist(transform: (p: NonNullable<typeof playlist>) => NonNullable<typeof playlist>) {
    void run(async () => { await commit({ ...current.current, playlists: current.current.playlists.map(p => p.id === playlistId ? transform(p) : p) }); });
  }
  const validQueue = queue.filter(id => data.tracks.some(t => t.id === id));
  const position = active ? validQueue.indexOf(active) : -1;
  const sortedTracks = [...data.tracks].sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant', { numeric: true, sensitivity: 'base' }));
  const visible = (playlist ? playlist.trackIds.map(id => data.tracks.find(t => t.id === id)!).filter(Boolean) : sortedTracks).filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
  const selected = data.tracks.find(t => t.id === active) ?? null;
  return <SafeAreaView style={s.screen}><StatusBar style="light" />
    <View style={s.header}><Text style={s.label}>BAIYEN MUSIC PLAYER</Text><Text style={s.heading}>{playlist ? playlist.name : '我的音樂'}</Text>
      <View style={s.row}><Button title={`音樂庫 ${data.tracks.length}`} onPress={() => { setTab('library'); setPlaylistId(null); setSearch(''); setName(''); }} /><Button title={`播放清單 ${data.playlists.length}`} onPress={() => { setTab('playlists'); setPlaylistId(null); setSearch(''); setName(''); }} /><Button title={busy ? '處理中…' : '匯入 MP3'} disabled={busy || !loaded} onPress={() => void importFiles()} /></View>
      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}{!!notice && <Text style={s.muted}>{notice}</Text>}
    </View>
    {!loaded ? <View style={s.header}>{error ? <Button title="重新載入" onPress={() => void load()} /> : <ActivityIndicator color="#C1E4A5" />}</View> : <>
    {tab === 'playlists' && !playlist ? <>
      <View style={s.header}><TextInput accessibilityLabel="新播放清單名稱" style={s.input} placeholder="新播放清單名稱" placeholderTextColor="#8DA69B" value={name} onChangeText={setName} maxLength={60} /><Button title="建立清單" disabled={busy || !name.trim()} onPress={() => void run(async () => { const p = { id: newId(), name: name.trim(), trackIds: [] }; await commit({ ...current.current, playlists: [...current.current.playlists, p] }); setName(''); setPlaylistId(p.id); })} /></View>
      <FlatList data={data.playlists} keyExtractor={p => p.id} contentContainerStyle={s.list} ListEmptyComponent={<Text style={s.muted}>建立第一個播放清單，把喜歡的歌曲放在一起。</Text>} renderItem={({ item }) => <Pressable style={s.item} onPress={() => { setPlaylistId(item.id); setSearch(''); setName(''); }}><Text style={s.title}>{item.name}</Text><Text style={s.muted}>{item.trackIds.length} 首 · 點選開啟</Text></Pressable>} />
    </> : <>
      <View style={s.header}>{playlist && <><View style={s.row}><Button title="返回清單" onPress={() => { setPlaylistId(null); setSearch(''); setName(''); }} /><Button title="加入／移除歌曲" disabled={busy} onPress={() => setEditing(true)} /><Button title="依序播放" disabled={!playlist.trackIds.length} onPress={() => choose(data.tracks.find(t => t.id === playlist.trackIds[0])!, playlist.trackIds)} /></View>
        <View style={s.row}><TextInput style={[s.input, { flex: 1 }]} accessibilityLabel="重新命名清單" placeholder="輸入新名稱" placeholderTextColor="#8DA69B" value={name} maxLength={60} onChangeText={setName} /><Button title="改名" disabled={busy || !name.trim()} onPress={() => { changePlaylist(p => ({ ...p, name: name.trim() })); setName(''); }} /><Button title="刪除清單" danger disabled={busy} onPress={() => Alert.alert('刪除播放清單？', '音樂庫中的歌曲仍會保留。', [{ text: '取消', style: 'cancel' }, { text: '刪除', style: 'destructive', onPress: () => void run(async () => { await commit({ ...current.current, playlists: current.current.playlists.filter(p => p.id !== playlistId) }); setPlaylistId(null); setName(''); }) }])} /></View></>}
        {!playlist && <Text style={s.muted}>依名稱排序 · 由小到大</Text>}<TextInput accessibilityLabel="搜尋歌曲" style={s.input} placeholder="搜尋歌曲名稱" placeholderTextColor="#8DA69B" value={search} onChangeText={setSearch} />
      </View>
      <FlatList data={visible} keyExtractor={t => t.id} contentContainerStyle={s.list} ListEmptyComponent={<Text style={s.muted}>{search ? '找不到符合的歌曲。' : playlist ? '清單還沒有歌曲，點選「加入／移除歌曲」。' : '點選「匯入 MP3」，從 iPhone「檔案」加入音樂。'}</Text>} renderItem={({ item }) => <View style={[s.item, item.id === active && s.active]}>
        <Pressable accessibilityRole="button" accessibilityLabel={`播放 ${item.name}`} onPress={() => choose(item, playlist ? playlist.trackIds : visible.map(t => t.id))}><Text style={s.title}>{item.name}</Text><Text style={s.muted}>{(item.size / 1024 / 1024).toFixed(1)} MB{item.id === active ? ' · 已選取' : ' · 點選播放'}</Text></Pressable>
        <View style={s.row}>{playlist ? <><Button title="上移" disabled={busy || playlist.trackIds.indexOf(item.id) === 0} onPress={() => changePlaylist(p => moveTrack(p, p.trackIds.indexOf(item.id), -1))} /><Button title="下移" disabled={busy || playlist.trackIds.indexOf(item.id) === playlist.trackIds.length - 1} onPress={() => changePlaylist(p => moveTrack(p, p.trackIds.indexOf(item.id), 1))} /><Button title="移出清單" disabled={busy} onPress={() => changePlaylist(p => ({ ...p, trackIds: p.trackIds.filter(id => id !== item.id) }))} /></> : <Button title="刪除歌曲" danger disabled={busy} onPress={() => deleteSong(item)} />}</View>
      </View>} />
    </>}
    </>}
    <Player key={selected?.id ?? 'sample'} track={selected} previous={position > 0 ? () => setActive(validQueue[position - 1]) : undefined} next={position >= 0 && position < validQueue.length - 1 ? () => setActive(validQueue[position + 1]) : undefined} />
    <Modal visible={editing && !!playlist} animationType="slide" onRequestClose={() => setEditing(false)}><SafeAreaView style={s.screen}><View style={s.header}><Text style={s.heading}>選擇清單歌曲</Text><Text style={s.muted}>點選歌曲即可加入或移除，變更會立即儲存。</Text><Button title="完成" onPress={() => setEditing(false)} />{!!error && <Text style={s.error}>{error}</Text>}</View><FlatList data={sortedTracks} keyExtractor={t => t.id} contentContainerStyle={s.list} ListEmptyComponent={<Text style={s.muted}>音樂庫尚無歌曲，請先完成並匯入 MP3。</Text>} renderItem={({ item }) => <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: playlist?.trackIds.includes(item.id), disabled: busy }} disabled={busy} style={s.item} onPress={() => changePlaylist(p => toggleTrack(p, item.id))}><Text style={s.title}>{playlist?.trackIds.includes(item.id) ? '✓ ' : '＋ '}{item.name}</Text></Pressable>} /></SafeAreaView></Modal>
  </SafeAreaView>;
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#101A19' }, header: { paddingHorizontal: 18, paddingTop: 8 }, heading: { color: '#F2F5EF', fontSize: 27, fontWeight: '700', marginVertical: 8 }, label: { color: '#8BCAB3', fontSize: 10, letterSpacing: 2 }, title: { color: '#F2F5EF', fontSize: 17, fontWeight: '600' }, muted: { color: '#A4B6AF', fontSize: 12, marginTop: 5 }, row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }, button: { paddingVertical: 12, paddingHorizontal: 10, minHeight: 44 }, input: { borderColor: '#40524A', borderWidth: 1, borderRadius: 10, padding: 12, color: '#F2F5EF', marginVertical: 5, minHeight: 44 }, list: { padding: 18, paddingBottom: 12 }, item: { backgroundColor: '#1B2A26', padding: 14, borderRadius: 14, marginBottom: 10 }, active: { borderColor: '#C1E4A5', borderWidth: 1 }, player: { paddingHorizontal: 18, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#40524A', backgroundColor: '#1B2A26' }, progress: { height: 3, backgroundColor: '#40524A', marginTop: 10 }, error: { color: '#FFB4A9', marginVertical: 6 },
});



