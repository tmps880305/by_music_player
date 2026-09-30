import { Pressable, Text } from 'react-native';
import { colors, s } from '../theme';

// filled: solid accent button for a primary action; otherwise a plain text button.
type Props = { title: string; onPress: () => void; disabled?: boolean; danger?: boolean; filled?: boolean };

export default function Button({ title, onPress, disabled = false, danger = false, filled = false }: Props) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} onPress={onPress} disabled={disabled} style={({ pressed }) => [filled ? s.filledButton : s.button, pressed && { opacity: .7 }, disabled && { opacity: .35 }]}>
      <Text style={{ color: filled ? colors.background : danger ? colors.danger : colors.accent, fontWeight: '600' }}>{title}</Text>
    </Pressable>
  );
}
