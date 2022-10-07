import * as React from 'react';
import {
  Platform,
  UIManager,
  DeviceEventEmitter,
  EmitterSubscription,
} from 'react-native';
// @ts-ignore - it isn't typed by TS & don't have definitelyTyped types
import deepEqual from 'lodash/isEqual';
import RNGestureHandlerModule from '../RNGestureHandlerModule';
import type RNGestureHandlerModuleWeb from '../RNGestureHandlerModule.web';
import { State } from '../State';
import {
  handlerIDToTag,
  getNextHandlerTag,
  registerOldGestureHandler,
} from './handlersRegistry';

import {
  BaseGestureHandlerProps,
  filterConfig,
  GestureEvent,
  HandlerStateChangeEvent,
  findNodeHandle,
  scheduleFlushOperations,
} from './gestureHandlerCommon';
import { ValueOf } from '../typeUtils';
import { isFabric, isJestEnv, tagMessage } from '../utils';
import { ActionType } from '../ActionType';
import { PressabilityDebugView } from './PressabilityDebugView';

const UIManagerAny = UIManager as any;

const customGHEventsConfigFabricAndroid = {
  topOnGestureHandlerEvent: { registrationName: 'onGestureHandlerEvent' },
  topOnGestureHandlerStateChange: {
    registrationName: 'onGestureHandlerStateChange',
  },
};

const customGHEventsConfig = {
  onGestureHandlerEvent: { registrationName: 'onGestureHandlerEvent' },
  onGestureHandlerStateChange: {
    registrationName: 'onGestureHandlerStateChange',
  },

  // When using React Native Gesture Handler for Animated.event with useNativeDriver: true
  // on Android with Fabric enabled, the native part still sends the native events to JS
  // but prefixed with "top". We cannot simply rename the events above so they are prefixed
  // with "top" instead of "on" because in such case Animated.events would not be registered.
  // That's why we need to register another pair of event names.
  // The incoming events will be queued but never handled.
  // Without this piece of code below, you'll get the following JS error:
  // Unsupported top level event type "topOnGestureHandlerEvent" dispatched
  ...(isFabric() &&
    Platform.OS === 'android' &&
    customGHEventsConfigFabricAndroid),
};

// Add gesture specific events to genericDirectEventTypes object exported from UIManager
// native module.
// Once new event types are registered with react it is possible to dispatch these
// events to all kind of native views.
UIManagerAny.genericDirectEventTypes = {
  ...UIManagerAny.genericDirectEventTypes,
  ...customGHEventsConfig,
};
// In newer versions of RN the `genericDirectEventTypes` is located in the object
// returned by UIManager.getViewManagerConfig('getConstants') or in older RN UIManager.getConstants(), we need to add it there as well to make
// it compatible with RN 61+
const UIManagerConstants =
  UIManagerAny.getViewManagerConfig?.('getConstants') ??
  UIManagerAny.getConstants?.();

if (UIManagerConstants) {
  UIManagerConstants.genericDirectEventTypes = {
    ...UIManagerConstants.genericDirectEventTypes,
    ...customGHEventsConfig,
  };
}

// Wrap JS responder calls and notify gesture handler manager
const {
  setJSResponder: oldSetJSResponder = () => {
    //no operation
  },
  clearJSResponder: oldClearJSResponder = () => {
    //no operation
  },
} = UIManagerAny;
UIManagerAny.setJSResponder = (tag: number, blockNativeResponder: boolean) => {
  RNGestureHandlerModule.handleSetJSResponder(tag, blockNativeResponder);
  oldSetJSResponder(tag, blockNativeResponder);
};
UIManagerAny.clearJSResponder = () => {
  RNGestureHandlerModule.handleClearJSResponder();
  oldClearJSResponder();
};

let allowTouches = true;
const DEV_ON_ANDROID = __DEV__ && Platform.OS === 'android';
// Toggled inspector blocks touch events in order to allow inspecting on Android
// This needs to be a global variable in order to set initial state for `allowTouches` property in Handler component
if (DEV_ON_ANDROID) {
  DeviceEventEmitter.addListener('toggleElementInspector', () => {
    allowTouches = !allowTouches;
  });
}

type HandlerProps<T extends Record<string, unknown>> = Readonly<
  React.PropsWithChildren<BaseGestureHandlerProps<T>>
>;
function hasUnresolvedRefs<T extends Record<string, unknown>>(
  props: HandlerProps<T>
) {
  // TODO(TS) - add type for extract arg
  const extract = (refs: any | any[]) => {
    if (!Array.isArray(refs)) {
      return refs && refs.current === null;
    }
    return refs.some((r) => r && r.current === null);
  };
  return extract(props['simultaneousHandlers']) || extract(props['waitFor']);
}

const stateToPropMappings = {
  [State.UNDETERMINED]: undefined,
  [State.BEGAN]: 'onBegan',
  [State.FAILED]: 'onFailed',
  [State.CANCELLED]: 'onCancelled',
  [State.ACTIVE]: 'onActivated',
  [State.END]: 'onEnded',
} as const;

type CreateHandlerArgs<
  HandlerPropsT extends Record<string, unknown>
> = Readonly<{
  name: string;
  allowedProps: Readonly<Extract<keyof HandlerPropsT, string>[]>;
  config: Readonly<Record<string, unknown>>;
  transformProps?: (props: HandlerPropsT) => HandlerPropsT;
  customNativeProps?: Readonly<string[]>;
}>;

// TODO(TS) fix event types
type InternalEventHandlers = {
  onGestureHandlerEvent?: (event: any) => void;
  onGestureHandlerStateChange?: (event: any) => void;
};

const UNRESOLVED_REFS_RETRY_LIMIT = 1;

// TODO(TS) - make sure that BaseGestureHandlerProps doesn't need other generic parameter to work with custom properties.
export default function createHandler<
  T extends BaseGestureHandlerProps<U>,
  U extends Record<string, unknown>
>({
  name,
  allowedProps = [],
  config = {},
  transformProps,
  customNativeProps = [],
}: CreateHandlerArgs<T>): React.ComponentType<T & React.RefAttributes<any>> {
  interface HandlerState {
    allowTouches: boolean;
  }
  class Handler extends React.Component<
    T & InternalEventHandlers,
    HandlerState
  > {
    static displayName = name;

    private handlerTag: number;
    private config: Record<string, unknown>;
    private propsRef: React.MutableRefObject<unknown>;
    private viewNode: any;
    private viewTag?: number;
    private updateEnqueued: ReturnType<typeof setImmediate> | null = null;
    private inspectorToggleListener?: EmitterSubscription;

    constructor(props: T & InternalEventHandlers) {
      super(props);
      this.handlerTag = getNextHandlerTag();
      this.config = {};
      this.propsRef = React.createRef();
      this.state = { allowTouches };
      if (props.id) {
        if (handlerIDToTag[props.id] !== undefined) {
          throw new Error(`Handler with ID "${props.id}" already registered`);
        }
        handlerIDToTag[props.id] = this.handlerTag;
      }
    }

    componentDidMount() {
      const props: HandlerProps<U> = this.props;

      if (DEV_ON_ANDROID) {
        this.inspectorToggleListener = DeviceEventEmitter.addListener(
          'toggleElementInspector',
          () => {
            this.setState((_) => ({ allowTouches }));
            this.update(UNRESOLVED_REFS_RETRY_LIMIT);
          }
        );
      }
      if (hasUnresolvedRefs(props)) {
        // If there are unresolved refs (e.g. ".current" has not yet been set)
        // passed as `simultaneousHandlers` or `waitFor`, we enqueue a call to
        // _update method that will try to update native handler props using
        // setImmediate. This makes it so update() function gets called after all
        // react components are mounted and we expect the missing ref object to
        // be resolved by then.
        this.updateEnqueued = setImmediate(() => {
          this.updateEnqueued = null;
          this.update(UNRESOLVED_REFS_RETRY_LIMIT);
        });
      }

      this.createGestureHandler(
        filterConfig(
          transformProps ? transformProps(this.props) : this.props,
          [...allowedProps, ...customNativeProps],
          config
        )
      );

      this.attachGestureHandler(findNodeHandle(this.viewNode) as number); // TODO(TS) - check if this can be null
    }

    componentDidUpdate() {
      const viewTag = findNodeHandle(this.viewNode);
      if (this.viewTag !== viewTag) {
        this.attachGestureHandler(viewTag as number); // TODO(TS) - check interaction between _viewTag & findNodeHandle
      }
      this.update(UNRESOLVED_REFS_RETRY_LIMIT);
    }

    componentWillUnmount() {
      this.inspectorToggleListener?.remove();
      RNGestureHandlerModule.dropGestureHandler(this.handlerTag);
      scheduleFlushOperations();
      if (this.updateEnqueued) {
        clearImmediate(this.updateEnqueued);
      }
      // We can't use this.props.id directly due to TS generic type narrowing bug, see https://github.com/microsoft/TypeScript/issues/13995 for more context
      const handlerID: string | undefined = this.props.id;
      if (handlerID) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete handlerIDToTag[handlerID];
      }
    }

    private onGestureHandlerEvent = (event: GestureEvent<U>) => {
      if (event.nativeEvent.handlerTag === this.handlerTag) {
        if (typeof this.props.onGestureEvent === 'function') {
          this.props.onGestureEvent?.(event);
        }
      } else {
        this.props.onGestureHandlerEvent?.(event);
      }
    };

    // TODO(TS) - make sure this is right type for event
    private onGestureHandlerStateChange = (
      event: HandlerStateChangeEvent<U>
    ) => {
      if (event.nativeEvent.handlerTag === this.handlerTag) {
        if (typeof this.props.onHandlerStateChange === 'function') {
          this.props.onHandlerStateChange?.(event);
        }

        const state: ValueOf<typeof State> = event.nativeEvent.state;
        const stateEventName = stateToPropMappings[state];
        const eventHandler = stateEventName && this.props[stateEventName];
        if (eventHandler && typeof eventHandler === 'function') {
          eventHandler(event);
        }
      } else {
        this.props.onGestureHandlerStateChange?.(event);
      }
    };

    private refHandler = (node: any) => {
      this.viewNode = node;

      const child = React.Children.only(this.props.children);
      // TODO(TS) fix ref type
      const { ref }: any = child;
      if (ref !== null) {
        if (typeof ref === 'function') {
          ref(node);
        } else {
          ref.current = node;
        }
      }
    };

    private createGestureHandler = (
      newConfig: Readonly<Record<string, unknown>>
    ) => {
      this.config = newConfig;

      RNGestureHandlerModule.createGestureHandler(
        name,
        this.handlerTag,
        newConfig
      );
    };

    private attachGestureHandler = (newViewTag: number) => {
      this.viewTag = newViewTag;

      if (Platform.OS === 'web') {
        // typecast due to dynamic resolution, attachGestureHandler should have web version signature in this branch
        (RNGestureHandlerModule.attachGestureHandler as typeof RNGestureHandlerModuleWeb.attachGestureHandler)(
          this.handlerTag,
          newViewTag,
          ActionType.JS_FUNCTION_OLD_API, // ignored on web
          this.propsRef
        );
      } else {
        registerOldGestureHandler(this.handlerTag, {
          onGestureEvent: this.onGestureHandlerEvent,
          onGestureStateChange: this.onGestureHandlerStateChange,
        });

        const actionType = (() => {
          if (
            this.props?.onGestureEvent &&
            'current' in this.props.onGestureEvent
          ) {
            // Reanimated worklet
            return ActionType.REANIMATED_WORKLET;
          } else if (
            this.props?.onGestureEvent &&
            '__isNative' in this.props.onGestureEvent
          ) {
            // Animated.event with useNativeDriver: true
            return ActionType.NATIVE_ANIMATED_EVENT;
          } else {
            // JS callback or Animated.event with useNativeDriver: false
            return ActionType.JS_FUNCTION_OLD_API;
          }
        })();

        RNGestureHandlerModule.attachGestureHandler(
          this.handlerTag,
          newViewTag,
          actionType
        );
      }

      scheduleFlushOperations();
    };

    private updateGestureHandler = (
      newConfig: Readonly<Record<string, unknown>>
    ) => {
      this.config = newConfig;

      RNGestureHandlerModule.updateGestureHandler(this.handlerTag, newConfig);
      scheduleFlushOperations();
    };

    private update(remainingTries: number) {
      const props: HandlerProps<U> = this.props;

      // When ref is set via a function i.e. `ref={(r) => refObject.current = r}` instead of
      // `ref={refObject}` it's possible that it won't be resolved in time. Seems like trying
      // again is easy enough fix.
      if (hasUnresolvedRefs(props) && remainingTries > 0) {
        this.updateEnqueued = setImmediate(() => {
          this.updateEnqueued = null;
          this.update(remainingTries - 1);
        });
      } else {
        const newConfig = filterConfig(
          transformProps ? transformProps(this.props) : this.props,
          [...allowedProps, ...customNativeProps],
          config
        );
        if (!deepEqual(this.config, newConfig)) {
          this.updateGestureHandler(newConfig);
        }
      }
    }

    setNativeProps(updates: any) {
      const mergedProps = { ...this.props, ...updates };
      const newConfig = filterConfig(
        transformProps ? transformProps(mergedProps) : mergedProps,
        [...allowedProps, ...customNativeProps],
        config
      );
      this.updateGestureHandler(newConfig);
    }

    render() {
      let gestureEventHandler = this.onGestureHandlerEvent;
      // Another instance of https://github.com/microsoft/TypeScript/issues/13995
      type OnGestureEventHandlers = {
        onGestureEvent?: BaseGestureHandlerProps<U>['onGestureEvent'];
        onGestureHandlerEvent?: InternalEventHandlers['onGestureHandlerEvent'];
      };
      const {
        onGestureEvent,
        onGestureHandlerEvent,
      }: OnGestureEventHandlers = this.props;

      if (onGestureEvent && typeof onGestureEvent !== 'function') {
        // If it's not a method it should be an native Animated.event
        // object. We set it directly as the handler for the view
        // In this case nested handlers are not going to be supported
        if (onGestureHandlerEvent) {
          throw new Error(
            'Nesting touch handlers with native animated driver is not supported yet'
          );
        }
        gestureEventHandler = onGestureEvent;
      } else {
        if (
          onGestureHandlerEvent &&
          typeof onGestureHandlerEvent !== 'function'
        ) {
          throw new Error(
            'Nesting touch handlers with native animated driver is not supported yet'
          );
        }
      }

      let gestureStateEventHandler = this.onGestureHandlerStateChange;
      // Another instance of https://github.com/microsoft/TypeScript/issues/13995
      type OnGestureStateChangeHandlers = {
        onHandlerStateChange?: BaseGestureHandlerProps<U>['onHandlerStateChange'];
        onGestureHandlerStateChange?: InternalEventHandlers['onGestureHandlerStateChange'];
      };
      const {
        onHandlerStateChange,
        onGestureHandlerStateChange,
      }: OnGestureStateChangeHandlers = this.props;
      if (onHandlerStateChange && typeof onHandlerStateChange !== 'function') {
        // If it's not a method it should be an native Animated.event
        // object. We set it directly as the handler for the view
        // In this case nested handlers are not going to be supported
        if (onGestureHandlerStateChange) {
          throw new Error(
            'Nesting touch handlers with native animated driver is not supported yet'
          );
        }
        gestureStateEventHandler = onHandlerStateChange;
      } else {
        if (
          onGestureHandlerStateChange &&
          typeof onGestureHandlerStateChange !== 'function'
        ) {
          throw new Error(
            'Nesting touch handlers with native animated driver is not supported yet'
          );
        }
      }
      const events = {
        onGestureHandlerEvent: this.state.allowTouches
          ? gestureEventHandler
          : undefined,
        onGestureHandlerStateChange: this.state.allowTouches
          ? gestureStateEventHandler
          : undefined,
      };

      this.propsRef.current = events;

      let child: any = null;
      try {
        child = React.Children.only(this.props.children);
      } catch (e) {
        throw new Error(
          tagMessage(
            `${name} got more than one view as a child. If you want the gesture to work on multiple views, wrap them with a common parent and attach the gesture to that view.`
          )
        );
      }

      let grandChildren = child.props.children;
      if (
        __DEV__ &&
        child.type &&
        (child.type === 'RNGestureHandlerButton' ||
          child.type.name === 'View' ||
          child.type.displayName === 'View')
      ) {
        grandChildren = React.Children.toArray(grandChildren);
        grandChildren.push(
          <PressabilityDebugView
            key="pressabilityDebugView"
            color="mediumspringgreen"
            hitSlop={child.props.hitSlop}
          />
        );
      }

      return React.cloneElement(
        child,
        {
          ref: this.refHandler,
          collapsable: false,
          ...(isJestEnv()
            ? {
                handlerType: name,
                handlerTag: this.handlerTag,
              }
            : {}),
          testID: this.props.testID ?? child.props.testID,
          ...events,
        },
        grandChildren
      );
    }
  }
  return Handler;
}
