import { Text, View } from 'react-native';
import type { Track } from '../model';
import { s } from '../theme';
import IconButton from './IconButton';
import { TrackCard } from './TrackList';

const noop = () => {};
// Enough cards to fill the page area on a phone; the rest would be off-screen anyway.
const MAX_CARDS = 12;

// Non-interactive copy of a playlist page (heading, controls, song cards) as it looked when the user left it,
// used as the page that turns away in PageFlip.
export type PlaylistSnapshot = { name: string; tracks: Track[]; activeId: string | null; playing: boolean };

export default function PlaylistGhost({ name, tracks, activeId, playing }: PlaylistSnapshot) {
  return (
    <View style={s.screen}>
      <View style={s.header}>
        <View style={s.titleRow}>
          <View style={s.backIcon}><IconButton icon="chevron-back" label="" size={30} onPress={noop} /></View>
          <Text style={[s.heading, { flex: 1 }]} numberOfLines={1}>{name}</Text>
        </View>
        <View style={s.actionRow}>
          <View style={[s.leadingIcon, s.iconRow]}><IconButton icon="add-circle" label="" size={47} onPress={noop} /></View>
          <View style={[s.trailingIcon, s.iconRow]}>
            <IconButton icon="refresh" label="" size={28} disabled={!tracks.length} onPress={noop} />
            <IconButton icon={playing ? 'pause-circle' : 'play-circle'} label="" size={47} disabled={!tracks.length} onPress={noop} />
          </View>
        </View>
      </View>
      <View style={s.list}>
        {tracks.slice(0, MAX_CARDS).map(track => (
          <TrackCard key={track.id} track={track} active={track.id === activeId} busy={false} inPlaylist onPlay={noop} onTrash={noop} />
        ))}
      </View>
    </View>
  );
}
