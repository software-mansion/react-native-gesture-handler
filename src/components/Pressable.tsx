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
  bounds: Insets,
  dimensions: Insets
): boolean {
  const leftbound =
    bounds.left && dimensions.left
      ? bounds.left + dimensions.left < touch.absoluteX
      : true;
  const rightbound =
    bounds.right && dimensions.right
      ? bounds.right + dimensions.right > touch.absoluteX
      : true;
  const bottombound =
    bounds.bottom && dimensions.bottom
      ? bounds.bottom + dimensions.bottom < touch.absoluteY
      : true;
  const topbound =
    bounds.top && dimensions.top
      ? bounds.top + dimensions.top > touch.absoluteY
      : true;

  return leftbound && rightbound && topbound && bottombound;
}

export default function Pressable(props: PressableProps) {
  const previousTouchData = useRef<TouchData[] | null>(null);
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
      // note: hitslop checking support is built in
        props.onPressIn?.(event);
        previousTouchData.current = event.allTouches;
    })
    .onTouchesUp((event) => {
      // doesn't call onPressOut untill the last pointer leaves, while within bounds
      if (event.allTouches.length > 1) {
        previousTouchData.current = event.allTouches;
        return;
      }

      if (!pressRetentionOffset) {
        // we cannot just set shouldCancelWhenOutside,
        // that would disable pressRetentionOffset
        pressableRef.current?.measure((x, y, width, height) => {
          if (
            previousTouchData.current?.find((touch) =>
              touchWithinBounds(
                touch,
                { bottom: 0, top: 0, left: 0, right: 0 },
                {
                bottom: y,
                top: y + height,
                left: x,
                right: x + width,
                }
              )
            )
          ) {
            props.onPressOut?.(event);
          }
        });
        previousTouchData.current = event.allTouches;
        return;
      }

      pressableRef.current?.measure((x, y, width, height) => {
        console.log(x, y, width, height);
        const pressableDimensions = {
          bottom: y,
          top: y + height,
          left: x,
          right: x + width,
        } as Insets;

        if (
          previousTouchData.current?.find((touch) =>
            touchWithinBounds(touch, pressRetentionOffset, pressableDimensions)
          )
        ) {
          props.onPressOut?.(event);
        }
      });
      previousTouchData.current = event.allTouches;
    });

  const pressGesture = Gesture.LongPress().onEnd((event, success) => {
    if (success) {
      props.onLongPress?.(event);
    }
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

  // onBlur and onFocus don't exist in the docs

  touchGesture.hitSlop(props.hitSlop);
  pressGesture.hitSlop(props.hitSlop);
  hoverGesture.hitSlop(props.hitSlop);

  // add props.pressRetentionOffset, according to docs, they're relative to pressable, not hitSlop

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
