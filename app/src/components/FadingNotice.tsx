import { useEffect, useRef, useState } from 'react';
import { Animated, Platform } from 'react-native';
import { s } from '../theme';

// Status line that stays for `holdMs`, then fades out and removes itself. Give it a new `key` for each notice so a
// repeated message starts over.
export default function FadingNotice({ text, holdMs }: { text: string; holdMs: number }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const fade = Animated.sequence([
      Animated.delay(holdMs),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
    ]);
    fade.start(({ finished }) => { if (finished) setGone(true); });
    return () => fade.stop();
  }, [holdMs, opacity]);
  if (gone) return null;
  return <Animated.Text style={[s.muted, { opacity }]} accessibilityLiveRegion="polite">{text}</Animated.Text>;
}
