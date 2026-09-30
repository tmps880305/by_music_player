import { Pressable, Text } from 'react-native';
import { colors, s } from '../theme';

// filled: solid accent button for a primary action; outline: bordered secondary button; otherwise a plain text button.
// compact: shorter filled/outline button whose 44pt tap target is kept with hitSlop.
type Props = { title: string; onPress: () => void; disabled?: boolean; danger?: boolean; filled?: boolean; outline?: boolean; compact?: boolean };

export default function Button({ title, onPress, disabled = false, danger = false, filled = false, outline = false, compact = false }: Props) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} onPress={onPress} disabled={disabled} hitSlop={compact ? 3 : undefined} style={({ pressed }) => [filled ? s.filledButton : outline ? s.outlineButton : s.button, compact && s.compactButton, pressed && { opacity: .7 }, disabled && { opacity: .35 }]}>
      <Text style={{ color: filled ? colors.background : danger ? colors.danger : colors.accent, fontWeight: '600' }}>{title}</Text>
    </Pressable>
  );
}
