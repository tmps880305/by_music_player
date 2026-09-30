import { useEffect, useRef, useState } from 'react';
import { AppState, Text, View } from 'react-native';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useKeepAwake } from 'expo-keep-awake';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SeekBar from '../SeekBar';
import { trackUri } from '../storage';
import type { Track } from '../model';
import { s } from '../theme';
import IconButton from './IconButton';

const RESTART_THRESHOLD = 5;

function time(value: number) {
  const n = Math.max(0, Math.floor(value || 0));
  return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`;
}

function PlaybackWakeLock() {
  useKeepAwake(undefined, { suppressDeactivateWarnings: true });
  return null;
}

type Props = { track: Track | null; next?: () => void; previous?: () => void };

export default function Player({ track, next, previous }: Props) {
  // One player for the whole session: swapping sources with replace() keeps iOS background playback alive between tracks.
  const player = useAudioPlayer(null, { keepAudioSessionActive: true });
  const status = useAudioPlayerStatus(player);
  const insets = useSafeAreaInsets();
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [seekPreview, setSeekPreview] = useState<number | null>(null);
  const seekBusy = useRef(false);
  const loadedId = useRef<string | null>(null);
  const finished = useRef(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => setForeground(state === 'active'));
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    let active = true;
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'doNotMix' })
      .then(() => { if (active) setReady(true); })
      .catch(() => { if (active) setError('音訊初始化失敗'); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!ready || loadedId.current === (track?.id ?? null)) return;
    loadedId.current = track?.id ?? null; setError(''); setSeekPreview(null);
    try {
      if (!track) { player.pause(); player.replace(null); player.clearLockScreenControls(); return; }
      player.replace({ uri: trackUri(track) });
      player.setActiveForLockScreen(true, { title: track.name }); player.play();
    } catch { setError('無法播放此音檔'); }
  }, [ready, track?.id, player]);
  useEffect(() => {
    if (status.didJustFinish && !finished.current) { finished.current = true; next?.(); }
    if (status.playing) finished.current = false;
  }, [status.didJustFinish, status.playing, next]);

  async function seek(value: number) {
    if (!track || !status.isLoaded || !Number.isFinite(status.duration) || status.duration <= 0 || seekBusy.current) return;
    seekBusy.current = true; setSeeking(true); setError('');
    try { await player.seekTo(Math.max(0, Math.min(status.duration, value))); }
    catch { setError('無法跳轉至選取時間，請再試一次。'); }
    finally { seekBusy.current = false; setSeeking(false); setSeekPreview(null); }
  }
  function start() {
    player.setActiveForLockScreen(true, { title: track?.name ?? 'Baiyen Music Player' });
    player.play();
  }
  async function play(restart = false) {
    setSeeking(true); setError('');
    try {
      if (restart || (status.duration > 0 && status.currentTime >= status.duration)) { await player.seekTo(0); start(); }
      else if (status.playing) player.pause();
      else start();
    } catch { setError('無法播放此音檔'); }
    finally { setSeeking(false); }
  }
  // Like most players: past the first few seconds, "previous" restarts the current song instead of skipping back.
  async function back() {
    if (canPlay && (status.currentTime > RESTART_THRESHOLD || !previous)) await play(true);
    else previous?.();
  }

  const canPlay = !!track && ready && status.isLoaded && !seeking;
  const hasDuration = Number.isFinite(status.duration) && status.duration > 0;
  const position = track ? seekPreview ?? status.currentTime : 0;
  return (
    <View style={[s.player, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {status.playing && foreground && <PlaybackWakeLock />}
      <Text style={s.label}>正在播放</Text>
      <Text style={s.title} numberOfLines={1}>{track?.name ?? '請從音樂庫選擇歌曲'}</Text>
      <SeekBar value={position} maximum={track && Number.isFinite(status.duration) ? status.duration : 0} disabled={!canPlay || !hasDuration}
        onPreview={setSeekPreview} onCommit={value => void seek(value)} onCancel={() => setSeekPreview(null)} />
      <Text style={s.muted}>{time(position)} / {time(track ? status.duration : 0)}{!track ? '' : !status.isLoaded ? ' · 載入中' : ''}</Text>
      <View style={s.controls}>
        <IconButton icon="play-skip-back" label="上一首" onPress={() => void back()} disabled={!canPlay && !previous} />
        <IconButton icon={status.playing ? 'pause' : 'play'} label={status.playing ? '暫停' : '播放'} size={40} onPress={() => void play()} disabled={!canPlay} />
        <IconButton icon="play-skip-forward" label="下一首" onPress={() => next?.()} disabled={!next} />
      </View>
      {!!(error || status.error) && <Text accessibilityRole="alert" style={s.error}>{error || status.error}</Text>}
    </View>
  );
}
