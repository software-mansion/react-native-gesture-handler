import React, { useEffect, useRef } from 'react';
import {
  GestureType,
  HandlerCallbacks,
  BaseGesture,
  GestureRef,
  CALLBACK_TYPE,
} from './gesture';
import { Reanimated, SharedValue } from './reanimatedWrapper';
import { registerHandler, unregisterHandler } from '../handlersRegistry';
import RNGestureHandlerModule from '../../RNGestureHandlerModule';
import {
  baseGestureHandlerWithMonitorProps,
  filterConfig,
  findNodeHandle,
  GestureTouchEvent,
  GestureUpdateEvent,
  GestureStateChangeEvent,
  HandlerStateChangeEvent,
  scheduleFlushOperations,
} from '../gestureHandlerCommon';
import {
  GestureStateManager,
  GestureStateManagerType,
} from './gestureStateManager';
import { flingGestureHandlerProps } from '../FlingGestureHandler';
import { forceTouchGestureHandlerProps } from '../ForceTouchGestureHandler';
import { longPressGestureHandlerProps } from '../LongPressGestureHandler';
import {
  panGestureHandlerProps,
  panGestureHandlerCustomNativeProps,
} from '../PanGestureHandler';
import { tapGestureHandlerProps } from '../TapGestureHandler';
import { State } from '../../State';
import { TouchEventType } from '../../TouchEventType';
import { ComposedGesture } from './gestureComposition';
import { ActionType } from '../../ActionType';
import { isFabric, tagMessage } from '../../utils';
import { getShadowNodeFromRef } from '../../getShadowNodeFromRef';
import { Platform } from 'react-native';
import type RNGestureHandlerModuleWeb from '../../RNGestureHandlerModule.web';
import { onGestureHandlerEvent } from './eventReceiver';
import { RNRenderer } from '../../RNRenderer';
import { isExperimentalWebImplementationEnabled } from '../../EnableExperimentalWebImplementation';

declare const global: {
  isFormsStackingContext: (node: unknown) => boolean | null; // JSI function
};

const ALLOWED_PROPS = [
  ...baseGestureHandlerWithMonitorProps,
  ...tapGestureHandlerProps,
  ...panGestureHandlerProps,
  ...panGestureHandlerCustomNativeProps,
  ...longPressGestureHandlerProps,
  ...forceTouchGestureHandlerProps,
  ...flingGestureHandlerProps,
];

export type GestureConfigReference = {
  config: GestureType[];
  animatedEventHandler: unknown;
  animatedHandlers: SharedValue<
    HandlerCallbacks<Record<string, unknown>>[] | null
  > | null;
  firstExecution: boolean;
  useReanimatedHook: boolean;
};

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

function dropHandlers(preparedGesture: GestureConfigReference) {
  for (const handler of preparedGesture.config) {
    RNGestureHandlerModule.dropGestureHandler(handler.handlerTag);

    unregisterHandler(handler.handlerTag, handler.config.testId);
  }

  scheduleFlushOperations();
}

function checkGestureCallbacksForWorklets(gesture: GestureType) {
  // if a gesture is explicitly marked to run on the JS thread there is no need to check
  // if callbacks are worklets as the user is aware they will be ran on the JS thread
  if (gesture.config.runOnJS) {
    return;
  }

  const areSomeNotWorklets = gesture.handlers.isWorklet.includes(false);
  const areSomeWorklets = gesture.handlers.isWorklet.includes(true);

  // if some of the callbacks are worklets and some are not, and the gesture is not
  // explicitly marked with `.runOnJS(true)` show an error
  if (areSomeNotWorklets && areSomeWorklets) {
    console.error(
      tagMessage(
        `Some of the callbacks in the gesture are worklets and some are not. Either make sure that all calbacks are marked as 'worklet' if you wish to run them on the UI thread or use '.runOnJS(true)' modifier on the gesture explicitly to run all callbacks on the JS thread.`
      )
    );
  }
}

interface WebEventHandler {
  onGestureHandlerEvent: (event: HandlerStateChangeEvent<unknown>) => void;
  onGestureHandlerStateChange?: (
    event: HandlerStateChangeEvent<unknown>
  ) => void;
}

interface AttachHandlersConfig {
  preparedGesture: GestureConfigReference;
  gestureConfig: ComposedGesture | GestureType | undefined;
  gesture: GestureType[];
  viewTag: number;
  webEventHandlersRef: React.RefObject<WebEventHandler>;
}

function attachHandlers({
  preparedGesture,
  gestureConfig,
  gesture,
  viewTag,
  webEventHandlersRef,
}: AttachHandlersConfig) {
  if (!preparedGesture.firstExecution) {
    gestureConfig?.initialize();
  } else {
    preparedGesture.firstExecution = false;
  }

  // use setImmediate to extract handlerTags, because all refs should be initialized
  // when it's ran
  setImmediate(() => {
    gestureConfig?.prepare();
  });

  for (const handler of gesture) {
    checkGestureCallbacksForWorklets(handler);
    RNGestureHandlerModule.createGestureHandler(
      handler.handlerName,
      handler.handlerTag,
      filterConfig(handler.config, ALLOWED_PROPS)
    );

    registerHandler(handler.handlerTag, handler, handler.config.testId);
  }

  // use setImmediate to extract handlerTags, because all refs should be initialized
  // when it's ran
  setImmediate(() => {
    for (const handler of gesture) {
      let requireToFail: number[] = [];
      if (handler.config.requireToFail) {
        requireToFail = extractValidHandlerTags(handler.config.requireToFail);
      }

      let simultaneousWith: number[] = [];
      if (handler.config.simultaneousWith) {
        simultaneousWith = extractValidHandlerTags(
          handler.config.simultaneousWith
        );
      }

      RNGestureHandlerModule.updateGestureHandler(
        handler.handlerTag,
        filterConfig(handler.config, ALLOWED_PROPS, {
          simultaneousHandlers: simultaneousWith,
          waitFor: requireToFail,
        })
      );
    }

    scheduleFlushOperations();
  });

  preparedGesture.config = gesture;

  for (const gesture of preparedGesture.config) {
    const actionType = gesture.shouldUseReanimated
      ? ActionType.REANIMATED_WORKLET
      : ActionType.JS_FUNCTION_NEW_API;

    if (Platform.OS === 'web') {
      (RNGestureHandlerModule.attachGestureHandler as typeof RNGestureHandlerModuleWeb.attachGestureHandler)(
        gesture.handlerTag,
        viewTag,
        ActionType.JS_FUNCTION_OLD_API, // ignored on web
        webEventHandlersRef
      );
    } else {
      RNGestureHandlerModule.attachGestureHandler(
        gesture.handlerTag,
        viewTag,
        actionType
      );
    }
  }

  if (preparedGesture.animatedHandlers) {
    const isAnimatedGesture = (g: GestureType) => g.shouldUseReanimated;

    preparedGesture.animatedHandlers.value = (gesture
      .filter(isAnimatedGesture)
      .map((g) => g.handlers) as unknown) as HandlerCallbacks<
      Record<string, unknown>
    >[];
  }
}

function updateHandlers(
  preparedGesture: GestureConfigReference,
  gestureConfig: ComposedGesture | GestureType | undefined,
  gesture: GestureType[]
) {
  gestureConfig?.prepare();

  for (let i = 0; i < gesture.length; i++) {
    const handler = preparedGesture.config[i];
    checkGestureCallbacksForWorklets(handler);

    // only update handlerTag when it's actually different, it may be the same
    // if gesture config object is wrapped with useMemo
    if (gesture[i].handlerTag !== handler.handlerTag) {
      gesture[i].handlerTag = handler.handlerTag;
      gesture[i].handlers.handlerTag = handler.handlerTag;
    }
  }

  // use setImmediate to extract handlerTags, because when it's ran, all refs should be updated
  // and handlerTags in BaseGesture references should be updated in the loop above (we need to wait
  // in case of external relations)
  setImmediate(() => {
    for (let i = 0; i < gesture.length; i++) {
      const handler = preparedGesture.config[i];

      handler.config = gesture[i].config;
      handler.handlers = gesture[i].handlers;

      const requireToFail = extractValidHandlerTags(
        handler.config.requireToFail
      );

      const simultaneousWith = extractValidHandlerTags(
        handler.config.simultaneousWith
      );

      RNGestureHandlerModule.updateGestureHandler(
        handler.handlerTag,
        filterConfig(handler.config, ALLOWED_PROPS, {
          simultaneousHandlers: simultaneousWith,
          waitFor: requireToFail,
        })
      );

      registerHandler(handler.handlerTag, handler, handler.config.testId);
    }

    if (preparedGesture.animatedHandlers) {
      const previousHandlersValue =
        preparedGesture.animatedHandlers.value ?? [];
      const newHandlersValue = (preparedGesture.config
        .filter((g) => g.shouldUseReanimated) // ignore gestures that shouldn't run on UI
        .map((g) => g.handlers) as unknown) as HandlerCallbacks<
        Record<string, unknown>
      >[];

      // if amount of gesture configs changes, we need to update the callbacks in shared value
      let shouldUpdateSharedValue =
        previousHandlersValue.length !== newHandlersValue.length;

      if (!shouldUpdateSharedValue) {
        // if the amount is the same, we need to check if any of the configs inside has changed
        for (let i = 0; i < newHandlersValue.length; i++) {
          if (
            // we can use the `gestureId` prop as it's unique for every config instance
            newHandlersValue[i].gestureId !== previousHandlersValue[i].gestureId
          ) {
            shouldUpdateSharedValue = true;
            break;
          }
        }
      }

      if (shouldUpdateSharedValue) {
        preparedGesture.animatedHandlers.value = newHandlersValue;
      }
    }

    scheduleFlushOperations();
  });
}

function needsToReattach(
  preparedGesture: GestureConfigReference,
  gesture: GestureType[]
) {
  if (gesture.length !== preparedGesture.config.length) {
    return true;
  }
  for (let i = 0; i < gesture.length; i++) {
    if (
      gesture[i].handlerName !== preparedGesture.config[i].handlerName ||
      gesture[i].shouldUseReanimated !==
        preparedGesture.config[i].shouldUseReanimated
    ) {
      return true;
    }
  }

  return false;
}

function isStateChangeEvent(
  event: GestureUpdateEvent | GestureStateChangeEvent | GestureTouchEvent
): event is GestureStateChangeEvent {
  'worklet';
  // @ts-ignore Yes, the oldState prop is missing on GestureTouchEvent, that's the point
  return event.oldState != null;
}

function isTouchEvent(
  event: GestureUpdateEvent | GestureStateChangeEvent | GestureTouchEvent
): event is GestureTouchEvent {
  'worklet';
  return event.eventType != null;
}

function getHandler(
  type: CALLBACK_TYPE,
  gesture: HandlerCallbacks<Record<string, unknown>>
) {
  'worklet';
  switch (type) {
    case CALLBACK_TYPE.BEGAN:
      return gesture.onBegin;
    case CALLBACK_TYPE.START:
      return gesture.onStart;
    case CALLBACK_TYPE.UPDATE:
      return gesture.onUpdate;
    case CALLBACK_TYPE.CHANGE:
      return gesture.onChange;
    case CALLBACK_TYPE.END:
      return gesture.onEnd;
    case CALLBACK_TYPE.FINALIZE:
      return gesture.onFinalize;
    case CALLBACK_TYPE.TOUCHES_DOWN:
      return gesture.onTouchesDown;
    case CALLBACK_TYPE.TOUCHES_MOVE:
      return gesture.onTouchesMove;
    case CALLBACK_TYPE.TOUCHES_UP:
      return gesture.onTouchesUp;
    case CALLBACK_TYPE.TOUCHES_CANCELLED:
      return gesture.onTouchesCancelled;
  }
}

function touchEventTypeToCallbackType(
  eventType: TouchEventType
): CALLBACK_TYPE {
  'worklet';
  switch (eventType) {
    case TouchEventType.TOUCHES_DOWN:
      return CALLBACK_TYPE.TOUCHES_DOWN;
    case TouchEventType.TOUCHES_MOVE:
      return CALLBACK_TYPE.TOUCHES_MOVE;
    case TouchEventType.TOUCHES_UP:
      return CALLBACK_TYPE.TOUCHES_UP;
    case TouchEventType.TOUCHES_CANCELLED:
      return CALLBACK_TYPE.TOUCHES_CANCELLED;
  }
  return CALLBACK_TYPE.UNDEFINED;
}

function runWorklet(
  type: CALLBACK_TYPE,
  gesture: HandlerCallbacks<Record<string, unknown>>,
  event: GestureStateChangeEvent | GestureUpdateEvent | GestureTouchEvent,
  ...args: any[]
) {
  'worklet';
  const handler = getHandler(type, gesture);
  if (gesture.isWorklet[type]) {
    // @ts-ignore Logic below makes sure the correct event is send to the
    // correct handler.
    handler?.(event, ...args);
  } else if (handler) {
    console.warn(tagMessage('Animated gesture callback must be a worklet'));
  }
}

function useAnimatedGesture(
  preparedGesture: GestureConfigReference,
  needsRebuild: boolean
) {
  if (!Reanimated) {
    return;
  }

  // Hooks are called conditionally, but the condition is whether the
  // react-native-reanimated is installed, which shouldn't change while running
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const sharedHandlersCallbacks = Reanimated.useSharedValue<
    HandlerCallbacks<Record<string, unknown>>[] | null
  >(null);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const lastUpdateEvent = Reanimated.useSharedValue<
    (GestureUpdateEvent | undefined)[]
  >([]);

  // not every gesture needs a state controller, init them lazily
  const stateControllers: GestureStateManagerType[] = [];

  const callback = (
    event: GestureStateChangeEvent | GestureUpdateEvent | GestureTouchEvent
  ) => {
    'worklet';

    const currentCallback = sharedHandlersCallbacks.value;
    if (!currentCallback) {
      return;
    }

    for (let i = 0; i < currentCallback.length; i++) {
      const gesture = currentCallback[i];

      if (event.handlerTag === gesture.handlerTag) {
        if (isStateChangeEvent(event)) {
          if (
            event.oldState === State.UNDETERMINED &&
            event.state === State.BEGAN
          ) {
            runWorklet(CALLBACK_TYPE.BEGAN, gesture, event);
          } else if (
            (event.oldState === State.BEGAN ||
              event.oldState === State.UNDETERMINED) &&
            event.state === State.ACTIVE
          ) {
            runWorklet(CALLBACK_TYPE.START, gesture, event);
            lastUpdateEvent.value[gesture.handlerTag] = undefined;
          } else if (
            event.oldState !== event.state &&
            event.state === State.END
          ) {
            if (event.oldState === State.ACTIVE) {
              runWorklet(CALLBACK_TYPE.END, gesture, event, true);
            }
            runWorklet(CALLBACK_TYPE.FINALIZE, gesture, event, true);
          } else if (
            (event.state === State.FAILED || event.state === State.CANCELLED) &&
            event.state !== event.oldState
          ) {
            if (event.oldState === State.ACTIVE) {
              runWorklet(CALLBACK_TYPE.END, gesture, event, false);
            }
            runWorklet(CALLBACK_TYPE.FINALIZE, gesture, event, false);
          }
        } else if (isTouchEvent(event)) {
          if (!stateControllers[i]) {
            stateControllers[i] = GestureStateManager.create(event.handlerTag);
          }

          if (event.eventType !== TouchEventType.UNDETERMINED) {
            runWorklet(
              touchEventTypeToCallbackType(event.eventType),
              gesture,
              event,
              stateControllers[i]
            );
          }
        } else {
          runWorklet(CALLBACK_TYPE.UPDATE, gesture, event);

          if (gesture.onChange && gesture.changeEventCalculator) {
            runWorklet(
              CALLBACK_TYPE.CHANGE,
              gesture,
              gesture.changeEventCalculator?.(
                event,
                lastUpdateEvent.value[gesture.handlerTag]
              )
            );

            lastUpdateEvent.value[gesture.handlerTag] = event;
          }
        }
      }
    }
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const event = Reanimated.useEvent(
    callback,
    ['onGestureHandlerStateChange', 'onGestureHandlerEvent'],
    needsRebuild
  );

  preparedGesture.animatedEventHandler = event;
  preparedGesture.animatedHandlers = sharedHandlersCallbacks;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateDetectorChildren(ref: any) {
  // finds the first native view under the Wrap component and traverses the fiber tree upwards
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const wrapType = ref._reactInternals.elementType;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    let instance = RNRenderer.findHostInstance_DEPRECATED(ref)
      ._internalFiberInstanceHandleDEV;

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

interface GestureDetectorProps {
  gesture?: ComposedGesture | GestureType;
  children?: React.ReactNode;
}
export const GestureDetector = (props: GestureDetectorProps) => {
  const gestureConfig = props.gesture;
  const gesture = gestureConfig?.toGestureArray?.() ?? [];
  const useReanimatedHook = gesture.some((g) => g.shouldUseReanimated);
  const viewRef = useRef(null);
  const firstRenderRef = useRef(true);
  const webEventHandlersRef = useRef<WebEventHandler>({
    onGestureHandlerEvent: (e: HandlerStateChangeEvent<unknown>) => {
      onGestureHandlerEvent(e.nativeEvent);
    },
    onGestureHandlerStateChange: isExperimentalWebImplementationEnabled()
      ? (e: HandlerStateChangeEvent<unknown>) => {
          onGestureHandlerEvent(e.nativeEvent);
        }
      : undefined,
  });

  const preparedGesture = React.useRef<GestureConfigReference>({
    config: gesture,
    animatedEventHandler: null,
    animatedHandlers: null,
    firstExecution: true,
    useReanimatedHook: useReanimatedHook,
  }).current;

  if (useReanimatedHook !== preparedGesture.useReanimatedHook) {
    throw new Error(
      tagMessage(
        'You cannot change the thread the callbacks are ran on while the app is running'
      )
    );
  }

  // Reanimated event should be rebuilt only when gestures are reattached, otherwise
  // config update will be enough as all necessary items are stored in shared values anyway
  const needsToRebuildReanimatedEvent =
    preparedGesture.firstExecution || needsToReattach(preparedGesture, gesture);

  if (preparedGesture.firstExecution) {
    gestureConfig?.initialize?.();
  }

  if (useReanimatedHook) {
    // Whether animatedGesture or gesture is used shouldn't change while the app is running
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedGesture(preparedGesture, needsToRebuildReanimatedEvent);
  }

  useEffect(() => {
    firstRenderRef.current = true;
    const viewTag = findNodeHandle(viewRef.current) as number;

    validateDetectorChildren(viewRef.current);
    attachHandlers({
      preparedGesture,
      gestureConfig,
      gesture,
      viewTag,
      webEventHandlersRef,
    });

    return () => {
      dropHandlers(preparedGesture);
    };
  }, []);

  useEffect(() => {
    if (!firstRenderRef.current) {
      const viewTag = findNodeHandle(viewRef.current) as number;

      if (needsToReattach(preparedGesture, gesture)) {
        validateDetectorChildren(viewRef.current);
        dropHandlers(preparedGesture);
        attachHandlers({
          preparedGesture,
          gestureConfig,
          gesture,
          viewTag,
          webEventHandlersRef,
        });
      } else {
        updateHandlers(preparedGesture, gestureConfig, gesture);
      }
    } else {
      firstRenderRef.current = false;
    }
  }, [props]);

  const refFunction = (ref: unknown) => {
    if (ref !== null) {
      //@ts-ignore Just setting the ref
      viewRef.current = ref;

      if (isFabric()) {
        const node = getShadowNodeFromRef(ref);
        if (global.isFormsStackingContext(node) === false) {
          console.error(
            tagMessage(
              'GestureDetector has received a child that may get view-flattened. ' +
                '\nTo prevent it from misbehaving you need to wrap the child with a `<View collapsable={false}>`.'
            )
          );
        }
      }
    }
  };

  if (useReanimatedHook) {
    return (
      <AnimatedWrap
        ref={refFunction}
        onGestureHandlerEvent={preparedGesture.animatedEventHandler}>
        {props.children}
      </AnimatedWrap>
    );
  } else {
    return <Wrap ref={refFunction}>{props.children}</Wrap>;
  }
};

class Wrap extends React.Component<{
  onGestureHandlerEvent?: unknown;
  // implicit `children` prop has been removed in @types/react^18.0.0
  children?: React.ReactNode;
}> {
  render() {
    try {
      // I don't think that fighting with types over such a simple function is worth it
      // The only thing it does is add 'collapsable: false' to the child component
      // to make sure it is in the native view hierarchy so the detector can find
      // correct viewTag to attach to.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const child: any = React.Children.only(this.props.children);
      return React.cloneElement(
        child,
        { collapsable: false },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        child.props.children
      );
    } catch (e) {
      throw new Error(
        tagMessage(
          `GestureDetector got more than one view as a child. If you want the gesture to work on multiple views, wrap them with a common parent and attach the gesture to that view.`
        )
      );
    }
  }
}

const AnimatedWrap = Reanimated?.default?.createAnimatedComponent(Wrap) ?? Wrap;
