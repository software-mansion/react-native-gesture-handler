import React, { ForwardedRef, useMemo, useRef, useState } from 'react';
import { GestureObjects as Gesture } from '../../handlers/gestures/gestureObjects';
import { GestureDetector } from '../../handlers/gestures/GestureDetector';
import { PressableProps } from './PressableProps';
import {
  Insets,
  Platform,
  StyleProp,
  View,
  ViewStyle,
  processColor,
} from 'react-native';
import NativeButton from '../GestureHandlerButton';
import { gestureToPressableEvent, addInsets, numberAsInset } from './utils';
import { PressabilityDebugView } from '../../handlers/PressabilityDebugView';
import { INT32_MAX, isFabric, isTestEnv } from '../../utils';
import {
  applyRelationProp,
  RelationPropName,
  RelationPropType,
} from '../utils';

const IS_TEST_ENV = isTestEnv();

let IS_FABRIC: null | boolean = null;

const PressableStateful = ({
  ref: pressableRef,
  props,
}: {
  ref: ForwardedRef<React.ComponentRef<typeof View>>;
  props: PressableProps;
}) => {
  const {
    testOnly_pressed,
    hitSlop,
    pressRetentionOffset,
    delayHoverIn,
    delayHoverOut,
    onHoverIn,
    onHoverOut,
    onPress,
    onPressIn,
    onPressOut,
    onLongPress,
    style,
    children,
    android_disableSound,
    android_ripple,
    disabled,
    accessible,
    simultaneousWithExternalGesture,
    requireExternalGestureToFail,
    blocksExternalGesture,
    ...remainingProps
  } = props;

  const relationProps = {
    simultaneousWithExternalGesture,
    requireExternalGestureToFail,
    blocksExternalGesture,
  };

  const [pressedState] = useState(testOnly_pressed ?? false);

  const hoverInTimeout = useRef<number | null>(null);
  const hoverOutTimeout = useRef<number | null>(null);

  const hoverGesture = useMemo(
    () =>
      Gesture.Hover()
        .manualActivation(true) // Prevents Hover blocking Gesture.Native() on web
        .cancelsTouchesInView(false)
        .onBegin((event) => {
          if (hoverOutTimeout.current) {
            clearTimeout(hoverOutTimeout.current);
          }
          if (delayHoverIn) {
            hoverInTimeout.current = setTimeout(
              () => onHoverIn?.(gestureToPressableEvent(event)),
              delayHoverIn
            );
            return;
          }
          onHoverIn?.(gestureToPressableEvent(event));
        })
        .onFinalize((event) => {
          if (hoverInTimeout.current) {
            clearTimeout(hoverInTimeout.current);
          }
          if (delayHoverOut) {
            hoverOutTimeout.current = setTimeout(
              () => onHoverOut?.(gestureToPressableEvent(event)),
              delayHoverOut
            );
            return;
          }
          onHoverOut?.(gestureToPressableEvent(event));
        }),
    [delayHoverIn, delayHoverOut, onHoverIn, onHoverOut]
  );

  const innerPressableRef = useRef<React.ComponentRef<typeof View>>(null);

  const pressAndTouchGesture = useMemo(
    () =>
      Gesture.LongPress()
        .minDuration(INT32_MAX) // Stops long press from blocking Gesture.Native()
        .maxDistance(INT32_MAX) // Stops long press from cancelling on touch move
        .cancelsTouchesInView(false)
        .onTouchesDown(() => {
          null;
        })
        .onTouchesUp(() => {
          null;
        })
        .onTouchesCancelled(() => {
          null;
        })
        .onBegin(() => {
          null;
        })
        .onStart(() => {
          null;
        })
        .onEnd(() => {
          null;
        }),
    []
  );

  // RNButton is placed inside ButtonGesture to enable Android's ripple and to capture non-propagating events
  const buttonGesture = useMemo(
    () =>
      Gesture.Native()
        .onTouchesDown(() => {
          null;
        })
        .onTouchesUp(() => {
          null;
        })
        .onTouchesCancelled(() => {
          null;
        })
        .onBegin(() => {
          null;
        })
        .onStart(() => {
          null;
        })
        .onEnd(() => {
          null;
        }),
    []
  );

  const normalizedHitSlop: Insets = useMemo(
    () =>
      typeof hitSlop === 'number' ? numberAsInset(hitSlop) : (hitSlop ?? {}),
    [hitSlop]
  );

  const normalizedPressRetentionOffset: Insets = useMemo(
    () =>
      typeof pressRetentionOffset === 'number'
        ? numberAsInset(pressRetentionOffset)
        : (pressRetentionOffset ?? {}),
    [pressRetentionOffset]
  );

  const appliedHitSlop = addInsets(
    normalizedHitSlop,
    normalizedPressRetentionOffset
  );

  const isPressableEnabled = disabled !== true;

  const gestures = [buttonGesture, pressAndTouchGesture, hoverGesture];

  for (const gesture of gestures) {
    gesture.enabled(isPressableEnabled);
    gesture.runOnJS(true);
    gesture.hitSlop(appliedHitSlop);
    gesture.shouldCancelWhenOutside(Platform.OS === 'web' ? false : true);

    Object.entries(relationProps).forEach(([relationName, relation]) => {
      applyRelationProp(
        gesture,
        relationName as RelationPropName,
        relation as RelationPropType
      );
    });
  }

  // Uses different hitSlop, to activate on hitSlop area instead of pressRetentionOffset area
  buttonGesture.hitSlop(normalizedHitSlop);

  const gesture = Gesture.Simultaneous(...gestures);

  // `cursor: 'pointer'` on `RNButton` crashes iOS
  const pointerStyle: StyleProp<ViewStyle> =
    Platform.OS === 'web' ? { cursor: 'pointer' } : {};

  const styleProp =
    typeof style === 'function' ? style({ pressed: pressedState }) : style;

  const childrenProp =
    typeof children === 'function'
      ? children({ pressed: pressedState })
      : children;

  const rippleColor = useMemo(() => {
    if (IS_FABRIC === null) {
      IS_FABRIC = isFabric();
    }

    const defaultRippleColor = android_ripple ? undefined : 'transparent';
    const unprocessedRippleColor = android_ripple?.color ?? defaultRippleColor;
    return IS_FABRIC
      ? unprocessedRippleColor
      : processColor(unprocessedRippleColor);
  }, [android_ripple]);

  return (
    <GestureDetector gesture={gesture}>
      <NativeButton
        {...remainingProps}
        ref={pressableRef ?? innerPressableRef}
        accessible={accessible !== false}
        hitSlop={appliedHitSlop}
        enabled={isPressableEnabled}
        touchSoundDisabled={android_disableSound ?? undefined}
        rippleColor={rippleColor}
        rippleRadius={android_ripple?.radius ?? undefined}
        style={[pointerStyle, styleProp]}
        testOnly_onPress={IS_TEST_ENV ? onPress : undefined}
        testOnly_onPressIn={IS_TEST_ENV ? onPressIn : undefined}
        testOnly_onPressOut={IS_TEST_ENV ? onPressOut : undefined}
        testOnly_onLongPress={IS_TEST_ENV ? onLongPress : undefined}>
        {childrenProp}
        {__DEV__ ? (
          <PressabilityDebugView color="red" hitSlop={normalizedHitSlop} />
        ) : null}
      </NativeButton>
    </GestureDetector>
  );
};

export default PressableStateful;
