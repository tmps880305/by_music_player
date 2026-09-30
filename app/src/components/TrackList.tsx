import type { ReactElement } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import ReorderableList from 'react-native-reorderable-list';
import type { Playlist, Track } from '../model';
import { useLongPressDrag } from '../useLongPressDrag';
import { colors, s } from '../theme';
import Button from './Button';
import CoachHint, { loopUpArrow, riseLeftArrow } from './CoachHint';
import EnterAnimation, { useEntranceDelays } from './EnterAnimation';
import IconButton from './IconButton';

type Props = {
  tracks: Track[];
  // Set when showing a playlist: songs can be long-pressed and dragged to reorder, and the trash icon removes from it.
  playlist?: Playlist;
  activeId: string | null;
  busy: boolean;
  emptyText: string;
  // Optional button under the empty-state text. With `coach`, onboarding hints replace the text: one pointing at the
  // + import button above the list, one at this button.
  emptyAction?: { title: string; onPress: () => void; coach?: { toImport: string; toAction: string } };
  onPlay: (track: Track) => void;
  onReorder: (from: number, to: number) => void;
  onRemove: (track: Track) => void;
  onDelete: (track: Track) => void;
  // Stagger in the cards present on mount too (after the playlist opening transition).
  animateOnMount?: boolean;
};

type CardProps = { track: Track; active: boolean; busy: boolean; inPlaylist: boolean; onPlay: () => void; onTrash: () => void; onLongPress?: () => void };

export function TrackCard({ track, active, busy, inPlaylist, onPlay, onTrash, onLongPress }: CardProps) {
  return (
    <View style={[s.item, s.cardRow, active && s.active]}>
      <Pressable style={{ flex: 1 }} accessibilityRole="button" accessibilityLabel={`播放 ${track.name}`}
        accessibilityHint={onLongPress ? '長按後拖曳可調整順序' : undefined} onPress={onPlay} onLongPress={onLongPress}>
        <Text style={s.title}>{track.name}</Text>
        <Text style={s.muted}>{(track.size / 1024 / 1024).toFixed(1)} MB{active ? ' · 已選取' : ' · 點選播放'}</Text>
      </Pressable>
      <IconButton icon="trash-outline" label={inPlaylist ? `從清單移除 ${track.name}` : `刪除 ${track.name}`} size={22} color={colors.muted} disabled={busy} onPress={onTrash} />
    </View>
  );
}

// The drag hook only works inside a ReorderableList cell, so the playlist card is its own component.
function DraggableTrackCard(props: Omit<CardProps, 'onLongPress'> & { dragEnabled: boolean }) {
  const drag = useLongPressDrag(props.dragEnabled);
  return <View ref={drag.ref}><TrackCard {...props} onLongPress={drag.onLongPress} /></View>;
}

export default function TrackList({ tracks, playlist, activeId, busy, emptyText, emptyAction, onPlay, onReorder, onRemove, onDelete, animateOnMount = false }: Props) {
  // A View, not a fragment: ReorderableList passes onLayout to the empty component.
  // With coach hints, the empty view reserves room for them below the button.
  const empty = <View style={emptyAction?.coach ? s.coachArea : undefined}>
    {!emptyAction?.coach && <Text style={s.muted}>{emptyText}</Text>}
    {emptyAction && <View style={s.primaryAction}><Button title={emptyAction.title} outline compact disabled={busy} onPress={emptyAction.onPress} /></View>}
    {emptyAction?.coach && <View style={s.coachLayer}>
      <CoachHint text={emptyAction.coach.toImport} arrow={loopUpArrow} arrowStyle={s.coachArrowToImport} textStyle={s.coachTextToImport} />
      <CoachHint text={emptyAction.coach.toAction} arrow={riseLeftArrow} arrowStyle={s.coachArrowToAction} textStyle={s.coachTextToAction} />
    </View>}
  </View>;
  // Cards added while the list is showing (imports, songs added to a playlist) drop in one by one.
  const entranceDelay = useEntranceDelays(tracks.map(t => t.id), animateOnMount);
  const card = (track: Track): Omit<CardProps, 'onLongPress'> => ({
    track, active: track.id === activeId, busy, inPlaylist: !!playlist,
    onPlay: () => onPlay(track), onTrash: () => playlist ? onRemove(track) : onDelete(track),
  });

  if (playlist) return (
    <ReorderableList data={tracks} keyExtractor={t => t.id} contentContainerStyle={s.list} ListEmptyComponent={empty}
      onReorder={({ from, to }) => onReorder(from, to)}
      renderItem={({ item }): ReactElement => <EnterAnimation delay={entranceDelay(item.id)}><DraggableTrackCard {...card(item)} dragEnabled={!busy} /></EnterAnimation>} />
  );
  return (
    <FlatList data={tracks} keyExtractor={t => t.id} contentContainerStyle={s.list} ListEmptyComponent={empty}
      renderItem={({ item }) => <EnterAnimation delay={entranceDelay(item.id)}><TrackCard {...card(item)} /></EnterAnimation>} />
  );
}
