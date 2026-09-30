import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing, Platform, View } from 'react-native';
import { s } from '../theme';

const DURATION_MS = 550;

// "Turning a page back" effect for leaving a page: `children` is a still copy of the page being left, laid over the
// page underneath. It swings up from left to right around its right edge (like a book's spine) toward the viewer until it's edge-on,
// darkening as it turns, while a shadow on the page underneath lifts. Touches pass through. Calls onDone when finished.
export default function PageFlip({ children, onDone }: { children: ReactNode; onDone: () => void }) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const turn = Animated.timing(progress, { toValue: 1, duration: DURATION_MS, easing: Easing.inOut(Easing.cubic), useNativeDriver: Platform.OS !== 'web' });
    turn.start(({ finished }) => { if (finished) onDone(); });
    return () => turn.stop();
  }, []);
  const rotateY = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });
  return (
    <View style={s.flipLayer}>
      <Animated.View style={[s.flipShadow, { opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] }) }]} />
      <Animated.View style={[s.flipPage, { transformOrigin: 'right', transform: [{ perspective: 1000 }, { rotateY }] }]}>
        {children}
        <Animated.View style={[s.flipShadow, { opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }) }]} />
      </Animated.View>
    </View>
  );
}
