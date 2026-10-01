import AsyncStorage from '@react-native-async-storage/async-storage';

// Small UI preferences kept apart from the music library (AsyncStorage works on iOS, Android and web).
const KEY = 'baiyen.prefs.v1';

export type Prefs = {
  // The user has reordered a playlist by dragging, so the "長按拖曳排序" hint is no longer needed.
  dragHintSeen?: boolean;
};

export async function loadPrefs(): Promise<Prefs> {
  try { const raw = await AsyncStorage.getItem(KEY); return raw ? JSON.parse(raw) : {}; }
  catch { return {}; }
}

export async function savePrefs(prefs: Prefs) {
  try { await AsyncStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* a lost preference only re-shows a hint */ }
}
