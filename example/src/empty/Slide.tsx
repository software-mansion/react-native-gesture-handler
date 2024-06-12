import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withDecay,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface SlideProps {
  dataSource: any;
  renderItem: (index: number) => React.JSX.Element;
  numberClone?: number;
  widthItem?: number;
  spacingItem?: number;
  durationLoop?: number;
  style?: ViewStyle;
}

const Slide = ({
  dataSource,
  renderItem,
  numberClone = 5,
  widthItem = 100,
  spacingItem = 16,
  durationLoop = 20000,
  style,
}: SlideProps) => {
  const translateX = useSharedValue(0);
  const prevTranslationX = useSharedValue(0);
  const lengthDataSource = useMemo(() => dataSource.length, [dataSource]);
  const dataSourceClone = useMemo(
    () => dataSource.concat(dataSource.slice(0, numberClone)),
    [dataSource, numberClone]
  );
  const limitUpperBound = useMemo(
    () => -lengthDataSource * widthItem - spacingItem * lengthDataSource,
    [lengthDataSource, widthItem, spacingItem]
  );

  const loop = useCallback(
    (delay: number) => {
      translateX.value = withDelay(
        delay,
        withTiming(limitUpperBound, {
          duration:
            ((limitUpperBound - translateX.value) * durationLoop) /
            limitUpperBound,
          easing: Easing.linear,
        })
      );
    },
    [limitUpperBound, durationLoop, translateX]
  );

  useDerivedValue(() => {
    if (translateX.value <= limitUpperBound + 2) {
      translateX.value = 0;
      runOnJS(loop)(0);
    }
  }, [loop]);

  const panGesture = Gesture.Pan()
    .onTouchesDown(() => {
      cancelAnimation(translateX);
      if (translateX.value < limitUpperBound + width / 2) {
        translateX.value = 0;
      } else if (
        translateX.value > limitUpperBound + width / 2 &&
        translateX.value < limitUpperBound + width
      ) {
        translateX.value = limitUpperBound + width;
      }
    })
    .onStart(() => {
      prevTranslationX.value = translateX.value;
    })
    .onUpdate(({ translationX }) => {
      translateX.value = clamp(
        prevTranslationX.value + translationX,
        limitUpperBound + width,
        0
      );
    })
    .onFinalize((event) => {
      translateX.value = withDecay(
        {
          velocity: event.velocityX,
          clamp: [limitUpperBound + width, 0],
        },
        (finished) => {
          if (finished) {
            runOnJS(loop)(4000);
          }
        }
      );
    });

  useEffect(() => {
    loop(1000);
  }, [loop]);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.container,
          style,
          {
            gap: spacingItem,
            transform: [
              {
                translateX,
              },
            ],
          },
        ]}>
        {dataSourceClone.map((index: number) => (
          <View key={index} style={{ width: widthItem }} collapsable={false}>
            {renderItem(index)}
          </View>
        ))}
      </Animated.View>
    </GestureDetector>
  );
};

export default memo(Slide);

const clamp = (value: number, lowerBound: number, upperBound: number) => {
  'worklet';
  return Math.min(Math.max(lowerBound, value), upperBound);
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
});
