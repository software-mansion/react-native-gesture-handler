import * as React from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import {
  GestureDetector,
  GestureStateManager,
  usePanGesture,
  useTapGesture,
} from 'react-native-gesture-handler';

import { COLORS } from './colors';
import Animated, {
  setNativeProps,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Svg, Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SVG_RADIUS = 40;
const SVG_STROKE_WIDTH = 10;

export default function Slider() {
  const dragX = useSharedValue(0);
  const progress = useSharedValue(0);
  const checkpointOpacity = useSharedValue(1);
  const knobScale = useSharedValue(1);
  const checkpointPassed = useSharedValue(false);
  const endReached = useSharedValue(false);

  const pan = usePanGesture({
    onUpdate: (event) => {
      'worklet';
      dragX.value = Math.min(Math.max(event.changeX + dragX.value, 0), 300);

      if (!checkpointPassed.value && dragX.value >= 160) {
        GestureStateManager.fail(event.handlerTag);
      } else if (
        !checkpointPassed.value &&
        dragX.value > 140 &&
        dragX.value < 160
      ) {
        progress.value = withTiming(1, { duration: 2000 }, () => {
          'worklet';
          if (progress.value === 1) {
            checkpointPassed.value = true;
            checkpointOpacity.value = withTiming(0, { duration: 200 });
          }
        });
      } else if (!checkpointPassed.value && dragX.value <= 140) {
        progress.value = withTiming(0, { duration: 300 });
      } else if (dragX.value >= 300) {
        endReached.value = true;
        GestureStateManager.deactivate(event.handlerTag);
        knobScale.value = withTiming(
          1.2,
          { duration: 200, easing: Easing.out(Easing.ease) },
          () => {
            'worklet';
            knobScale.value = withTiming(1, {
              duration: 200,
              easing: Easing.in(Easing.ease),
            });
          }
        );
      }
    },
    onFinalize: () => {
      'worklet';
      if (checkpointPassed.value) {
        progress.value = 0;
        if (!endReached.value) {
          dragX.value = withTiming(0, { duration: 300 });
        } else {
          dragX.value = 300;
        }
      } else {
        checkpointOpacity.value = withTiming(1, { duration: 200 });
        progress.value = withTiming(0, { duration: 300 });
        dragX.value = withTiming(0, { duration: 300 });
        endReached.value = false;
      }

      checkpointPassed.value = false;
    },
  });

  const style = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: dragX.value }, { scale: knobScale.value }],
      backgroundColor: endReached.value
        ? COLORS.KINDA_GREEN
        : COLORS.KINDA_BLUE,
    };
  });

  const animatedProps = useAnimatedProps(() => {
    const svgProgress = 100 - progress.value * 100;
    return {
      strokeDashoffset: SVG_RADIUS * Math.PI * 2 * (svgProgress / 100),
    };
  });

  const checkpointStyle = useAnimatedStyle(() => {
    return {
      opacity: checkpointOpacity.value,
    };
  });

  const checkmarkStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(endReached.value ? 1 : 0, { duration: 200 }),
    };
  });

  const toFillPartStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(
        checkpointPassed.value || endReached.value ? COLORS.NAVY : 'lightgray',
        { duration: 200 }
      ),
    };
  });

  const text1Style = useAnimatedStyle(() => {
    return {
      opacity: withTiming(endReached.value ? 0 : 1, { duration: 200 }),
    };
  });

  const text2Style = useAnimatedStyle(() => {
    return {
      opacity: withTiming(endReached.value ? 1 : 0, { duration: 200 }),
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={text1Style}>
        <Text style={{ fontSize: 18 }}>Please confirm database deletion</Text>
      </Animated.View>
      <Animated.View style={[styles.slider, toFillPartStyle]}>
        <Animated.View style={[styles.filledPart]} />
        <Animated.View
          style={[
            {
              width: 30,
              height: 30,
              borderRadius: 15,
            },
            checkpointStyle,
          ]}>
          <Svg
            style={{
              transform: [{ rotate: '-90deg' }],
              width: SVG_RADIUS * 2,
              height: SVG_RADIUS * 2,
              position: 'absolute',
              top: -SVG_RADIUS + 15,
              left: -SVG_RADIUS + 15,
            }}>
            <AnimatedCircle
              cx={SVG_RADIUS}
              cy={SVG_RADIUS}
              r={SVG_RADIUS - SVG_STROKE_WIDTH / 2}
              stroke={'lightgray'}
              strokeLinecap="round"
              fill={'transparent'}
              strokeDasharray={`0`}
              strokeWidth={SVG_STROKE_WIDTH}
              animatedProps={animatedProps}
            />
            <AnimatedCircle
              cx={SVG_RADIUS}
              cy={SVG_RADIUS}
              r={SVG_RADIUS - SVG_STROKE_WIDTH / 2}
              stroke={COLORS.KINDA_RED}
              strokeLinecap="round"
              fill={'transparent'}
              strokeDasharray={`${SVG_RADIUS * Math.PI * 2} ${SVG_RADIUS * Math.PI * 2}`}
              strokeWidth={SVG_STROKE_WIDTH}
              animatedProps={animatedProps}
            />
          </Svg>
        </Animated.View>
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              {
                width: 50,
                height: 50,
                borderRadius: 25,
                position: 'absolute',
                left: 5,
                top: 5,
              },
              style,
            ]}>
            <Animated.View
              style={[
                {
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                checkmarkStyle,
              ]}>
              <Text style={{ color: 'black', fontSize: 24 }}>✓</Text>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </Animated.View>
      <Animated.View style={text2Style}>
        <Text style={{ fontSize: 18 }}>Database deleted!</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  slider: {
    width: 360,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filledPart: {
    position: 'absolute',
    left: 0,
    width: 220,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.NAVY,
  },
});
