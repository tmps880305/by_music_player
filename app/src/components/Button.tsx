import { Pressable, Text } from 'react-native';
import { colors, s } from '../theme';

type Props = { title: string; onPress: () => void; disabled?: boolean; danger?: boolean };

export default function Button({ title, onPress, disabled = false, danger = false }: Props) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} onPress={onPress} disabled={disabled} style={[s.button, disabled && { opacity: .35 }]}>
      <Text style={{ color: danger ? colors.danger : colors.accent, fontWeight: '600' }}>{title}</Text>
    </Pressable>
  );
}
