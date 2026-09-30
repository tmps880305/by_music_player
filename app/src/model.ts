export type Track = { id: string; name: string; fileName: string; size: number };
export type Playlist = { id: string; name: string; trackIds: string[] };
export type Library = { version: 1; tracks: Track[]; playlists: Playlist[] };
export const emptyLibrary = (): Library => ({ version: 1, tracks: [], playlists: [] });
export function removeTrack(data: Library, id: string): Library {
  return { ...data, tracks: data.tracks.filter(t => t.id !== id), playlists: data.playlists.map(p => ({ ...p, trackIds: p.trackIds.filter(t => t !== id) })) };
}
export function toggleTrack(playlist: Playlist, id: string): Playlist {
  return { ...playlist, trackIds: playlist.trackIds.includes(id) ? playlist.trackIds.filter(t => t !== id) : [...playlist.trackIds, id] };
}
// Moves the song at `from` to position `to`, shifting the songs in between (drag-and-drop order).
export function reorderTrack(playlist: Playlist, from: number, to: number): Playlist {
  const ids = [...playlist.trackIds];
  if (from === to || from < 0 || from >= ids.length || to < 0 || to >= ids.length) return playlist;
  const [id] = ids.splice(from, 1);
  ids.splice(to, 0, id);
  return { ...playlist, trackIds: ids };
}
export function parseLibrary(raw: string): Library {
  const data = JSON.parse(raw);
  if (data?.version !== 1 || !Array.isArray(data.tracks) || !Array.isArray(data.playlists)) throw Error('音樂庫格式無法讀取');
  const ids = new Set<string>();
  for (const t of data.tracks) {
    if (!t || typeof t.id !== 'string' || ids.has(t.id) || typeof t.name !== 'string' || typeof t.fileName !== 'string' || !/^[a-zA-Z0-9-]+\.mp3$/.test(t.fileName) || typeof t.size !== 'number') throw Error('歌曲資料損壞');
    ids.add(t.id);
  }
  const playlistIds = new Set<string>();
  for (const p of data.playlists) {
    if (!p || typeof p.id !== 'string' || playlistIds.has(p.id) || typeof p.name !== 'string' || !Array.isArray(p.trackIds) || p.trackIds.some((id: unknown) => typeof id !== 'string' || !ids.has(id)) || new Set(p.trackIds).size !== p.trackIds.length) throw Error('播放清單資料損壞');
    playlistIds.add(p.id);
  }
  return data;
}
