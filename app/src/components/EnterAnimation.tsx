import { useEffect, useRef, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform } from 'react-native';

// Entrance for list items added while the list is on screen (imports, adding songs to a playlist): items that were
// already there on first render appear as-is; each newly seen item gets a delay so a batch appears one by one.
const STAGGER_MS = 80;
const DURATION_MS = 320;
const DROP = 16;

// animateInitial: also stagger the items present on first render (e.g. revealing a list after a transition).
export function useEntranceDelays(ids: string[], animateInitial = false) {
  const seen = useRef<Set<string> | null>(null);
  const delays = useRef(new Map<string, number>());
  // When the last scheduled entrance starts; items arriving in quick succession (fast imports save one by one) are
  // spaced at least STAGGER_MS apart so they still appear one by one.
  const lastStart = useRef(0);
  const first = !seen.current;
  if (!seen.current) seen.current = new Set(animateInitial ? [] : ids);
  if (!first || animateInitial) {
    const added = ids.filter(id => !seen.current!.has(id));
    if (added.length) {
      const now = Date.now();
      // A new batch replaces the previous one's delays (read-only in render, so re-renders before mount are safe).
      delays.current = new Map(added.map(id => {
        const start = Math.max(now, lastStart.current + STAGGER_MS);
        lastStart.current = start;
        return [id, start - now];
      }));
      for (const id of added) seen.current.add(id);
    }
  }
  return (id: string) => delays.current.get(id);
}

// Fades in while dropping into place from slightly above, after `delay` ms. With no delay it renders plainly.
export default function EnterAnimation({ delay, children }: { delay: number | undefined; children: ReactNode }) {
  const progress = useRef(new Animated.Value(delay === undefined ? 1 : 0)).current;
  useEffect(() => {
    if (delay === undefined) return;
    let cancelled = false;
    const enter = Animated.timing(progress, { toValue: 1, delay, duration: DURATION_MS, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' });
    AccessibilityInfo.isReduceMotionEnabled()
      .then(reduce => { if (cancelled) return; if (reduce) progress.setValue(1); else enter.start(); })
      .catch(() => progress.setValue(1));
    return () => { cancelled = true; enter.stop(); };
  }, []);
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [-DROP, 0] });
  return <Animated.View style={{ opacity: progress, transform: [{ translateY }] }}>{children}</Animated.View>;
}
