import * as React from 'react';
import { useImperativeHandle, useRef } from 'react';

import {
  NativeViewGestureHandler,
  NativeViewGestureHandlerProps,
  nativeViewProps,
} from './NativeViewGestureHandler';

/*
 * This array should consist of:
 *   - All keys in propTypes from NativeGestureHandler
 *     (and all keys in GestureHandlerPropTypes)
 *   - 'onGestureHandlerEvent'
 *   - 'onGestureHandlerStateChange'
 */
const NATIVE_WRAPPER_PROPS_FILTER = [
  ...nativeViewProps,
  'onGestureHandlerEvent',
  'onGestureHandlerStateChange',
] as const;

export default function createNativeWrapper<P>(
  Component: React.ComponentType<P>,
  config: Readonly<NativeViewGestureHandlerProps> = {}
) {
  const ComponentWrapper = React.forwardRef<
    React.ComponentType<any>,
    P & NativeViewGestureHandlerProps
  >((props, ref) => {
    // Filter out props that should be passed to gesture handler wrapper
    const { gestureHandlerProps, childProps } = Object.keys(props).reduce(
      (res, key) => {
        // TS being overly protective with it's types, see https://github.com/microsoft/TypeScript/issues/26255#issuecomment-458013731 for more info
        const allowedKeys: readonly string[] = NATIVE_WRAPPER_PROPS_FILTER;
        if (allowedKeys.includes(key)) {
          // @ts-ignore FIXME(TS)
          res.gestureHandlerProps[key] = props[key];
        } else {
          // @ts-ignore FIXME(TS)
          res.childProps[key] = props[key];
        }
        return res;
      },
      {
        gestureHandlerProps: { ...config }, // Watch out not to modify config
        childProps: { enabled: props.enabled } as P,
      }
    );
    const _ref = useRef<React.ComponentType<P>>();
    const _gestureHandlerRef = useRef<React.ComponentType<P>>();
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
      <NativeViewGestureHandler
        {...gestureHandlerProps}
        // @ts-ignore TODO(TS)
        ref={_gestureHandlerRef}>
        <Component {...childProps} ref={_ref} />
      </NativeViewGestureHandler>
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
