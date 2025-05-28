import React, { useImperativeHandle, useRef } from 'react';
import {
  NativeViewGestureConfig,
  nativeViewGestureHandlerProps,
} from './NativeViewGestureHandler';
import { Gesture, GestureDetector, NativeViewGestureHandlerPayload } from '..';
import { BaseGestureConfig, Callbacks } from './gestures/gesture';

const commonConfig = [
  'enabled',
  'shouldCancelWhenOutside',
  'hitSlop',
  'activeCursor',
  'mouseButton',
  'requireExternalGestureToFail',
  'simultaneousWithExternalGesture',
  'blocksExternalGesture',
  'runOnJS',
  'withTestId',
  'cancelsTouchesInView',
] as const;

const callbacks = [
  'onBegin',
  'onStart',
  'onEnd',
  'onFinalize',
  'onTouchesDown',
  'onTouchesMove',
  'onTouchesUp',
  'onTouchesCancelled',
] as const;

const NATIVE_WRAPPER_PROPS = [
  ...nativeViewGestureHandlerProps,
  ...commonConfig,
  ...callbacks,
] as const;

type NativeConfig = (typeof NATIVE_WRAPPER_PROPS)[number];

const PROPS_FILTER = new Set<string>(NATIVE_WRAPPER_PROPS);

export default function createNativeWrapper<P>(
  Component: React.ComponentType<P>,
  config: Readonly<BaseGestureConfig & NativeViewGestureConfig> = {}
) {
  const ComponentWrapper = React.forwardRef<
    React.ComponentType<any>,
    P &
      BaseGestureConfig &
      NativeViewGestureConfig &
      Callbacks<NativeViewGestureHandlerPayload>
  >((props, ref) => {
    // Filter out props that should be passed to gesture handler wrapper
    const { gestureHandlerProps, childProps } = Object.keys(props).reduce(
      (res, key) => {
        if (PROPS_FILTER.has(key)) {
          res.gestureHandlerProps[key] = props[key];
        } else {
          // @ts-ignore FIXME(TS)
          res.childProps[key] = props[key];
        }
        return res;
      },
      {
        gestureHandlerProps: { ...config }, // Watch out not to modify config
        childProps: {
          enabled: props.enabled,
          hitSlop: props.hitSlop,
          testId: props.testId,
        } as P,
      }
    );
    const _ref = useRef<React.ComponentType<P>>(null);
    const _gestureHandlerRef = useRef(null);

    // @ts-ignore For now
    const native = Gesture.Native().withRef(_gestureHandlerRef);

    for (const [key, value] of Object.entries(gestureHandlerProps)) {
      // @ts-ignore `value` type is inferred as `never`. In reality there's wide range
      // of types that can be passed here, like `boolean`, `number`, or functions.
      native[key as NativeConfig](value);
    }

    useImperativeHandle(
      ref,
      // @ts-ignore TODO(TS) decide how nulls work in this context
      () => {
        const node = _gestureHandlerRef.current;
        // Add handlerTag for relations config
        if (_ref.current && node) {
          // @ts-ignore FIXME(TS) think about createHandler return type
          _ref.current.handlerTag = node.handlerTag;
          return _ref.current;
        }
        return null;
      },
      [_ref, _gestureHandlerRef]
    );
    return (
      <GestureDetector gesture={native}>
        <Component {...childProps} ref={_ref} />
      </GestureDetector>
    );
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  ComponentWrapper.displayName =
    Component?.displayName ||
    // @ts-ignore if render doesn't exist it will return undefined and go further
    Component?.render?.name ||
    (typeof Component === 'string' && Component) ||
    'ComponentWrapper';

  return ComponentWrapper;
}
