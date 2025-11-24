import React, { useImperativeHandle, useRef } from 'react';

import { NativeWrapperProps } from './hooks/utils';
import { useNativeGesture } from './hooks/gestures';
import { NativeDetector } from './detectors/NativeDetector';
import type { NativeWrapperProperties } from './types/NativeWrapperType';
import { NativeGesture } from './hooks/gestures/native/useNativeGesture';
import { DetectorType, InterceptingGestureDetector } from './detectors';
import { VirtualDetector } from './detectors/VirtualDetector/VirtualDetector';

export type ComponentWrapperRef<P> = {
  componentRef: React.ComponentType<P>;
  gestureRef: NativeGesture;
};

export default function createNativeWrapper<P>(
  Component: React.ComponentType<P>,
  config: Readonly<NativeWrapperProperties> = {},
  detectorType: DetectorType = DetectorType.Native
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

    const native = useNativeGesture(gestureHandlerProps);

    const componentRef = useRef<React.ComponentType<P>>(null);

    useImperativeHandle(
      props.ref,
      () =>
        ({
          componentRef: componentRef.current,
          gestureRef: native,
        }) as ComponentWrapperRef<P>
    );

    const DetectorComponent =
      detectorType === DetectorType.Intercepting
        ? InterceptingGestureDetector
        : detectorType === DetectorType.Virtual
          ? VirtualDetector
          : NativeDetector;

    return (
      <DetectorComponent gesture={native}>
        <Component {...childProps} ref={componentRef} />
      </DetectorComponent>
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
