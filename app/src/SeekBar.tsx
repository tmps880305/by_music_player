import Slider from '@react-native-community/slider';
import type { SeekBarProps } from './SeekBar.types';
import { colors } from './theme';
export default function SeekBar(p: SeekBarProps) {
  return <Slider accessibilityLabel="播放進度" style={{ width: '100%', height: 44 }} minimumValue={0} maximumValue={p.maximum || 1} value={p.value} disabled={p.disabled} step={0.1} minimumTrackTintColor={colors.accent} maximumTrackTintColor={colors.border} thumbTintColor={colors.accent} onSlidingStart={p.onPreview} onValueChange={p.onPreview} onSlidingComplete={p.onCommit} tapToSeek />;
}
