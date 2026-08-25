import { ActionType } from '@swmansion/gesture-handler-core/src/ActionType';
import { normalizeHitSlop } from '@swmansion/gesture-handler-core/src/handlers/hitSlop';
import { PointerType } from '@swmansion/gesture-handler-core/src/PointerType';
import type {
  ButtonEvent,
  NativeEventWrapper,
} from '@swmansion/gesture-handler-core/src/v3/types';
import { SingleGestureName } from '@swmansion/gesture-handler-core/src/v3/types';
import { registerHandlerClass } from '@swmansion/gesture-handler-dom-engine/src/handlerRegistry';
import NativeViewGestureHandler from '@swmansion/gesture-handler-dom-engine/src/handlers/NativeViewGestureHandler';
import type { PropsRef } from '@swmansion/gesture-handler-dom-engine/src/interfaces';
import { NativeGestureRole } from '@swmansion/gesture-handler-dom-engine/src/interfaces';
import { ButtonEventName } from '@swmansion/gesture-handler-dom-engine/src/tools/ButtonEvents';
import { GestureLifecycleEvent } from '@swmansion/gesture-handler-dom-engine/src/tools/GestureLifecycleEvents';
import {
  calculateViewScale,
  canUseDOM,
  getEffectiveBoundingRect,
  PointerTypeMapping,
} from '@swmansion/gesture-handler-dom-engine/src/utils';
import * as React from 'react';

import { WebModule } from './WebModule';

// The managed button creates its handler by name through the module facade,
// so importing this module is what puts the recognizer class in the bundle.
registerHandlerClass(SingleGestureName.Native, NativeViewGestureHandler);

const useIsomorphicLayoutEffect = canUseDOM()
  ? React.useLayoutEffect
  : React.useEffect;

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  !!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

const noopGestureEvent = () => undefined;

type ButtonPointerEvent = React.PointerEvent<HTMLDivElement>;

// Same coordinate basis as the press path (see PointerEventManager's
// `mapEvent`), so the two payloads agree. Both reads below force a layout flush,
// hence the caller-side gate on a hover callback existing.
const buttonEventFromPointerEvent = (
  event: ButtonPointerEvent
): ButtonEvent => {
  const view = event.currentTarget;
  const rect = getEffectiveBoundingRect(view);
  const { scaleX, scaleY } = calculateViewScale(view);
  const absoluteX = event.clientX;
  const absoluteY = event.clientY;

  return {
    pointerInside:
      absoluteX >= rect.left &&
      absoluteX <= rect.right &&
      absoluteY >= rect.top &&
      absoluteY <= rect.bottom,
    x: (absoluteX - rect.left) / scaleX,
    y: (absoluteY - rect.top) / scaleY,
    absoluteX,
    absoluteY,
    numberOfPointers: 1,
    pointerType:
      PointerTypeMapping.get(event.pointerType ?? '') ?? PointerType.OTHER,
  };
};

export type ButtonProps = React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>;
  enabled?: boolean;
  tapAnimationInDuration?: number;
  tapAnimationOutDuration?: number;
  longPressDuration?: number;
  longPressAnimationOutDuration?: number;
  hoverAnimationInDuration?: number;
  hoverAnimationOutDuration?: number;
  activeOpacity?: number;
  activeScale?: number;
  activeUnderlayOpacity?: number;
  hoverOpacity?: number;
  hoverScale?: number;
  hoverUnderlayOpacity?: number;
  defaultOpacity?: number;
  defaultScale?: number;
  defaultUnderlayOpacity?: number;
  underlayColor?: string;
  hasLongPressHandler?: boolean;
  handlerTag?: number;
  cancelOnLeave?: boolean;
  gestureTestID?: string | undefined;
  gestureHitSlop?:
    | {
        top?: number;
        left?: number;
        bottom?: number;
        right?: number;
      }
    | null
    | undefined;
  onButtonPress?:
    | ((event: NativeEventWrapper<ButtonEvent>) => void)
    | undefined;
  onButtonPressIn?:
    | ((event: NativeEventWrapper<ButtonEvent>) => void)
    | undefined;
  onButtonPressOut?:
    | ((event: NativeEventWrapper<ButtonEvent>) => void)
    | undefined;
  onButtonLongPress?:
    | ((event: NativeEventWrapper<ButtonEvent>) => void)
    | undefined;
  onButtonHoverIn?:
    | ((event: NativeEventWrapper<ButtonEvent>) => void)
    | undefined;
  onButtonHoverOut?:
    | ((event: NativeEventWrapper<ButtonEvent>) => void)
    | undefined;
  onButtonInteractionFinished?:
    | ((event: NativeEventWrapper<ButtonEvent>) => void)
    | undefined;
};

export const ButtonComponent = ({
  ref: externalRef,
  enabled = true,
  tapAnimationInDuration = 50,
  tapAnimationOutDuration = 100,
  longPressDuration = -1,
  longPressAnimationOutDuration = 100,
  hoverAnimationInDuration = 50,
  hoverAnimationOutDuration = 100,
  activeOpacity = 1,
  activeScale = 1,
  activeUnderlayOpacity = 0,
  hoverOpacity: hoverOpacityProp,
  hoverScale: hoverScaleProp,
  hoverUnderlayOpacity: hoverUnderlayOpacityProp,
  defaultOpacity = 1,
  defaultScale = 1,
  defaultUnderlayOpacity = 0,
  underlayColor,
  hasLongPressHandler = false,
  handlerTag,
  cancelOnLeave = true,
  gestureTestID,
  gestureHitSlop,
  onButtonPress,
  onButtonPressIn,
  onButtonPressOut,
  onButtonLongPress,
  onButtonHoverIn,
  onButtonHoverOut,
  onButtonInteractionFinished,
  style,
  children,
  ...rest
}: ButtonProps) => {
  const hoverOpacity = hoverOpacityProp ?? defaultOpacity;
  const hoverScale = hoverScaleProp ?? defaultScale;
  const hoverUnderlayOpacity =
    hoverUnderlayOpacityProp ?? defaultUnderlayOpacity;

  const [pressed, setPressed] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [currentDuration, setCurrentDuration] = React.useState(
    tapAnimationInDuration
  );
  const pressInTimestamp = React.useRef(0);
  const pressOutTimer = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const gestureEnabledRef = React.useRef(true);
  // Hover events outlive the pointer event behind them (`enabled` flipping while
  // hovered), so the payload is copied out.
  const hoverSample = React.useRef<ButtonEvent | null>(null);
  // The hover state JS was last told about, which drifts from the effective one
  // on purpose — see `dispatchHoverEventIfNeeded`.
  const hoverReported = React.useRef(false);
  const viewRef = React.useRef<HTMLDivElement | null>(null);
  const gesturePropsRef = React.useRef<PropsRef>({
    // Managed button handlers dispatch their events through DOM CustomEvents,
    // so ActionType.NONE prevents these callbacks from being used.
    // They remain present because the web module shares its attachment API
    // with regular JS-driven gesture handlers.
    onGestureHandlerEvent: noopGestureEvent,
    onGestureHandlerStateChange: noopGestureEvent,
    onGestureHandlerTouchEvent: noopGestureEvent,
  });
  const managedGestureConfigRef = React.useRef({
    enabled,
    shouldCancelWhenOutside: cancelOnLeave,
    shouldActivateOnStart: false,
    disallowInterruption: true,
    yieldsToContinuousGestures: true,
    testID: gestureTestID,
    hitSlop: normalizeHitSlop(gestureHitSlop),
    hasLongPressHandler,
    longPressDuration,
  });
  managedGestureConfigRef.current = {
    enabled,
    shouldCancelWhenOutside: cancelOnLeave,
    shouldActivateOnStart: false,
    disallowInterruption: true,
    yieldsToContinuousGestures: true,
    testID: gestureTestID,
    hitSlop: normalizeHitSlop(gestureHitSlop),
    hasLongPressHandler,
    longPressDuration,
  };

  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      viewRef.current = node;
      if (typeof externalRef === 'function') {
        externalRef(node);
      } else if (externalRef != null) {
        externalRef.current = node;
      }
    },
    [externalRef]
  );

  useIsomorphicLayoutEffect(() => {
    const node = viewRef.current;

    const handleGestureBegan = () => {
      gestureEnabledRef.current = true;
    };
    const handleGestureCanceled = () => {
      gestureEnabledRef.current = false;
      if (pressOutTimer.current != null) {
        clearTimeout(pressOutTimer.current);
        pressOutTimer.current = null;
      }
      pressInTimestamp.current = 0;
      setPressed(false);
    };

    node?.addEventListener(GestureLifecycleEvent.Began, handleGestureBegan);
    node?.addEventListener(
      GestureLifecycleEvent.Canceled,
      handleGestureCanceled
    );

    return () => {
      node?.removeEventListener(
        GestureLifecycleEvent.Began,
        handleGestureBegan
      );
      node?.removeEventListener(
        GestureLifecycleEvent.Canceled,
        handleGestureCanceled
      );
      if (pressOutTimer.current != null) {
        clearTimeout(pressOutTimer.current);
      }
    };
  }, []);

  const pressIn = React.useCallback(
    (event?: { stopPropagation: () => void }) => {
      const isManagedButtonEvent = event === undefined;

      if (!enabled || (!isManagedButtonEvent && !gestureEnabledRef.current)) {
        return;
      }

      // Managed button events are emitted before the Began lifecycle event.
      // Unmanaged buttons are still driven by their wrapping native gesture,
      // so they must keep honoring its cancellation state.
      if (isManagedButtonEvent) {
        gestureEnabledRef.current = true;
      }

      event?.stopPropagation();

      if (pressOutTimer.current != null) {
        clearTimeout(pressOutTimer.current);
        pressOutTimer.current = null;
      }
      pressInTimestamp.current = performance.now();
      setCurrentDuration(tapAnimationInDuration);
      setPressed(true);
    },
    [enabled, tapAnimationInDuration]
  );

  const pressOut = React.useCallback(
    (event?: { stopPropagation: () => void }) => {
      // Only release if a press-in was actually recorded — guards against
      // stray pointer events and lets us complete the release cycle even if
      // `enabled` flipped to false between press-in and press-out.
      if (pressInTimestamp.current === 0 || !gestureEnabledRef.current) {
        return;
      }

      event?.stopPropagation();

      if (pressOutTimer.current != null) {
        clearTimeout(pressOutTimer.current);
        pressOutTimer.current = null;
      }
      const elapsed = performance.now() - pressInTimestamp.current;
      pressInTimestamp.current = 0;

      if (longPressDuration >= 0 && elapsed >= longPressDuration) {
        // Long-press release — use the configured long-press out duration.
        setCurrentDuration(longPressAnimationOutDuration);
        setPressed(false);
      } else if (elapsed >= tapAnimationInDuration) {
        // Press-in animation fully finished - release with the configured out duration.
        setCurrentDuration(tapAnimationOutDuration);
        setPressed(false);
        // elapsed * 2 to ensure there is at least half of the tapAnimationOutDuration left for the animation to play
      } else if (elapsed * 2 >= tapAnimationOutDuration) {
        setCurrentDuration(elapsed);
        setPressed(false);
      } else {
        // Let the in-progress CSS press-in transition continue; schedule press-out after remaining time.
        const remaining = tapAnimationInDuration - elapsed;
        pressOutTimer.current = setTimeout(
          () => {
            pressOutTimer.current = null;
            setCurrentDuration(tapAnimationOutDuration);
            setPressed(false);
          },
          prefersReducedMotion() ? 0 : remaining
        );
      }
    },
    [
      longPressDuration,
      longPressAnimationOutDuration,
      tapAnimationInDuration,
      tapAnimationOutDuration,
    ]
  );

  useIsomorphicLayoutEffect(() => {
    const node = viewRef.current;
    if (handlerTag === undefined || node == null) {
      return;
    }

    const wrapEvent = (event: Event): NativeEventWrapper<ButtonEvent> => ({
      nativeEvent: (event as CustomEvent<ButtonEvent>).detail,
    });

    const handlePress = (event: Event) => {
      onButtonPress?.(wrapEvent(event));
    };
    const handlePressIn = (event: Event) => {
      pressIn();
      onButtonPressIn?.(wrapEvent(event));
    };
    const handlePressOut = (event: Event) => {
      pressOut();
      onButtonPressOut?.(wrapEvent(event));
    };
    const handleLongPress = (event: Event) => {
      onButtonLongPress?.(wrapEvent(event));
    };
    const handleInteractionFinished = (event: Event) => {
      onButtonInteractionFinished?.(wrapEvent(event));
    };

    node.addEventListener(ButtonEventName.Press, handlePress);
    node.addEventListener(ButtonEventName.PressIn, handlePressIn);
    node.addEventListener(ButtonEventName.PressOut, handlePressOut);
    node.addEventListener(ButtonEventName.LongPress, handleLongPress);
    node.addEventListener(
      ButtonEventName.InteractionFinished,
      handleInteractionFinished
    );

    return () => {
      node.removeEventListener(ButtonEventName.Press, handlePress);
      node.removeEventListener(ButtonEventName.PressIn, handlePressIn);
      node.removeEventListener(ButtonEventName.PressOut, handlePressOut);
      node.removeEventListener(ButtonEventName.LongPress, handleLongPress);
      node.removeEventListener(
        ButtonEventName.InteractionFinished,
        handleInteractionFinished
      );
    };
  }, [
    handlerTag,
    onButtonInteractionFinished,
    onButtonLongPress,
    onButtonPress,
    onButtonPressIn,
    onButtonPressOut,
    pressIn,
    pressOut,
  ]);

  useIsomorphicLayoutEffect(() => {
    const node = viewRef.current;
    if (handlerTag === undefined || node === null) {
      return;
    }

    WebModule.createGestureHandler(
      SingleGestureName.Native,
      handlerTag,
      managedGestureConfigRef.current
    );
    WebModule.attachGestureHandler(
      handlerTag,
      node,
      ActionType.NONE,
      gesturePropsRef
    );

    return () => {
      WebModule.detachGestureHandler(handlerTag);
      WebModule.dropGestureHandler(handlerTag);
    };
  }, [handlerTag]);

  useIsomorphicLayoutEffect(() => {
    if (handlerTag === undefined) {
      return;
    }

    WebModule.setGestureHandlerConfig(
      handlerTag,
      managedGestureConfigRef.current
    );
  }, [
    cancelOnLeave,
    enabled,
    gestureHitSlop,
    gestureTestID,
    handlerTag,
    hasLongPressHandler,
    longPressDuration,
  ]);

  // The payload costs a layout read, so only sample when someone is listening.
  // Truthiness, so `onHoverIn={cond && handler}` can't slip a `false` past.
  const hasHoverCallbacks =
    Boolean(onButtonHoverIn) || Boolean(onButtonHoverOut);

  // Emits the balancing hover event whenever `hoverReported` drifts from the
  // effective hover state. Recomputed from an argument rather than read off the
  // render-scope `effectiveHovered`, because a handler reports a flag React
  // hasn't committed to `hovered` yet.
  const dispatchHoverEventIfNeeded = React.useCallback(
    (isHovered: boolean) => {
      const effectiveHovered = isHovered && enabled;
      const sample = hoverSample.current;

      if (effectiveHovered === hoverReported.current || sample === null) {
        return;
      }

      hoverReported.current = effectiveHovered;
      const event: NativeEventWrapper<ButtonEvent> = {
        nativeEvent: sample,
      };

      if (effectiveHovered) {
        onButtonHoverIn?.(event);
      } else {
        onButtonHoverOut?.(event);
      }
    },
    [enabled, onButtonHoverIn, onButtonHoverOut]
  );

  const handlePointerEnter = React.useCallback(
    (event: ButtonPointerEvent) => {
      if (event.pointerType === 'touch') {
        return;
      }

      if (hasHoverCallbacks) {
        hoverSample.current = buttonEventFromPointerEvent(event);
      }
      // From the handler rather than the effect below, so a leave and a
      // re-enter batched into one render still produce both events.
      dispatchHoverEventIfNeeded(true);

      // Skip duration update while pressed so the press transition owns it.
      if (!pressed) {
        setCurrentDuration(hoverAnimationInDuration);
      }
      // Tracked regardless of `enabled`, which is masked at render and when
      // reporting — so hover resumes if it flips back while inside.
      setHovered(true);
    },
    [
      hasHoverCallbacks,
      hoverAnimationInDuration,
      pressed,
      dispatchHoverEventIfNeeded,
    ]
  );

  const handlePointerLeave = React.useCallback(
    (event: ButtonPointerEvent) => {
      if (handlerTag === undefined) {
        pressOut(event);
      }
      if (event.pointerType === 'touch') {
        return;
      }

      if (hasHoverCallbacks) {
        hoverSample.current = buttonEventFromPointerEvent(event);
      }
      dispatchHoverEventIfNeeded(false);

      if (!pressed) {
        setCurrentDuration(hoverAnimationOutDuration);
      }
      setHovered(false);
    },
    [
      handlerTag,
      hasHoverCallbacks,
      hoverAnimationOutDuration,
      pressOut,
      pressed,
      dispatchHoverEventIfNeeded,
    ]
  );

  // The one transition the pointer handlers can't see: `enabled` flipping while
  // the pointer is inside. Plain `useEffect` keeps a consumer that toggles
  // `enabled` from its own hover callback out of the commit phase.
  React.useEffect(() => {
    dispatchHoverEventIfNeeded(hovered);
  }, [hovered, dispatchHoverEventIfNeeded]);

  // Mask hover at render rather than clearing the state. Avoids a state
  // write inside an effect, and lets hover resume naturally when `enabled`
  // flips back to true while the pointer is still inside.
  const effectiveHovered = hovered && enabled;

  const currentUnderlayOpacity = pressed
    ? activeUnderlayOpacity
    : effectiveHovered
      ? hoverUnderlayOpacity
      : defaultUnderlayOpacity;
  const hasUnderlay = underlayColor != null && underlayColor !== 'transparent';
  const hasOpacity =
    activeOpacity !== 1 || hoverOpacity !== 1 || defaultOpacity !== 1;
  const currentOpacity = pressed
    ? activeOpacity
    : effectiveHovered
      ? hoverOpacity
      : defaultOpacity;
  const hasScale = activeScale !== 1 || hoverScale !== 1 || defaultScale !== 1;
  const currentScale = pressed
    ? activeScale
    : effectiveHovered
      ? hoverScale
      : defaultScale;

  const easing = 'cubic-bezier(0.5, 1, 0.89, 1)';
  const effectiveDuration = prefersReducedMotion() ? 0 : currentDuration;
  const transitionProps: string[] = [];
  if (hasOpacity) {
    transitionProps.push(`opacity ${effectiveDuration}ms ${easing}`);
  }
  if (hasScale) {
    transitionProps.push(`transform ${effectiveDuration}ms ${easing}`);
  }
  const transition = transitionProps.join(', ');

  return (
    <div
      {...rest}
      ref={setRef}
      role="button"
      style={{
        ...style,
        ...(hasOpacity && { opacity: currentOpacity }),
        ...(hasScale && { transform: `scale(${currentScale})` }),
        transition,
        // Clip the underlay to the view bounds (respects borderRadius).
        ...(hasUnderlay && { overflow: 'hidden' }),
        position: style?.position ?? 'relative',
      }}
      onPointerEnter={handlePointerEnter}
      onPointerDown={handlerTag === undefined ? pressIn : undefined}
      onPointerUp={handlerTag === undefined ? pressOut : undefined}
      onPointerCancel={handlerTag === undefined ? pressOut : undefined}
      onPointerLeave={handlePointerLeave}>
      {hasUnderlay && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: underlayColor,
            opacity: currentUnderlayOpacity,
            transition: `opacity ${effectiveDuration}ms ${easing}`,
            pointerEvents: 'none',
          }}
        />
      )}
      {children}
    </div>
  );
};

ButtonComponent.displayName = NativeGestureRole.Button;

export default ButtonComponent;
