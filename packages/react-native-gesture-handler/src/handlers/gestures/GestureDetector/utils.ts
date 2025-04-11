import { Platform } from 'react-native';

import { isTestEnv, tagMessage } from '../../../utils';
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
import { isNewWebImplementationEnabled } from '../../../EnableNewWebImplementation';
import { RNRenderer } from '../../../RNRenderer';
import { useCallback, useRef, useState } from 'react';
import { Reanimated } from '../reanimatedWrapper';
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

export function checkGestureCallbacksForWorklets(gesture: GestureType) {
  if (!__DEV__) {
    return;
  }
  // If a gesture is explicitly marked to run on the JS thread there is no need to check
  // if callbacks are worklets as the user is aware they will be ran on the JS thread
  if (gesture.config.runOnJS) {
    return;
  }

  const areSomeNotWorklets = gesture.handlers.isWorklet.includes(false);
  const areSomeWorklets = gesture.handlers.isWorklet.includes(true);

  // If some of the callbacks are worklets and some are not, and the gesture is not
  // explicitly marked with `.runOnJS(true)` show an error
  if (areSomeNotWorklets && areSomeWorklets) {
    console.error(
      tagMessage(
        `Some of the callbacks in the gesture are worklets and some are not. Either make sure that all calbacks are marked as 'worklet' if you wish to run them on the UI thread or use '.runOnJS(true)' modifier on the gesture explicitly to run all callbacks on the JS thread.`
      )
    );
  }

  if (Reanimated === undefined) {
    // If Reanimated is not available, we can't run worklets, so we shouldn't show the warning
    return;
  }

  const areAllNotWorklets = !areSomeWorklets && areSomeNotWorklets;
  // If none of the callbacks are worklets and the gesture is not explicitly marked with
  // `.runOnJS(true)` show a warning
  if (areAllNotWorklets && !isTestEnv()) {
    console.warn(
      tagMessage(
        `None of the callbacks in the gesture are worklets. If you wish to run them on the JS thread use '.runOnJS(true)' modifier on the gesture to make this explicit. Otherwise, mark the callbacks as 'worklet' to run them on the UI thread.`
      )
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateDetectorChildren(ref: any) {
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
  if (__DEV__ && Platform.OS !== 'web') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const wrapType =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ref._reactInternals.elementType;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let instance =
      RNRenderer.findHostInstance_DEPRECATED(
        ref
      )._internalFiberInstanceHandleDEV;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    while (instance && instance.elementType !== wrapType) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (instance.sibling) {
        throw new Error(
          'GestureDetector has more than one native view as its children. This can happen if you are using a custom component that renders multiple views, like React.Fragment. You should wrap content of GestureDetector with a <View> or <Animated.View>.'
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      instance = instance.return;
    }
  }
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
    onGestureHandlerStateChange: isNewWebImplementationEnabled()
      ? (e: HandlerStateChangeEvent<unknown>) => {
          onGestureHandlerEvent(e.nativeEvent);
        }
      : undefined,
  });
}
