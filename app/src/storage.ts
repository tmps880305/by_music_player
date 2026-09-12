import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FS from 'expo-file-system/legacy';
import type { DocumentPickerAsset } from 'expo-document-picker';
import { emptyLibrary, parseLibrary, type Library, type Track } from './model';
const KEY = 'baiyen.library.v1';
function root() { if (!FS.documentDirectory) throw Error('無法存取手機儲存空間'); return FS.documentDirectory + 'music/'; }
export const trackUri = (track: Track) => root() + track.fileName;
export const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
export async function loadLibrary() {
  await FS.makeDirectoryAsync(root(), { intermediates: true });
  const raw = await AsyncStorage.getItem(KEY);
  return raw === null ? emptyLibrary() : parseLibrary(raw);
}
export async function saveLibrary(data: Library) { await AsyncStorage.setItem(KEY, JSON.stringify(data)); }
export async function copyTrack(asset: DocumentPickerAsset): Promise<Track> {
  if (!/\.mp3$/i.test(asset.name)) throw Error('僅支援 MP3 檔案');
  const id = newId();
  const track = { id, name: asset.name.replace(/\.mp3$/i, ''), fileName: id + '.mp3', size: asset.size ?? 0 };
  try {
    await FS.copyAsync({ from: asset.uri, to: trackUri(track) });
    const info = await FS.getInfoAsync(trackUri(track));
    if (!info.exists || info.isDirectory || info.size === 0) throw Error('音檔為空或無法讀取');
    track.size = info.size;
    return track;
  } catch (error) {
    await deleteTrackFile(track).catch(() => {});
    throw error;
  }
}
export async function deleteTrackFile(track: Track) { await FS.deleteAsync(trackUri(track), { idempotent: true }); }
