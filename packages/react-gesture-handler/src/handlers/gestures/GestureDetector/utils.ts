import { GestureRef, BaseGesture, GestureType } from '../gesture';

import { flingGestureHandlerProps } from '../../FlingGestureHandler';
import { forceTouchGestureHandlerProps } from '../../ForceTouchGestureHandler';
import { longPressGestureHandlerProps } from '../../LongPressGestureHandler';
import {
  panGestureHandlerProps,
  panGestureHandlerCustomNativeProps,
} from '../../PanGestureHandler';
import { tapGestureHandlerProps } from '../../TapGestureHandler';
import { hoverGestureHandlerProps } from '../hoverGesture';
import { nativeViewGestureHandlerProps } from '../../NativeViewGestureHandler';
import {
  HandlerStateChangeEvent,
  baseGestureHandlerWithDetectorProps,
} from '../../gestureHandlerCommon';
import { useCallback, useRef, useState } from 'react';
import { onGestureHandlerEvent } from '../eventReceiver';
import { WebEventHandler } from './types';

export const ALLOWED_PROPS = [
  ...baseGestureHandlerWithDetectorProps,
  ...tapGestureHandlerProps,
  ...panGestureHandlerProps,
  ...panGestureHandlerCustomNativeProps,
  ...longPressGestureHandlerProps,
  ...forceTouchGestureHandlerProps,
  ...flingGestureHandlerProps,
  ...hoverGestureHandlerProps,
  ...nativeViewGestureHandlerProps,
];

function convertToHandlerTag(ref: GestureRef): number {
  if (typeof ref === 'number') {
    return ref;
  } else if (ref instanceof BaseGesture) {
    return ref.handlerTag;
  } else {
    // @ts-ignore in this case it should be a ref either to gesture object or
    // a gesture handler component, in both cases handlerTag property exists
    return ref.current?.handlerTag ?? -1;
  }
}

function extractValidHandlerTags(interactionGroup: GestureRef[] | undefined) {
  return (
    interactionGroup?.map(convertToHandlerTag)?.filter((tag) => tag > 0) ?? []
  );
}

export function extractGestureRelations(gesture: GestureType) {
  const requireToFail = extractValidHandlerTags(gesture.config.requireToFail);
  const simultaneousWith = extractValidHandlerTags(
    gesture.config.simultaneousWith
  );
  const blocksHandlers = extractValidHandlerTags(gesture.config.blocksHandlers);

  return {
    waitFor: requireToFail,
    simultaneousHandlers: simultaneousWith,
    blocksHandlers: blocksHandlers,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateDetectorChildren(_ref: any) {
  // Finds the first native view under the Wrap component and traverses the fiber tree upwards
  // to check whether there is more than one native view as a pseudo-direct child of GestureDetector
  // i.e. this is not ok:
  //            Wrap
  //             |
  //            / \
  //           /   \
  //          /     \
  //         /       \
  //   NativeView  NativeView
  //
  // but this is fine:
  //            Wrap
  //             |
  //         NativeView
  //             |
  //            / \
  //           /   \
  //          /     \
  //         /       \
  //   NativeView  NativeView
}

export function useForceRender() {
  const [renderState, setRenderState] = useState(false);
  const forceRender = useCallback(() => {
    setRenderState(!renderState);
  }, [renderState, setRenderState]);

  return forceRender;
}

export function useWebEventHandlers() {
  return useRef<WebEventHandler>({
    onGestureHandlerEvent: (e: HandlerStateChangeEvent<unknown>) => {
      onGestureHandlerEvent(e.nativeEvent);
    },
    onGestureHandlerStateChange: (e: HandlerStateChangeEvent<unknown>) => {
      onGestureHandlerEvent(e.nativeEvent);
    },
  });
}
