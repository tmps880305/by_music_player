import { useReorderableDrag } from 'react-native-reorderable-list';
import { useTouchDragGuard } from './useTouchDragGuard';

// Long-press-to-drag for a ReorderableList cell: put `ref` on the cell's outer View and `onLongPress` on its Pressable.
// Must be called inside a ReorderableList cell component.
export function useLongPressDrag(enabled: boolean) {
  const drag = useReorderableDrag();
  const guard = useTouchDragGuard();
  return { ref: guard.ref, onLongPress: enabled ? () => { guard.arm(); drag(); } : undefined };
}
