import React, { useEffect } from 'react';

import { GestureDetectorType } from './detectors/common';
import { NativeWrapperProps } from './hooks/utils';
import type {
  NativeWrapperProperties,
  WrapperSpecificProperties,
} from './types/NativeWrapperType';

// The concrete detector components and useNativeGesture are factory-bound;
// Each binding instantiates this with its own bound detector members.
export interface NativeWrapperKit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  NativeDetector: React.ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  VirtualDetector: React.ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  InterceptingGestureDetector: React.ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useNativeGesture: (config: any) => any;
}

export function createNativeWrapperFactory(kit: NativeWrapperKit) {
  const { NativeDetector, VirtualDetector, InterceptingGestureDetector } = kit;

  return function createNativeWrapper<TRef = unknown, TProps = unknown>(
    Component: React.ComponentType<TProps>,
    config: Readonly<
      Omit<NativeWrapperProperties<TRef>, keyof WrapperSpecificProperties<TRef>>
    > = {},
    detectorType: GestureDetectorType = GestureDetectorType.Native
  ) {
    const ComponentWrapper = (
      props: TProps & NativeWrapperProperties<TRef | null>
    ) => {
      const { ref, onGestureUpdate_CAN_CAUSE_INFINITE_RERENDER, ...restProps } =
        props;
      // Filter out props that should be passed to gesture handler wrapper
      const { gestureHandlerProps, childProps } = Object.keys(restProps).reduce(
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
            testID: props.testID,
          } as TProps,
        }
      );

      if (gestureHandlerProps.disableReanimated === undefined) {
        gestureHandlerProps.disableReanimated = true;
      }

      const native = kit.useNativeGesture(gestureHandlerProps);

      useEffect(() => {
        onGestureUpdate_CAN_CAUSE_INFINITE_RERENDER?.(native);
      }, [native, onGestureUpdate_CAN_CAUSE_INFINITE_RERENDER]);

      const DetectorComponent =
        detectorType === GestureDetectorType.Intercepting
          ? InterceptingGestureDetector
          : detectorType === GestureDetectorType.Virtual
            ? VirtualDetector
            : NativeDetector;

      return (
        <DetectorComponent gesture={native}>
          <Component {...childProps} ref={ref} />
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
  };
}
