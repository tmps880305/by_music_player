import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, Pressable, Text } from 'react-native';
import { colors, s } from '../theme';

// filled: solid accent button for a primary action; outline: bordered secondary button; otherwise a plain text button.
// compact: shorter filled/outline button whose 44pt tap target is kept with hitSlop.
// label: what VoiceOver/TalkBack reads when the visible title alone is terse.
// selected: marks the current tab with an underline.
type Props = { title: string; label?: string; selected?: boolean; onPress: () => void; disabled?: boolean; danger?: boolean; filled?: boolean; outline?: boolean; compact?: boolean };

// Current-tab underline: draws in from left to right each time a tab becomes selected (instant with Reduce Motion).
function TabUnderline() {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(reduce => {
        if (cancelled) return;
        if (reduce) progress.setValue(1);
        else Animated.timing(progress, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }).start();
      })
      .catch(() => progress.setValue(1));
    return () => { cancelled = true; };
  }, [progress]);
  return <Animated.View style={[s.tabUnderline, { transformOrigin: 'left', transform: [{ scaleX: progress }] }]} />;
}

export default function Button({ title, label, selected, onPress, disabled = false, danger = false, filled = false, outline = false, compact = false }: Props) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled, selected }} onPress={onPress} disabled={disabled} hitSlop={compact ? 3 : undefined} style={({ pressed }) => [filled ? s.filledButton : outline ? s.outlineButton : s.button, compact && s.compactButton, pressed && { opacity: .7 }, disabled && { opacity: .35 }]}>
      <Text style={{ color: filled ? colors.background : danger ? colors.danger : colors.accent, fontWeight: '600' }}>{title}</Text>
      {selected && <TabUnderline />}
    </Pressable>
  );
}
