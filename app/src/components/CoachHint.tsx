import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, Text, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, s } from '../theme';

// Onboarding hint: a hand-drawn arrow pointing up at a control, with text below it. Rendered inside an absolutely
// positioned layer; `arrowStyle` and `textStyle` place the two parts (see the coach* styles in theme.ts).
// Both arrows share the style (2pt hand-drawn stroke, one loop, open arrowhead) but differ in path.
export type CoachArrow = { shaft: string; head: string; width: number; height: number };
// A slightly leaning line with one loop on its left midway, then straight up. Tip at (90.5, 3).
export const loopUpArrow: CoachArrow = {
  shaft: 'M 86 56 C 88 48, 90 44, 90 38 C 90 31, 79 28, 78 34 C 77 41, 88 41, 90 32 C 91 25, 90.5 13, 90.5 4',
  head: 'M 84.5 11 L 90.5 3 L 96.5 11', width: 110, height: 58,
};
// Exponential-looking curve: a short run up-left from the lower right (tail angled slightly down-right) that turns up sharply, with one
// loop on the right just past the bend. Tip at (18, 9).
export const riseLeftArrow: CoachArrow = {
  shaft: 'M 62 78 C 54 74, 40 71, 30 66 C 22 62, 20 57, 20 53 C 20 45, 34 43, 34 50 C 34 57, 21 57, 20 48 C 19 38, 18 26, 18 10',
  head: 'M 12 17 L 18 9 L 24 17', width: 64, height: 80,
};
// The arrow bobs slowly: down and back up, since moving above its resting spot could clip the tip at the list's top.
// Skipped when the user has Reduce Motion on.
const BOB_DISTANCE = 4;
const BOB_DURATION = 900;

function useBob() {
  const offset = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const step = (toValue: number) => Animated.timing(offset, {
      toValue, duration: BOB_DURATION, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web',
    });
    const bob = Animated.loop(Animated.sequence([step(BOB_DISTANCE), step(0)]));
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(reduce => { if (!reduce && !cancelled) bob.start(); })
      .catch(() => { if (!cancelled) bob.start(); });
    return () => { cancelled = true; bob.stop(); };
  }, [offset]);
  return offset;
}

type Props = { text: string; arrow: CoachArrow; arrowStyle: StyleProp<ViewStyle>; textStyle: StyleProp<TextStyle> };

export default function CoachHint({ text, arrow, arrowStyle, textStyle }: Props) {
  const bob = useBob();
  return <>
    <Animated.View style={[arrowStyle, { transform: [{ translateY: bob }] }]}>
      <Svg width={arrow.width} height={arrow.height} viewBox={`0 0 ${arrow.width} ${arrow.height}`}>
        <Path d={arrow.shaft} stroke={colors.accent} strokeWidth={2} fill="none" strokeLinecap="round" />
        <Path d={arrow.head} stroke={colors.accent} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </Animated.View>
    <Text style={[s.coachText, textStyle]}>{text}</Text>
  </>;
}
