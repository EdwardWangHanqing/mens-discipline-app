import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { colors } from '../theme/designSystem';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const outerPath = 'M18 82 L50 16 L82 82';
const innerPath = 'M82 82 C68 80 66 58 50 58 C34 58 32 80 18 82';

export function VaelMark({
  size = 96,
  color = colors.accent,
  strokeWidth = 3,
  opacity = 1,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
  opacity?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="VAEL mark">
      <Path d={outerPath} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" opacity={opacity} />
      <Path d={innerPath} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" opacity={opacity} />
    </Svg>
  );
}

export function BrandLaunchOverlay({
  onReady,
  onFinished,
}: {
  onReady: () => void;
  onFinished: () => void;
}) {
  const outerDraw = useSharedValue(1);
  const innerDraw = useSharedValue(1);
  const glow = useSharedValue(0);
  const scale = useSharedValue(0.98);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      onReady();
      outerDraw.value = withDelay(150, withTiming(0, { duration: 350, easing: Easing.inOut(Easing.cubic) }));
      innerDraw.value = withDelay(250, withTiming(0, { duration: 250, easing: Easing.out(Easing.cubic) }));
      glow.value = withDelay(500, withSequence(
        withTiming(0.42, { duration: 75, easing: Easing.out(Easing.quad) }),
        withTiming(0.08, { duration: 75, easing: Easing.in(Easing.quad) })
      ));
      scale.value = withDelay(650, withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) }));
      opacity.value = withDelay(
        650,
        withTiming(0, { duration: 200, easing: Easing.inOut(Easing.quad) }, (finished) => {
          if (finished) runOnJS(onFinished)();
        })
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [glow, innerDraw, onFinished, onReady, opacity, outerDraw, scale]);

  const outerProps = useAnimatedProps(() => ({ strokeDashoffset: outerDraw.value * 148 }));
  const innerProps = useAnimatedProps(() => ({ strokeDashoffset: innerDraw.value * 96 }));
  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const markStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: glow.value,
  }));

  return (
    <Animated.View style={[styles.launchOverlay, overlayStyle]} pointerEvents="none">
      <Animated.View style={[styles.launchMark, markStyle]}>
        <Svg width={174} height={174} viewBox="0 0 100 100">
          <Path d={outerPath} fill="none" stroke={colors.accent} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.16} />
          <Path d={innerPath} fill="none" stroke={colors.accent} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.16} />
          <AnimatedPath d={outerPath} strokeDasharray={[148, 148]} animatedProps={outerProps} fill="none" stroke={colors.accent} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          <AnimatedPath d={innerPath} strokeDasharray={[96, 96]} animatedProps={innerProps} fill="none" stroke={colors.accent} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  launchOverlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brandGraphite,
  },
  launchMark: {
    width: 174,
    height: 174,
    shadowColor: colors.accent,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
});
