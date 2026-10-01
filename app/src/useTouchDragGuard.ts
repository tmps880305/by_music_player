import { useRef } from 'react';
import type { View } from 'react-native';

// Native gesture handling already keeps a dragged item from scrolling the list; see the .web version.
export function useTouchDragGuard() {
  return { ref: useRef<View>(null), arm: () => {} };
}
