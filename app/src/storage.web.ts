import type { DocumentPickerAsset } from 'expo-document-picker';
import { emptyLibrary, parseLibrary, type Library, type Track } from './model';
const urls = new Map<string, string>();
let database: Promise<IDBDatabase> | undefined;
function db() {
  return database ??= new Promise((resolve, reject) => {
    const request = indexedDB.open('baiyen-music-player', 1);
    request.onupgradeneeded = () => { request.result.createObjectStore('audio'); request.result.createObjectStore('meta'); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => { database = undefined; reject(request.error); };
  });
}
async function access<T>(store: string, mode: IDBTransactionMode, action: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await db();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(store, mode);
    const request = action(tx.objectStore(store));
    tx.oncomplete = () => resolve(request.result);
    tx.onerror = () => reject(tx.error ?? request.error);
    tx.onabort = () => reject(tx.error ?? Error('瀏覽器儲存失敗'));
  });
}
export const newId = () => crypto.randomUUID();
export function trackUri(track: Track) { return urls.get(track.id) ?? ''; }
export async function loadLibrary(): Promise<Library> {
  const raw = await access<string | undefined>('meta', 'readonly', s => s.get('library'));
  const data = raw ? parseLibrary(raw) : emptyLibrary();
  for (const track of data.tracks) {
    const blob = await access<Blob | undefined>('audio', 'readonly', s => s.get(track.id));
    if (blob && !urls.has(track.id)) urls.set(track.id, URL.createObjectURL(blob));
  }
  return data;
}
export async function saveLibrary(data: Library) { await access('meta', 'readwrite', s => s.put(JSON.stringify(data), 'library')); }
export async function copyTrack(asset: DocumentPickerAsset): Promise<Track> {
  if (!/\.mp3$/i.test(asset.name)) throw Error('僅支援 MP3');
  const blob = asset.file ?? await (await fetch(asset.uri)).blob();
  if (!blob.size) throw Error('音檔為空');
  const id = newId();
  await access('audio', 'readwrite', s => s.put(blob, id));
  urls.set(id, URL.createObjectURL(blob));
  return { id, name: asset.name.replace(/\.mp3$/i, ''), fileName: id + '.mp3', size: blob.size };
}
export async function deleteTrackFile(track: Track) {
  await access('audio', 'readwrite', s => s.delete(track.id));
  const url = urls.get(track.id); if (url) URL.revokeObjectURL(url);
  urls.delete(track.id);
}
