import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, View } from 'react-native';
import { colors, s } from '../theme';

export type Rect = { x: number; y: number; width: number; height: number };
// Window-coordinate rects of the tapped playlist card and its title text.
export type TransitionSource = { card: Rect; title: Rect };

const DURATION_MS = 450;
// Card title and playlist heading font sizes (s.title, s.heading); the moving title scales between them.
const TITLE_SIZE = 17;
const HEADING_SIZE = 27;

// Overlay for opening a playlist: a copy of the tapped card grows and fades while its title glides into the playlist
// page's heading position, growing to heading size. It covers the screen (touches pass through) and calls onDone
// once the title has landed. `target` is the heading's window rect, measured once the playlist page has laid out.
export default function PlaylistTransition({ name, from, target, onDone }: { name: string; from: TransitionSource; target: Rect | null; onDone: () => void }) {
  const layer = useRef<View>(null);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const progress = useRef(new Animated.Value(0)).current;
  // Safety net: if the heading can't be measured, don't leave the page hidden behind the overlay.
  useEffect(() => { const timer = setTimeout(onDone, 1200); return () => clearTimeout(timer); }, []);
  useEffect(() => {
    if (!origin || !target) return;
    const run = Animated.timing(progress, { toValue: 1, duration: DURATION_MS, easing: Easing.inOut(Easing.cubic), useNativeDriver: Platform.OS !== 'web' });
    run.start(({ finished }) => { if (finished) onDone(); });
    return () => run.stop();
  }, [origin, target]);

  // Rects are in window coordinates; convert them to this layer's coordinates.
  const at = (r: Rect) => origin ? { left: r.x - origin.x, top: r.y - origin.y, width: r.width, height: r.height } : { opacity: 0 };
  const card = { opacity: progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 0, 0] }), transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] };
  const dx = target ? target.x - from.title.x : 0;
  const dy = target ? target.y - from.title.y : 0;
  const title = {
    transformOrigin: 'left top',
    transform: [
      { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, dx] }) },
      { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, dy] }) },
      { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, HEADING_SIZE / TITLE_SIZE] }) },
    ],
  };
  return (
    <View ref={layer} style={s.transitionLayer} onLayout={() => layer.current?.measureInWindow((x, y) => setOrigin({ x, y }))}>
      <Animated.View style={[s.transitionCard, at(from.card), card]} />
      <Animated.Text style={[s.title, s.transitionTitle, at(from.title), title]} numberOfLines={1}>{name}</Animated.Text>
    </View>
  );
}
