import React, { useRef } from 'react';
import { View, Insets, StyleSheet } from 'react-native';
import GestureHandlerRootView from '../components/GestureHandlerRootView';
import { GestureObjects as Gesture } from '../handlers/gestures/gestureObjects';
import { GestureDetector } from '../handlers/gestures/GestureDetector';
import { TouchData } from '../handlers/gestureHandlerCommon';
import { PressableProps } from './PressableProps';

const DEFAULT_LONG_PRESS_DURATION = 500;
const DEFAULT_HOVER_DELAY = 0;

function touchWithinBounds(
  touch: TouchData,
  offsets: Insets,
  dimensions: Insets
): boolean {
  const isLeftbound =
    offsets.left && dimensions.left
      ? touch.absoluteX > dimensions.left - offsets.left
      : true;
  const isRightbound =
    offsets.right && dimensions.right
      ? touch.absoluteX < dimensions.right + offsets.right
      : true;
  const isBottombound =
    offsets.bottom && dimensions.bottom
      ? touch.absoluteY > dimensions.bottom - offsets.bottom
      : true;
  const isTopbound =
    offsets.top && dimensions.top
      ? touch.absoluteY < dimensions.top + offsets.top
      : true;

  return isLeftbound && isRightbound && isTopbound && isBottombound;
}

const calculateEvenBounds = (distance: number) => ({
  bottom: distance,
  top: distance,
  left: distance,
  right: distance,
});

export default function Pressable(props: PressableProps) {
  const previousTouchData = useRef<TouchData[] | null>(null);
  const previousChangeData = useRef<TouchData[] | null>(null);
  const pressableRef = useRef<View>(null);

  const pressRetentionOffset: Insets | null | undefined =
    typeof props.pressRetentionOffset === 'number'
      ? {
          top: props.pressRetentionOffset,
          left: props.pressRetentionOffset,
          bottom: props.pressRetentionOffset,
          right: props.pressRetentionOffset,
        }
      : props.pressRetentionOffset;

  const touchGesture = Gesture.Native()
    .onTouchesDown((event) => {
      // check if all touching fingers were lifted up on the previous event
      if (
        !previousTouchData.current ||
        !previousChangeData.current ||
        previousTouchData.current?.length === previousChangeData.current?.length
      ) {
        props.onPressIn?.(event);
        previousTouchData.current = event.allTouches;
        previousChangeData.current = event.changedTouches;
      }
    })
    .onTouchesUp((event) => {
      // doesn't call onPressOut untill the last pointer leaves, while within bounds
      if (event.allTouches.length > event.changedTouches.length) {
        previousTouchData.current = event.allTouches;
        previousChangeData.current = event.changedTouches;
        return;
      }

      if (!pressRetentionOffset) {
        // we cannot just set shouldCancelWhenOutside,
        // that would disable pressRetentionOffset
        pressableRef.current?.measure((x, y, width, height) => {
          if (
            previousTouchData.current?.find((touch) =>
              touchWithinBounds(touch, calculateEvenBounds(0), {
                bottom: y,
                top: y + height,
                left: x,
                right: x + width,
              })
            )
          ) {
            props.onPress?.(event);
            props.onPressOut?.(event);
          }
        });
        previousTouchData.current = event.allTouches;
        previousChangeData.current = event.changedTouches;
        return;
      }

      pressableRef.current?.measure((x, y, width, height) => {
        const pressableDimensions = {
          bottom: y,
          top: y + height,
          left: x,
          right: x + width,
        } as Insets;

        if (
          event.allTouches.find((touch) =>
            touchWithinBounds(touch, pressRetentionOffset, pressableDimensions)
          )
        ) {
          props.onPress?.(event);
          props.onPressOut?.(event);
        }
      });
      previousTouchData.current = event.allTouches;
      previousChangeData.current = event.changedTouches;
    });

  const pressGesture = Gesture.LongPress().onStart((event) => {
    props.onLongPress?.(event);
  });

  const hoverGesture = Gesture.Hover()
    .onBegin((event) => {
      setTimeout(
        () => props.onHoverIn?.(event),
        props.delayHoverIn ?? DEFAULT_HOVER_DELAY
      );
    })
    .onEnd((event) => {
      setTimeout(
        () => props.onHoverOut?.(event),
        props.delayHoverOut ?? DEFAULT_HOVER_DELAY
      );
    });

  pressGesture.minDuration(props.delayLongPress ?? DEFAULT_LONG_PRESS_DURATION);

  // todo: implement onBlur and onFocus, more details on how available in the PR

  touchGesture.hitSlop(props.hitSlop);
  pressGesture.hitSlop(props.hitSlop);
  hoverGesture.hitSlop(props.hitSlop);

  // todo: add props.pressRetentionOffset, according to docs, they're relative to pressable, not hitSlop

  touchGesture.enabled(props.disabled !== false);
  pressGesture.enabled(props.disabled !== false);
  hoverGesture.enabled(props.disabled !== false);

  touchGesture.runOnJS(true);
  pressGesture.runOnJS(true);
  hoverGesture.runOnJS(true);

  const gesture = Gesture.Simultaneous(
    hoverGesture,
    pressGesture,
    touchGesture
  );

  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={gesture}>
        <View
          ref={pressableRef}
          style={[
            styles.container,
            typeof props.style === 'function'
              ? props.style({ pressed: false })
              : props.style,
          ]}>
          {typeof props.children === 'function'
            ? props.children({ pressed: false })
            : props.children}
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 'auto',
    height: 'auto',
  },
});
