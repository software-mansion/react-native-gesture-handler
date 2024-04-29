import React, { useContext, useEffect, useRef, useState } from 'react';
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
  UserSelect,
  TouchAction,
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
import { hoverGestureHandlerProps } from './hoverGesture';
import { State } from '../../State';
import { TouchEventType } from '../../TouchEventType';
import { ComposedGesture } from './gestureComposition';
import { ActionType } from '../../ActionType';
import { isFabric, isJestEnv, tagMessage } from '../../utils';
import { getReactNativeVersion } from '../../getReactNativeVersion';
import { getShadowNodeFromRef } from '../../getShadowNodeFromRef';
import { Platform } from 'react-native';
import { onGestureHandlerEvent } from './eventReceiver';
import { RNRenderer } from '../../RNRenderer';
import { isNewWebImplementationEnabled } from '../../EnableNewWebImplementation';
import { nativeViewGestureHandlerProps } from '../NativeViewGestureHandler';
import GestureHandlerRootViewContext from '../../GestureHandlerRootViewContext';
import { ghQueueMicrotask } from '../../ghQueueMicrotask';

type AttachGestureHandlerWeb = (
  handlerTag: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newView: any,
  _actionType: ActionType,
  propsRef: React.RefObject<unknown>
) => void;

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
  ...hoverGestureHandlerProps,
  ...nativeViewGestureHandlerProps,
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
  gestureConfig: ComposedGesture | GestureType;
  gesture: GestureType[];
  viewTag: number;
  webEventHandlersRef: React.RefObject<WebEventHandler>;
  mountedRef: React.RefObject<boolean>;
}

function attachHandlers({
  preparedGesture,
  gestureConfig,
  gesture,
  viewTag,
  webEventHandlersRef,
  mountedRef,
}: AttachHandlersConfig) {
  if (!preparedGesture.firstExecution) {
    gestureConfig.initialize();
  } else {
    preparedGesture.firstExecution = false;
  }

  // use queueMicrotask to extract handlerTags, because all refs should be initialized
  // when it's ran
  ghQueueMicrotask(() => {
    if (!mountedRef.current) {
      return;
    }
    gestureConfig.prepare();
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

  // use queueMicrotask to extract handlerTags, because all refs should be initialized
  // when it's ran
  ghQueueMicrotask(() => {
    if (!mountedRef.current) {
      return;
    }
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

      let blocksHandlers: number[] = [];
      if (handler.config.blocksHandlers) {
        blocksHandlers = extractValidHandlerTags(handler.config.blocksHandlers);
      }

      RNGestureHandlerModule.updateGestureHandler(
        handler.handlerTag,
        filterConfig(handler.config, ALLOWED_PROPS, {
          simultaneousHandlers: simultaneousWith,
          waitFor: requireToFail,
          blocksHandlers: blocksHandlers,
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
      (RNGestureHandlerModule.attachGestureHandler as AttachGestureHandlerWeb)(
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

    preparedGesture.animatedHandlers.value = gesture
      .filter(isAnimatedGesture)
      .map((g) => g.handlers) as unknown as HandlerCallbacks<
      Record<string, unknown>
    >[];
  }
}

function updateHandlers(
  preparedGesture: GestureConfigReference,
  gestureConfig: ComposedGesture | GestureType,
  gesture: GestureType[],
  mountedRef: React.RefObject<boolean>
) {
  gestureConfig.prepare();

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

  // use queueMicrotask to extract handlerTags, because when it's ran, all refs should be updated
  // and handlerTags in BaseGesture references should be updated in the loop above (we need to wait
  // in case of external relations)
  ghQueueMicrotask(() => {
    if (!mountedRef.current) {
      return;
    }
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
      const newHandlersValue = preparedGesture.config
        .filter((g) => g.shouldUseReanimated) // ignore gestures that shouldn't run on UI
        .map((g) => g.handlers) as unknown as HandlerCallbacks<
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
    const REACT_NATIVE_VERSION = getReactNativeVersion();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const wrapType =
      REACT_NATIVE_VERSION.minor > 63 || REACT_NATIVE_VERSION.major > 0
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          ref._reactInternals.elementType
        : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          ref._reactInternalFiber.elementType;
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

const applyUserSelectProp = (
  userSelect: UserSelect,
  gesture: ComposedGesture | GestureType
): void => {
  for (const g of gesture.toGestureArray()) {
    g.config.userSelect = userSelect;
  }
};

const applyEnableContextMenuProp = (
  enableContextMenu: boolean,
  gesture: ComposedGesture | GestureType
): void => {
  for (const g of gesture.toGestureArray()) {
    g.config.enableContextMenu = enableContextMenu;
  }
};

const applyTouchActionProp = (
  touchAction: TouchAction,
  gesture: ComposedGesture | GestureType
): void => {
  for (const g of gesture.toGestureArray()) {
    g.config.touchAction = touchAction;
  }
};

interface GestureDetectorProps {
  /**
   * A gesture object containing the configuration and callbacks.
   * Can be any of:
   * - base gestures (`Tap`, `Pan`, ...)
   * - `ComposedGesture` (`Race`, `Simultaneous`, `Exclusive`)
   */
  gesture: ComposedGesture | GestureType;
  children?: React.ReactNode;

  /**
   * #### Web only
   * This parameter allows to specify which `userSelect` property should be applied to underlying view.
   * Possible values are `"none" | "auto" | "text"`. Default value is set to `"none"`.
   */
  userSelect?: UserSelect;
  /**
   * #### Web only
   * Specifies whether context menu should be enabled after clicking on underlying view with right mouse button.
   * Default value is set to `false`.
   */
  enableContextMenu?: boolean;
  /**
   * #### Web only
   * This parameter allows to specify which `touchAction` property should be applied to underlying view.
   * Supports all CSS touch-action values (e.g. `"none"`, `"pan-y"`). Default value is set to `"none"`.
   */
  touchAction?: TouchAction;
}
interface GestureDetectorState {
  firstRender: boolean;
  viewRef: React.Component | null;
  previousViewTag: number;
  forceReattach: boolean;
}

/**
 * `GestureDetector` is responsible for creating and updating native gesture handlers based on the config of provided gesture.
 *
 * ### Props
 * - `gesture`
 * - `userSelect` (**Web only**)
 * - `enableContextMenu` (**Web only**)
 * - `touchAction` (**Web only**)
 *
 * ### Remarks
 * - Gesture Detector will use first native view in its subtree to recognize gestures, however if this view is used only to group its children it may get automatically collapsed.
 * - Using the same instance of a gesture across multiple Gesture Detectors is not possible.
 *
 * @see https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/gesture-detector
 */
export const GestureDetector = (props: GestureDetectorProps) => {
  const rootViewContext = useContext(GestureHandlerRootViewContext);
  if (__DEV__ && !rootViewContext && !isJestEnv() && Platform.OS !== 'web') {
    throw new Error(
      'GestureDetector must be used as a descendant of GestureHandlerRootView. Otherwise the gestures will not be recognized. See https://docs.swmansion.com/react-native-gesture-handler/docs/installation for more details.'
    );
  }

  const gestureConfig = props.gesture;

  if (props.userSelect) {
    applyUserSelectProp(props.userSelect, gestureConfig);
  }

  if (props.enableContextMenu !== undefined) {
    applyEnableContextMenuProp(props.enableContextMenu, gestureConfig);
  }

  if (props.touchAction !== undefined) {
    applyTouchActionProp(props.touchAction, gestureConfig);
  }

  const gesture = gestureConfig.toGestureArray();
  const useReanimatedHook = gesture.some((g) => g.shouldUseReanimated);

  // store state in ref to prevent unnecessary renders
  const state = useRef<GestureDetectorState>({
    firstRender: true,
    viewRef: null,
    previousViewTag: -1,
    forceReattach: false,
  }).current;
  const mountedRef = useRef(false);
  const webEventHandlersRef = useRef<WebEventHandler>({
    onGestureHandlerEvent: (e: HandlerStateChangeEvent<unknown>) => {
      onGestureHandlerEvent(e.nativeEvent);
    },
    onGestureHandlerStateChange: isNewWebImplementationEnabled()
      ? (e: HandlerStateChangeEvent<unknown>) => {
          onGestureHandlerEvent(e.nativeEvent);
        }
      : undefined,
  });

  const [renderState, setRenderState] = useState(false);
  function forceRender() {
    setRenderState(!renderState);
  }

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

  function onHandlersUpdate(skipConfigUpdate?: boolean) {
    // if the underlying view has changed we need to reattach handlers to the new view
    const viewTag = findNodeHandle(state.viewRef) as number;
    const forceReattach = viewTag !== state.previousViewTag;

    if (forceReattach || needsToReattach(preparedGesture, gesture)) {
      validateDetectorChildren(state.viewRef);
      dropHandlers(preparedGesture);
      attachHandlers({
        preparedGesture,
        gestureConfig,
        gesture,
        webEventHandlersRef,
        viewTag,
        mountedRef,
      });

      state.previousViewTag = viewTag;
      state.forceReattach = forceReattach;
      if (forceReattach) {
        forceRender();
      }
    } else if (!skipConfigUpdate) {
      updateHandlers(preparedGesture, gestureConfig, gesture, mountedRef);
    }
  }

  // Reanimated event should be rebuilt only when gestures are reattached, otherwise
  // config update will be enough as all necessary items are stored in shared values anyway
  const needsToRebuildReanimatedEvent =
    preparedGesture.firstExecution ||
    needsToReattach(preparedGesture, gesture) ||
    state.forceReattach;

  state.forceReattach = false;

  if (preparedGesture.firstExecution) {
    gestureConfig.initialize();
  }

  if (useReanimatedHook) {
    // Whether animatedGesture or gesture is used shouldn't change while the app is running
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedGesture(preparedGesture, needsToRebuildReanimatedEvent);
  }

  useEffect(() => {
    const viewTag = findNodeHandle(state.viewRef) as number;
    state.firstRender = true;
    mountedRef.current = true;

    validateDetectorChildren(state.viewRef);

    attachHandlers({
      preparedGesture,
      gestureConfig,
      gesture,
      webEventHandlersRef,
      viewTag,
      mountedRef,
    });

    return () => {
      mountedRef.current = false;
      dropHandlers(preparedGesture);
    };
  }, []);

  useEffect(() => {
    if (!state.firstRender) {
      onHandlersUpdate();
    } else {
      state.firstRender = false;
    }
  }, [props]);

  const refFunction = (ref: unknown) => {
    if (ref !== null) {
      // @ts-ignore Just setting the view ref
      state.viewRef = ref;

      // if it's the first render, also set the previousViewTag to prevent reattaching gestures when not needed
      if (state.previousViewTag === -1) {
        state.previousViewTag = findNodeHandle(state.viewRef) as number;
      }

      // pass true as `skipConfigUpdate`, here we only want to trigger the eventual reattaching of handlers
      // in case the view has changed, while config update would be handled be the `useEffect` above
      onHandlersUpdate(true);

      if (isFabric() && global.isFormsStackingContext) {
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
