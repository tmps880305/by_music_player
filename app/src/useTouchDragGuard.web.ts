import { useEffect, useRef } from 'react';
import type { View } from 'react-native';

// On touch screens the browser takes the finger over for scrolling (pointercancel) as soon as it moves, which cancels
// a long-press drag. Once armed, touchmove is prevented until the finger lifts, so the drag keeps the gesture.
export function useTouchDragGuard() {
  const ref = useRef<View>(null);
  const armed = useRef(false);
  useEffect(() => {
    const node = ref.current as unknown as HTMLElement | null;
    if (!node) return;
    const block = (e: TouchEvent) => { if (armed.current) e.preventDefault(); };
    const release = () => { armed.current = false; };
    node.addEventListener('touchmove', block, { passive: false });
    node.addEventListener('touchend', release);
    node.addEventListener('touchcancel', release);
    return () => {
      node.removeEventListener('touchmove', block);
      node.removeEventListener('touchend', release);
      node.removeEventListener('touchcancel', release);
    };
  }, []);
  return { ref, arm: () => { armed.current = true; } };
}
