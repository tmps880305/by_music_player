import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, View } from 'react-native';
import { s } from '../theme';

const DURATION_MS = 300;

// Page heading that swaps text like sliding cards: when `text` changes, the old heading slides out and the new one
// slides in from the other side. `direction` 1 brings the new text in from the right (moving to a tab on the right),
// -1 from the left. The first render and Reduce Motion show the text without animating.
export default function SlidingHeading({ text, direction }: { text: string; direction: 1 | -1 }) {
  const [shown, setShown] = useState(text);
  const [previous, setPrevious] = useState<string | null>(null);
  const [width, setWidth] = useState(0);
  const progress = useRef(new Animated.Value(1)).current;
  const reduceMotion = useRef(false);
  useEffect(() => { AccessibilityInfo.isReduceMotionEnabled().then(v => { reduceMotion.current = v; }).catch(() => {}); }, []);

  useEffect(() => {
    if (text === shown) return;
    if (reduceMotion.current || !width) { setShown(text); return; }
    setPrevious(shown); setShown(text);
    progress.setValue(0);
    const slide = Animated.timing(progress, { toValue: 1, duration: DURATION_MS, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' });
    slide.start(({ finished }) => { if (finished) setPrevious(null); });
    return () => slide.stop();
  }, [text]);

  const incoming = {
    opacity: progress,
    transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [direction * width, 0] }) }],
  };
  const outgoing = {
    opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
    transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -direction * width] }) }],
  };
  return (
    <View style={s.slidingHeading} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
      <Animated.Text style={[s.heading, s.slidingHeadingText, incoming]}>{shown}</Animated.Text>
      {previous !== null && <Animated.Text style={[s.heading, s.slidingHeadingText, s.slidingHeadingOld, outgoing]}>{previous}</Animated.Text>}
    </View>
  );
}
