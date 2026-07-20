import type { HitSlop } from '../../handlers/gestureHandlerCommon';
import type { NativeHandlerData } from '../hooks/gestures/native/NativeTypes';
import type { GestureEndEvent, GestureEvent } from '../types';

export type TouchableCallbackEvent = GestureEvent<NativeHandlerData>;
export type TouchableEndCallbackEvent = GestureEndEvent<NativeHandlerData>;

type InOutDuration = { in: number; out: number };
type LongPressDuration = { out: number };

/**
 * Configuration for press / hover animation timing.
 *
 * - A single number applies to every phase of every category.
 * - An object with top-level `in` / `out` sets the baseline; `tap` and
 *   `hover` may override either side or both — any field left out
 *   inherits the top-level value.
 * - Alternatively, both categories may be specified in full without a
 *   top-level baseline.
 *
 * `longPress` optionally customizes the press-out duration once the
 * press has been held past `delayLongPress`. If omitted, the long-press
 * release falls back to the resolved tap-out timing.
 */
export type AnimationDuration =
  | number
  | (InOutDuration & {
      tap?: Partial<InOutDuration>;
      hover?: Partial<InOutDuration>;
      longPress?: LongPressDuration;
    })
  | {
      tap: InOutDuration;
      hover: InOutDuration;
      longPress?: LongPressDuration;
    };

// The cross-platform host-button contract: every platform's press button
// (port.press.Button) receives these props from the core Touchable — the DOM
// button implements the animations in CSS, the native button in the platform
// view. Platform-specific extras (ripple, TV focus, DOM attributes) flow
// through port.press.mapButtonProps.
export interface TouchableButtonProps {
  enabled: boolean;
  tapAnimationInDuration: number;
  tapAnimationOutDuration: number;
  longPressAnimationOutDuration: number;
  hoverAnimationInDuration: number;
  hoverAnimationOutDuration: number;
  longPressDuration: number;
  defaultOpacity: number;
  defaultUnderlayOpacity: number;
  activeUnderlayOpacity: number;
  underlayColor: string;
}

// The platform pieces the core Touchable renders with: the host button and
// an optional translation of the passthrough props (Android ripple, TV
// focus, stripping non-DOM attributes). Each binding's Touchable module
// supplies this next to the component — deliberately NOT part of the
// platform port, so the button never rides in bundles that don't import
// Touchable.
export interface TouchablePressKit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Button: React.ComponentType<any>;
  mapButtonProps?:
    | ((rest: Record<string, unknown>) => Record<string, unknown>)
    | undefined;
}

// The behavioral props of the Touchable — everything the press logic reads.
// Platform packages build their public prop types on top of this (adding RN
// view props / DOM attributes and re-typing platform-opaque values like
// ColorValue).
export interface TouchableBehaviorProps {
  underlayColor?: string | undefined;
  defaultUnderlayOpacity?: number | undefined;
  activeUnderlayOpacity?: number | undefined;
  defaultOpacity?: number | undefined;
  animationDuration?: AnimationDuration | undefined;
  delayLongPress?: number | undefined;
  onLongPress?: (() => void) | undefined;
  onPress?: ((event: TouchableCallbackEvent) => void) | undefined;
  onPressIn?: ((event: TouchableCallbackEvent) => void) | undefined;
  onPressOut?:
    | ((event: TouchableCallbackEvent | TouchableEndCallbackEvent) => void)
    | undefined;
  disabled?: boolean | undefined;
  cancelOnLeave?: boolean | undefined;
  hitSlop?: HitSlop | undefined;
  testID?: string | undefined;
}

// What the core component actually accepts: behavioral props plus untyped
// passthrough for the host button (RN view props on native, DOM attributes on
// web). Platform barrels overlay their precise public type at the re-export.
export type CoreTouchableProps = TouchableBehaviorProps & {
  children?: React.ReactNode;
  ref?: unknown;
} & Record<string, unknown>;
