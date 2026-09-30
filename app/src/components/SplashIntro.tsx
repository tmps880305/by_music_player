import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import * as SplashScreen from 'expo-splash-screen';
import { setStatusBarStyle } from 'expo-status-bar';
import { colors, s } from '../theme';

// Keep the native launch screen up until this intro has drawn its first frame, so there's no visible hand-off.
SplashScreen.preventAutoHideAsync().catch(() => {});

// Must match expo-splash-screen's backgroundColor in app.json: the native launch screen shows this solid colour,
// and the intro starts from it before fading in the icon's gradient.
export const SPLASH_BACKGROUND = '#E5E8E2';
const ICON_TOP = '#FBEBD2';
const ICON_BOTTOM = '#CFE6F2';
const useNative = Platform.OS !== 'web';

// Opening intro over the app: the app icon's light gradient, the blue "ByPlayer" wordmark rising into the centre,
// then a flickering "lights off" into the app's dark background, and a fade that reveals the app underneath.
// With Reduce Motion it skips the rise and flicker. Calls onDone when finished.
export default function SplashIntro({ onDone }: { onDone: () => void }) {
  const gradient = useRef(new Animated.Value(0)).current;
  const wordmark = useRef(new Animated.Value(0)).current;
  const dark = useRef(new Animated.Value(0)).current;
  const layer = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setStatusBarStyle('dark');
    const to = (value: Animated.Value, toValue: number, duration: number, easing = Easing.inOut(Easing.quad)) =>
      Animated.timing(value, { toValue, duration, easing, useNativeDriver: useNative });
    let intro: Animated.CompositeAnimation | undefined;
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().catch(() => false).then(reduce => {
      if (cancelled) return;
      const lightsOff = reduce
        ? to(dark, 1, 400)
        // A failing fluorescent tube: two quick dips and recoveries, then off.
        : Animated.sequence([to(dark, 0.55, 90), to(dark, 0.15, 110), to(dark, 0.8, 80), to(dark, 0.45, 120), to(dark, 1, 380, Easing.in(Easing.quad))]);
      intro = Animated.sequence([
        Animated.parallel([
          to(gradient, 1, 250),
          reduce ? to(wordmark, 1, 300) : Animated.sequence([Animated.delay(150), to(wordmark, 1, 700, Easing.out(Easing.cubic))]),
        ]),
        Animated.delay(500),
        lightsOff,
        to(layer, 0, 250),
      ]);
      intro.start(({ finished }) => { if (finished) onDone(); });
    });
    // Switch the status bar to light text as the lights go out (the app below is dark).
    const listener = dark.addListener(({ value }) => { if (value > 0.9) setStatusBarStyle('light'); });
    return () => { cancelled = true; intro?.stop(); dark.removeListener(listener); setStatusBarStyle('light'); };
  }, []);

  return (
    <Animated.View style={[s.splash, { backgroundColor: SPLASH_BACKGROUND, opacity: layer }]} onLayout={() => SplashScreen.hide()}>
      <Animated.View style={[s.splashFill, { opacity: gradient }]}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="icon" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={ICON_TOP} />
              <Stop offset="1" stopColor={ICON_BOTTOM} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#icon)" />
        </Svg>
      </Animated.View>
      <Animated.Text style={[s.splashWordmark, {
        opacity: wordmark,
        transform: [{ translateY: wordmark.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }],
      }]}>ByPlayer</Animated.Text>
      <Animated.View style={[s.splashFill, { backgroundColor: colors.background, opacity: dark }]} />
    </Animated.View>
  );
}
