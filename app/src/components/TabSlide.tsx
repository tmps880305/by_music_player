import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, View } from 'react-native';
import { s } from '../theme';

const DURATION_MS = 300;

// Page container that slides pages sideways when `pageKey` changes between two keys in `animateBetween` (the tabs):
// the old page slides out while the new one slides in beside it, like cards pushed along. `direction` 1 means the new
// page comes from the right. Other key changes (opening a playlist, loading) swap instantly. The old page keeps its
// component instance (and scroll position) while it slides out, and ignores touches.
type Props = { pageKey: string; direction: 1 | -1; animateBetween: string[]; children: ReactNode };

export default function TabSlide({ pageKey, direction, animateBetween, children }: Props) {
  const [width, setWidth] = useState(0);
  const [shownKey, setShownKey] = useState(pageKey);
  const [previous, setPrevious] = useState<{ key: string; node: ReactNode } | null>(null);
  const lastNode = useRef(children);
  const progress = useRef(new Animated.Value(1)).current;
  const pendingStart = useRef(false);
  const reduceMotion = useRef(false);
  useEffect(() => { AccessibilityInfo.isReduceMotionEnabled().then(v => { reduceMotion.current = v; }).catch(() => {}); }, []);

  // Detect the page change during render so the first frame of the new page already has the old one beside it.
  if (pageKey !== shownKey) {
    const animate = !!width && !reduceMotion.current && animateBetween.includes(shownKey) && animateBetween.includes(pageKey);
    setShownKey(pageKey);
    setPrevious(animate ? { key: shownKey, node: lastNode.current } : null);
    if (animate) { progress.setValue(0); pendingStart.current = true; }
  } else lastNode.current = children;

  useEffect(() => {
    if (!pendingStart.current) return;
    pendingStart.current = false;
    const slide = Animated.timing(progress, { toValue: 1, duration: DURATION_MS, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' });
    slide.start(({ finished }) => { if (finished) setPrevious(null); });
    return () => slide.stop();
  }, [shownKey]);

  const offset = (from: number, to: number) => ({ transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [from, to] }) }] });
  return (
    <View style={s.tabSlide} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
      {previous && <Animated.View key={previous.key} style={[s.tabSlidePage, s.tabSlideLeaving, offset(0, -direction * width)]}>{previous.node}</Animated.View>}
      <Animated.View key={pageKey} style={[s.tabSlidePage, previous && offset(direction * width, 0)]}>{children}</Animated.View>
    </View>
  );
}
