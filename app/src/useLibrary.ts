import { useEffect, useRef, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import type { DocumentPickerAsset } from 'expo-document-picker';
import { emptyLibrary, removeTrack, reorderPlaylists, reorderTrack, type Library, type Playlist, type Track } from './model';
import { copyTrack, deleteTrackFile, loadLibrary, newId, saveLibrary } from './storage';
import { sampleAssets } from './samples';

// Owns the persisted library. Every mutation goes through run(), which serialises writes and reports errors.
export function useLibrary() {
  const [data, setData] = useState<Library>(emptyLibrary);
  const current = useRef(data);
  const locked = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    try { const value = await loadLibrary(); current.current = value; setData(value); setLoaded(true); setError(''); }
    catch { setError('無法讀取音樂庫，原有資料已保留。請重新嘗試。'); }
  }
  useEffect(() => { void load(); }, []);

  async function commit(value: Library) { await saveLibrary(value); current.current = value; setData(value); }
  // Shows the change before saving and rolls back if the save fails; used where the UI must update instantly (drag reorder).
  async function commitOptimistic(value: Library) {
    const previous = current.current;
    current.current = value; setData(value);
    try { await saveLibrary(value); } catch (e) { current.current = previous; setData(previous); throw e; }
  }
  async function run<T>(action: () => Promise<T>): Promise<T | undefined> {
    if (locked.current || !loaded) return;
    locked.current = true; setBusy(true); setError(''); setNotice('');
    try { return await action(); }
    catch (e) { setError(e instanceof Error ? e.message : '操作失敗，請再試一次'); }
    finally { locked.current = false; setBusy(false); }
  }

  // Copies files into app storage and saves them to the library; returns the failure summary for the notice.
  async function addAssets(assets: DocumentPickerAsset[]) {
    const added: Track[] = []; const failed: string[] = [];
    for (const asset of assets) { try { added.push(await copyTrack(asset)); } catch { failed.push(asset.name); } }
    try { if (added.length) await commit({ ...current.current, tracks: [...current.current.tracks, ...added] }); }
    catch { await Promise.all(added.map(t => deleteTrackFile(t).catch(() => {}))); throw Error('儲存失敗，這次匯入未加入音樂庫，請重試。'); }
    return { count: added.length, failures: failed.length ? `；${failed.length} 個失敗：${failed.join('、')}` : '' };
  }
  const importFiles = () => run(async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['audio/mpeg', 'audio/mp3'], multiple: true, copyToCacheDirectory: true });
    if (result.canceled) return;
    const { count, failures } = await addAssets(result.assets);
    setNotice(`已匯入 ${count} 首${failures}`);
  });
  const addSamples = () => run(async () => {
    const { count, failures } = await addAssets(await sampleAssets());
    setNotice(`已加入 ${count} 首範例歌曲${failures}`);
  });
  const deleteTrack = (track: Track) => run(async () => {
    await commit(removeTrack(current.current, track.id));
    try { await deleteTrackFile(track); } catch { setNotice('歌曲已移除，但無法清理儲存副本。'); }
    return true;
  });
  const createPlaylist = (name: string) => run(async () => {
    const p: Playlist = { id: newId(), name, trackIds: [] };
    await commit({ ...current.current, playlists: [...current.current.playlists, p] });
    return p.id;
  });
  const updatePlaylist = (id: string, transform: (p: Playlist) => Playlist) => run(async () => {
    await commit({ ...current.current, playlists: current.current.playlists.map(p => p.id === id ? transform(p) : p) });
    return true;
  });
  const reorderPlaylist = (id: string, from: number, to: number) => run(async () => {
    await commitOptimistic({ ...current.current, playlists: current.current.playlists.map(p => p.id === id ? reorderTrack(p, from, to) : p) });
  });
  const movePlaylist = (from: number, to: number) => run(async () => {
    await commitOptimistic(reorderPlaylists(current.current, from, to));
  });
  const deletePlaylist = (id: string) => run(async () => {
    await commit({ ...current.current, playlists: current.current.playlists.filter(p => p.id !== id) });
    return true;
  });

  return { data, loaded, busy, error, notice, load, importFiles, addSamples, deleteTrack, createPlaylist, updatePlaylist, reorderPlaylist, movePlaylist, deletePlaylist };
}
