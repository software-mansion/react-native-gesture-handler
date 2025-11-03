import * as React from 'react';

import { NativeWrapperProps } from './hooks/utils';
import { useNative } from './hooks/gestures';
import { NativeDetector } from './NativeDetector/NativeDetector';
import type { NativeWrapperProperties } from './types/NativeWrapperType';

export default function createNativeWrapper<P>(
  Component: React.ComponentType<P>,
  config: Readonly<NativeWrapperProperties> = {}
) {
  const ComponentWrapper = (
    props: P & NativeWrapperProperties & { ref?: React.RefObject<unknown> }
  ) => {
    // Filter out props that should be passed to gesture handler wrapper
    const { gestureHandlerProps, childProps } = Object.keys(props).reduce(
      (res, key) => {
        // @ts-ignore TS being overly protective with it's types, see https://github.com/microsoft/TypeScript/issues/26255#issuecomment-458013731 for more info
        if (NativeWrapperProps.has(key)) {
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
        childProps: {
          enabled: props.enabled,
          hitSlop: props.hitSlop,
          // testID: props.testID,
        } as P,
      }
    );

    const native = useNative(gestureHandlerProps);

    return (
      <NativeDetector gesture={native}>
        <Component {...childProps} ref={props.ref} />
      </NativeDetector>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  ComponentWrapper.displayName =
    Component?.displayName ||
    // @ts-ignore if render doesn't exist it will return undefined and go further
    Component?.render?.name ||
    (typeof Component === 'string' && Component) ||
    'ComponentWrapper';

  return ComponentWrapper;
}
