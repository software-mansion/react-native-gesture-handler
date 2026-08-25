import { getNextHandlerTag } from '@swmansion/gesture-handler-core/src/handlers/getNextHandlerTag';
import type {
  AnimationDuration,
  ButtonEvent,
  NativeEventWrapper,
} from '@swmansion/gesture-handler-core/src/v3/types';
import * as React from 'react';

import type { ButtonProps } from './GestureHandlerButton';
import GestureHandlerButton from './GestureHandlerButton';

const DEFAULT_IN_DURATION_MS = 50;
const DEFAULT_OUT_DURATION_MS = 100;

// Clamp user-supplied durations to finite, non-negative milliseconds.
// Negative, NaN, or Infinity values would produce invalid CSS transitions
// and negative setTimeout delays in the press-out path.
function sanitizeDuration(value: number): number {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function resolveAnimationDuration(value: AnimationDuration | undefined) {
  if (value === undefined) {
    return {
      tapAnimationInDuration: DEFAULT_IN_DURATION_MS,
      tapAnimationOutDuration: DEFAULT_OUT_DURATION_MS,
      longPressAnimationOutDuration: DEFAULT_OUT_DURATION_MS,
      hoverAnimationInDuration: DEFAULT_IN_DURATION_MS,
      hoverAnimationOutDuration: DEFAULT_OUT_DURATION_MS,
    };
  }

  if (typeof value === 'number') {
    const sanitized = sanitizeDuration(value);
    return {
      tapAnimationInDuration: sanitized,
      tapAnimationOutDuration: sanitized,
      longPressAnimationOutDuration: sanitized,
      hoverAnimationInDuration: sanitized,
      hoverAnimationOutDuration: sanitized,
    };
  }

  // The union guarantees variant 2 supplies top-level `in`/`out`, variant 3
  // supplies both category objects — so per-category fallback to base is
  // always defined for well-typed input; the 0 fallbacks here are unreachable.
  const baseIn = 'in' in value ? value.in : 0;
  const baseOut = 'out' in value ? value.out : 0;
  const tapOut = value.tap?.out ?? baseOut;

  return {
    tapAnimationInDuration: sanitizeDuration(value.tap?.in ?? baseIn),
    tapAnimationOutDuration: sanitizeDuration(tapOut),
    longPressAnimationOutDuration: sanitizeDuration(
      value.longPress?.out ?? tapOut
    ),
    hoverAnimationInDuration: sanitizeDuration(value.hover?.in ?? baseIn),
    hoverAnimationOutDuration: sanitizeDuration(value.hover?.out ?? baseOut),
  };
}

type InternalButtonProps =
  | 'handlerTag'
  | 'hasLongPressHandler'
  | 'enabled'
  | 'gestureTestID'
  | 'gestureHitSlop'
  | 'tapAnimationInDuration'
  | 'tapAnimationOutDuration'
  | 'longPressDuration'
  | 'longPressAnimationOutDuration'
  | 'hoverAnimationInDuration'
  | 'hoverAnimationOutDuration'
  | 'onButtonPress'
  | 'onButtonPressIn'
  | 'onButtonPressOut'
  | 'onButtonLongPress'
  | 'onButtonHoverIn'
  | 'onButtonHoverOut'
  | 'onButtonInteractionFinished';

export type TouchableProps = Omit<ButtonProps, InternalButtonProps> & {
  /**
   * Press and hover animation durations, in milliseconds. Pass a single
   * number to apply it to every phase, or an object to customize per phase
   * and per category. Defaults to 50ms for the in phase and 100ms for the
   * out phase.
   */
  animationDuration?: AnimationDuration | undefined;

  /**
   * Time in milliseconds a press has to be held for the long press
   * callback to fire. By default set to 600.
   */
  delayLongPress?: number | undefined;

  /**
   * Called when the component gets pressed.
   */
  onPress?: ((event: ButtonEvent) => void) | undefined;

  /**
   * Called when the component gets long pressed.
   */
  onLongPress?: ((event: ButtonEvent) => void) | undefined;

  /**
   * Called when pointer touches the component.
   */
  onPressIn?: ((event: ButtonEvent) => void) | undefined;

  /**
   * Called when pointer is released from the component.
   */
  onPressOut?: ((event: ButtonEvent) => void) | undefined;

  /**
   * Called when a non-touch pointer starts hovering over the component.
   */
  onHoverIn?: ((event: ButtonEvent) => void) | undefined;

  /**
   * Called when a non-touch pointer stops hovering over the component.
   */
  onHoverOut?: ((event: ButtonEvent) => void) | undefined;

  /**
   * Whether the component should ignore touches. By default set to false.
   */
  disabled?: boolean | undefined;

  /**
   * Hit slop in pixels, applied on every side, or per side when an object
   * is passed.
   */
  hitSlop?:
    | number
    | { top?: number; left?: number; bottom?: number; right?: number }
    | undefined;

  /**
   * Test id forwarded to the underlying gesture handler.
   */
  testID?: string | undefined;
};

export const Touchable = (props: TouchableProps) => {
  const {
    underlayColor = 'transparent',
    defaultUnderlayOpacity = 0,
    activeUnderlayOpacity = 0.105,
    defaultOpacity = 1,
    animationDuration,
    delayLongPress = 600,
    onLongPress,
    onPress,
    onPressIn,
    onPressOut,
    onHoverIn,
    onHoverOut,
    children,
    disabled = false,
    cancelOnLeave = true,
    hitSlop,
    testID,
    ref,
    ...rest
  } = props;
  const [handlerTag] = React.useState(() => getNextHandlerTag());

  const resolvedDurations = resolveAnimationDuration(animationDuration);
  const resolvedDelayLongPress = sanitizeDuration(delayLongPress);

  const internalOnPress = React.useCallback(
    (e: NativeEventWrapper<ButtonEvent>) => {
      onPress?.(e.nativeEvent);
    },
    [onPress]
  );

  const internalOnPressIn = React.useCallback(
    (e: NativeEventWrapper<ButtonEvent>) => {
      onPressIn?.(e.nativeEvent);
    },
    [onPressIn]
  );

  const internalOnPressOut = React.useCallback(
    (e: NativeEventWrapper<ButtonEvent>) => {
      onPressOut?.(e.nativeEvent);
    },
    [onPressOut]
  );

  const internalOnLongPress = React.useCallback(
    (e: NativeEventWrapper<ButtonEvent>) => {
      onLongPress?.(e.nativeEvent);
    },
    [onLongPress]
  );

  // Left undefined when the corresponding prop is absent so the button can
  // skip building a hover payload nobody consumes — it costs a synchronous
  // layout read per pointer enter/leave.
  const internalOnHoverIn = React.useMemo(
    () =>
      onHoverIn
        ? (e: NativeEventWrapper<ButtonEvent>) => onHoverIn(e.nativeEvent)
        : undefined,
    [onHoverIn]
  );

  const internalOnHoverOut = React.useMemo(
    () =>
      onHoverOut
        ? (e: NativeEventWrapper<ButtonEvent>) => onHoverOut(e.nativeEvent)
        : undefined,
    [onHoverOut]
  );

  const normalizedHitSlop =
    typeof hitSlop === 'number'
      ? {
          top: hitSlop,
          left: hitSlop,
          bottom: hitSlop,
          right: hitSlop,
        }
      : hitSlop;

  return (
    <GestureHandlerButton
      {...rest}
      {...resolvedDurations}
      ref={ref ?? null}
      enabled={!disabled}
      handlerTag={handlerTag}
      cancelOnLeave={cancelOnLeave}
      gestureTestID={testID}
      gestureHitSlop={normalizedHitSlop}
      defaultOpacity={defaultOpacity}
      defaultUnderlayOpacity={defaultUnderlayOpacity}
      activeUnderlayOpacity={activeUnderlayOpacity}
      underlayColor={underlayColor}
      longPressDuration={resolvedDelayLongPress}
      hasLongPressHandler={onLongPress !== undefined}
      onButtonPress={internalOnPress}
      onButtonPressIn={internalOnPressIn}
      onButtonPressOut={internalOnPressOut}
      onButtonLongPress={internalOnLongPress}
      onButtonHoverIn={internalOnHoverIn}
      onButtonHoverOut={internalOnHoverOut}>
      {children}
    </GestureHandlerButton>
  );
};
