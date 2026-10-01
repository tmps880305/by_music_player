import { useState, type ReactElement } from 'react';
import type { LayoutChangeEvent } from 'react-native';
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
  // Playlist only: onboarding text shown with an arrow pointing at the second song (needs at least two songs).
  dragHint?: string;
};

// Match s.list's padding and s.item's marginBottom.
const LIST_PADDING = 18;
const CARD_GAP = 10;

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
function DraggableTrackCard({ dragEnabled, onLayout, ...props }: Omit<CardProps, 'onLongPress'> & { dragEnabled: boolean; onLayout?: (e: LayoutChangeEvent) => void }) {
  const drag = useLongPressDrag(dragEnabled);
  return <View ref={drag.ref} onLayout={onLayout}><TrackCard {...props} onLongPress={drag.onLongPress} /></View>;
}

export default function TrackList({ tracks, playlist, activeId, busy, emptyText, emptyAction, onPlay, onReorder, onRemove, onDelete, animateOnMount = false, dragHint }: Props) {
  // Heights of the first two playlist cards, to place the drag hint under the second one.
  const [cardHeights, setCardHeights] = useState<number[]>([]);
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

  // The drag hint sits in a layer above the list. Its arrow tip (y 3 in its box) lands halfway down the second card:
  // list top padding + first card + its 10pt margin + half the second card (layout heights, unaffected by entrance
  // animations).
  const [first, second] = cardHeights;
  const hintTop = first && second ? LIST_PADDING + first + CARD_GAP + second / 2 - 3 : null;
  const measure = (index: number) => index < 2
    ? (e: LayoutChangeEvent) => { const height = e.nativeEvent.layout.height; setCardHeights(h => { const next = [...h]; next[index] = height; return next; }); }
    : undefined;

  if (playlist) return (
    <View style={{ flex: 1 }}>
      <ReorderableList data={tracks} keyExtractor={t => t.id} contentContainerStyle={s.list} ListEmptyComponent={empty}
        onReorder={({ from, to }) => onReorder(from, to)}
        renderItem={({ item, index }): ReactElement => <EnterAnimation delay={entranceDelay(item.id)}><DraggableTrackCard {...card(item)} dragEnabled={!busy} onLayout={measure(index)} /></EnterAnimation>} />
      {dragHint && tracks.length >= 2 && hintTop !== null && <View style={s.coachLayer}>
        <CoachHint text={dragHint} arrow={loopUpArrow} arrowStyle={[s.coachArrowToDrag, { top: hintTop }]} textStyle={[s.coachTextToDrag, { top: hintTop + 70 }]} />
      </View>}
    </View>
  );
  return (
    <FlatList data={tracks} keyExtractor={t => t.id} contentContainerStyle={s.list} ListEmptyComponent={empty}
      renderItem={({ item }) => <EnterAnimation delay={entranceDelay(item.id)}><TrackCard {...card(item)} /></EnterAnimation>} />
  );
}
