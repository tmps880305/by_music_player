import type { ComponentProps } from 'react';
import { Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, s } from '../theme';

type Props = { icon: ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void; disabled?: boolean; size?: number };

export default function IconButton({ icon, label, onPress, disabled = false, size = 28 }: Props) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} onPress={onPress} disabled={disabled} hitSlop={8} style={[s.iconButton, disabled && { opacity: .35 }]}>
      <Ionicons name={icon} size={size} color={colors.accent} />
    </Pressable>
  );
}
