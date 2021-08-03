import * as React from 'react';
import {
  findNodeHandle as findNodeHandleRN,
  NativeModules,
  Platform,
  Touchable,
  NativeEventEmitter,
} from 'react-native';
// @ts-ignore - it isn't typed by TS & don't have definitelyTyped types
import deepEqual from 'fbjs/lib/areEqual';
import RNGestureHandlerModule from '../RNGestureHandlerModule';
import type RNGestureHandlerModuleWeb from '../RNGestureHandlerModule.web';
import { State } from '../State';
import {
  BaseGestureHandlerProps,
  GestureEvent,
  HandlerStateChangeEvent,
} from './gestureHandlers';
import { ValueOf } from '../typeUtils';
import { default as RNRenderer } from 'react-native/Libraries/Renderer/shims/ReactNative';

function findNodeHandle(
  node: null | number | React.Component<any, any> | React.ComponentClass<any>
): null | number | React.Component<any, any> | React.ComponentClass<any> {
  if (Platform.OS === 'web') return node;
  return findNodeHandleRN(node);
}

const { UIManager = {} } = NativeModules;

const customGHEventsConfig = {
  onGestureHandlerEvent: { registrationName: 'onGestureHandlerEvent' },
  onGestureHandlerStateChange: {
    registrationName: 'onGestureHandlerStateChange',
  },
};

// Add gesture specific events to genericDirectEventTypes object exported from UIManager
// native module.
// Once new event types are registered with react it is possible to dispatch these
// events to all kind of native views.
UIManager.genericDirectEventTypes = {
  ...UIManager.genericDirectEventTypes,
  ...customGHEventsConfig,
};
// In newer versions of RN the `genericDirectEventTypes` is located in the object
// returned by UIManager.getViewManagerConfig('getConstants') or in older RN UIManager.getConstants(), we need to add it there as well to make
// it compatible with RN 61+
const UIManagerConstants =
  UIManager.getViewManagerConfig?.('getConstants') ??
  UIManager.getConstants?.();

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
} = UIManager;
UIManager.setJSResponder = (tag: number, blockNativeResponder: boolean) => {
  RNGestureHandlerModule.handleSetJSResponder(tag, blockNativeResponder);
  oldSetJSResponder(tag, blockNativeResponder);
};
UIManager.clearJSResponder = () => {
  RNGestureHandlerModule.handleClearJSResponder();
  oldClearJSResponder();
};

let handlerTag = 1;
const handlerIDToTag: Record<string, number> = {};

function isConfigParam(param: unknown, name: string) {
  // param !== Object(param) returns false if `param` is a function
  // or an object and returns true if `param` is null
  return (
    param !== undefined &&
    (param !== Object(param) ||
      !('__isNative' in (param as Record<string, unknown>))) &&
    name !== 'onHandlerStateChange' &&
    name !== 'onGestureEvent'
  );
}

function filterConfig(
  props: Record<string, unknown>,
  validProps: string[],
  defaults: Record<string, unknown> = {}
) {
  const res = { ...defaults };
  validProps.forEach((key) => {
    const value = props[key];
    if (isConfigParam(value, key)) {
      let value = props[key];
      if (
        key === 'simultaneousHandlers' ||
        key === 'waitFor' ||
        key === 'after'
      ) {
        value = transformIntoHandlerTags(props[key]);
      } else if (key === 'hitSlop') {
        if (typeof value !== 'object') {
          value = { top: value, left: value, bottom: value, right: value };
        }
      }
      res[key] = value;
    }
  });
  return res;
}

function transformIntoHandlerTags(handlerIDs: any) {
  if (!Array.isArray(handlerIDs)) {
    handlerIDs = [handlerIDs];
  }

  if (Platform.OS === 'web') {
    return handlerIDs
      .map(({ current }: { current: any }) => current)
      .filter((handle: any) => handle);
  }
  // converts handler string IDs into their numeric tags
  return handlerIDs
    .map(
      (handlerID: any) =>
        handlerIDToTag[handlerID] || handlerID.current?.handlerTag || -1
    )
    .filter((handlerTag: number) => handlerTag > 0);
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
  return (
    extract(props['simultaneousHandlers']) ||
    extract(props['waitFor']) ||
    extract(props['after'])
  );
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
  class Handler extends React.Component<T & InternalEventHandlers> {
    static displayName = name;

    private handlerTag: number;
    private config: Record<string, unknown>;
    private propsRef: React.MutableRefObject<unknown>;
    private viewNode: any;
    private viewTag?: number;
    private updateEnqueued: ReturnType<typeof setImmediate> | null = null;

    constructor(props: T & InternalEventHandlers) {
      super(props);
      this.handlerTag = handlerTag++;
      this.config = {};
      this.propsRef = React.createRef();
      if (props.id) {
        if (handlerIDToTag[props.id] !== undefined) {
          throw new Error(`Handler with ID "${props.id}" already registered`);
        }
        handlerIDToTag[props.id] = this.handlerTag;
      }
    }

    componentDidMount() {
      const props: HandlerProps<U> = this.props;
      if (hasUnresolvedRefs(props)) {
        // If there are unresolved refs (e.g. ".current" has not yet been set)
        // passed as `simultaneousHandlers` or `waitFor`, we enqueue a call to
        // _update method that will try to update native handler props using
        // setImmediate. This makes it so _update function gets called after all
        // react components are mounted and we expect the missing ref object to
        // be resolved by then.
        this.updateEnqueued = setImmediate(() => {
          this.updateEnqueued = null;
          this.update();
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
      this.update();
    }

    componentWillUnmount() {
      RNGestureHandlerModule.dropGestureHandler(this.handlerTag);
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
        this.props.onGestureEvent?.(event);
      } else {
        this.props.onGestureHandlerEvent?.(event);
      }
    };

    // TODO(TS) - make sure this is right type for event
    private onGestureHandlerStateChange = (
      event: HandlerStateChangeEvent<U>
    ) => {
      if (event.nativeEvent.handlerTag === this.handlerTag) {
        this.props.onHandlerStateChange?.(event);

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
          this.propsRef
        );
      } else {
        RNGestureHandlerModule.attachGestureHandler(
          this.handlerTag,
          newViewTag
        );
      }
    };

    private updateGestureHandler = (
      newConfig: Readonly<Record<string, unknown>>
    ) => {
      this.config = newConfig;

      RNGestureHandlerModule.updateGestureHandler(this.handlerTag, newConfig);
    };

    private update() {
      const newConfig = filterConfig(
        transformProps ? transformProps(this.props) : this.props,
        [...allowedProps, ...customNativeProps],
        config
      );
      if (!deepEqual(this.config, newConfig)) {
        this.updateGestureHandler(newConfig);
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
        onGestureHandlerEvent: gestureEventHandler,
        onGestureHandlerStateChange: gestureStateEventHandler,
      };

      this.propsRef.current = events;

      const child: any = React.Children.only(this.props.children);
      let grandChildren = child.props.children;
      if (
        Touchable.TOUCH_TARGET_DEBUG &&
        child.type &&
        (child.type === 'RNGestureHandlerButton' ||
          child.type.name === 'View' ||
          child.type.displayName === 'View')
      ) {
        grandChildren = React.Children.toArray(grandChildren);
        grandChildren.push(
          Touchable.renderDebugView({
            color: 'mediumspringgreen',
            hitSlop: child.props.hitSlop,
          })
        );
      }

      return React.cloneElement(
        child,
        {
          ref: this.refHandler,
          collapsable: false,
          ...events,
        },
        grandChildren
      );
    }
  }
  return Handler;
}

export class Tap {
  constructor(config) {
    this.handlerName = 'TapGestureHandler';
    this.eventName = 'onTapEvent';
    this.handlerTag = -1;
    this.config = config;
  }

  onUpdate(e, vt) {
    if (typeof this.config.onUpdate === 'function') {
      this.config.onUpdate(e, vt);
    } else {
      RNGestureHandlerModule.dispatchEvent(this.eventName, vt, e.nativeEvent);
    }
  }
}

export class Pan {
  constructor(config) {
    this.handlerName = 'PanGestureHandler';
    this.eventName = 'onPanEvent';
    this.handlerTag = -1;
    this.config = config;
  }

  onUpdate(e, vt) {
    if (typeof this.config.onUpdate === 'function') {
      this.config.onUpdate(e, vt);
    } else {
      RNGestureHandlerModule.dispatchEvent(this.eventName, vt, e.nativeEvent);
    }
  }
}

export class Pinch {
  constructor(config) {
    this.handlerName = 'PinchGestureHandler';
    this.eventName = 'onPinchEvent';
    this.handlerTag = -1;
    this.config = config;
  }

  onUpdate(e, vt) {
    if (typeof this.config.onUpdate === 'function') {
      this.config.onUpdate(e, vt);
    } else {
      RNGestureHandlerModule.dispatchEvent(this.eventName, vt, e.nativeEvent);
    }
  }
}

export class Rotation {
  constructor(config) {
    this.handlerName = 'RotationGestureHandler';
    this.eventName = 'onRotationEvent';
    this.handlerTag = -1;
    this.config = config;
  }

  onUpdate(e, vt) {
    if (typeof this.config.onUpdate === 'function') {
      this.config.onUpdate(e, vt);
    } else {
      RNGestureHandlerModule.dispatchEvent(this.eventName, vt, e.nativeEvent);
    }
  }
}

export class LongPress {
  constructor(config) {
    this.handlerName = 'LongPressGestureHandler';
    this.eventName = 'onLongPressEvent';
    this.handlerTag = -1;
    this.config = config;
  }

  onUpdate(e, vt) {
    if (typeof this.config.onUpdate === 'function') {
      this.config.onUpdate(e, vt);
    } else {
      RNGestureHandlerModule.dispatchEvent(this.eventName, vt, e.nativeEvent);
    }
  }
}

export class Fling {
  constructor(config) {
    this.handlerName = 'FlingGestureHandler';
    this.eventName = 'onFlingEvent';
    this.handlerTag = -1;
    this.config = config;
  }

  onUpdate(e, vt) {
    if (typeof this.config.onUpdate === 'function') {
      this.config.onUpdate(e);
    } else {
      RNGestureHandlerModule.dispatchEvent(this.eventName, vt, e.nativeEvent);
    }
  }
}

export class Gesture {
  constructor(config) {
    this.gestures = [];
    this.ready = false;

    if (config) {
      this.config = config;
    } else {
      this.config = {};
    }
  }

  tap(config) {
    this.gestures.push(new Tap(config));

    return this;
  }

  longPress(config) {
    this.gestures.push(new LongPress(config));

    return this;
  }

  pan(config) {
    this.gestures.push(new Pan(config));

    return this;
  }

  rotation(config) {
    this.gestures.push(new Rotation(config));

    return this;
  }

  pinch(config) {
    this.gestures.push(new Pinch(config));

    return this;
  }

  fling(config) {
    this.gestures.push(new Fling(config));

    return this;
  }

  initialize() {
    for (const gesture of this.gestures) {
      gesture.handlerTag = handlerTag++;

      if (gesture.config.ref) {
        gesture.config.ref.current = gesture;
      }
    }
  }

  prepare() {
    for (const gesture of this.gestures) {
      if (
        gesture.config.requireToFail &&
        !Array.isArray(gesture.config.requireToFail)
      ) {
        gesture.config.requireToFail = [gesture.config.requireToFail];
      }

      if (gesture.config.after && !Array.isArray(gesture.config.after)) {
        gesture.config.after = [gesture.config.after];
      }

      if (
        gesture.config.simultaneousWith &&
        !Array.isArray(gesture.config.simultaneousWith)
      ) {
        gesture.config.simultaneousWith = [gesture.config.simultaneousWith];
      }
    }
  }
}

let allowedProps = ['numberOfTaps', 'maxDist', 'priority'];

export function useGesture(gesture) {
  const result = React.useRef([gesture]);

  function dropHandlers() {
    for (const g of result.current[0].gestures) {
      RNGestureHandlerModule.dropGestureHandler(g.handlerTag);
    }
  }

  function attachHandlers() {
    gesture.initialize();

    for (const gst of gesture.gestures) {
      RNGestureHandlerModule.createGestureHandler(
        gst.handlerName,
        gst.handlerTag,
        filterConfig(gst.config, allowedProps, {})
      );

      setImmediate(() => {
        gesture.prepare();

        let requireToFail = [];
        if (gst.config.requireToFail) {
          requireToFail = gst.config.requireToFail.map((ref) => {
            return ref.current.handlerTag;
          });
        }

        let after = [];
        if (gst.config.after) {
          after = gst.config.after.map((ref) => {
            return ref.current.handlerTag;
          });
        }

        let simultaneousWith = [];
        if (gst.config.simultaneousWith) {
          simultaneousWith = gst.config.simultaneousWith.map((ref) => {
            return ref.current.handlerTag;
          });
        }

        if (result.current[0].config.simultaneous) {
          simultaneousWith = [
            ...simultaneousWith,
            ...result.current[0].gestures.map((g) => g.handlerTag),
          ];
        }

        gst.requireToFail = requireToFail;
        gst.after = after;
        gst.simultaneousWith = simultaneousWith;

        RNGestureHandlerModule.updateGestureHandler(
          gst.handlerTag,
          filterConfig(gst.config, allowedProps, {
            waitFor: requireToFail,
            after: after,
            simultaneousHandlers: simultaneousWith,
          })
        );
      });
    }

    result.current[0] = gesture;
    result.current[1]?.();
  }

  function updateHandlers() {
    for (let i = 0; i < gesture.gestures.length; i++) {
      const gst = result.current[0].gestures[i];
      gst.config = gesture.gestures[i].config;

      RNGestureHandlerModule.updateGestureHandler(
        gst.handlerTag,
        filterConfig(gst.config, allowedProps, {
          waitFor: gst.requireToFail,
          after: gst.after,
          simultaneousHandlers: gst.simultaneousWith,
        })
      );
    }
  }

  function needsToReattach() {
    if (gesture.gestures.length != result.current[0].gestures.length) {
      return true;
    } else {
      for (let i = 0; i < gesture.gestures.length; i++) {
        if (
          gesture.gestures[i].handlerName !=
          result.current[0].gestures[i].handlerName
        ) {
          return true;
        }
      }
    }

    return false;
  }

  React.useEffect(() => {
    attachHandlers();

    return () => {
      dropHandlers();
    };
  }, []);

  if (result.current && result.current.length > 1) {
    if (needsToReattach()) {
      dropHandlers();
      attachHandlers();
    } else {
      updateHandlers();
    }
  }

  return result;
}
export class GestureMonitor extends React.Component {
  constructor(props) {
    super(props);

    this.propsRef = React.createRef();
  }

  componentDidMount() {
    setImmediate(() => {
      if (this.props.gesture.current) {
        this.props.gesture.current[1] = () => {
          this.attachGestureHandlers(findNodeHandle(this.viewNode) as number);
        };
      }
    });
  }

  componentDidUpdate() {
    const viewTag = findNodeHandle(this.viewNode);

    if (this.viewTag !== viewTag) {
      this.attachGestureHandlers(viewTag as number);
    }
    //this.update();
  }

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

  visit(a, i) {
    let s = '';
    for (let b = 0; b < i; b++) s += '  ';

    if (a._nativeTag) {
      console.log(s + ' ' + a._nativeTag);

      for (const c of a._children) {
        this.visit(c, i + 1);
      }
    }
  }

  attachGestureHandlers(newViewTag) {
    this.viewTag = newViewTag;
    if (this.props.gesture.current) {
      if (this.props.gesture.current[0] instanceof Gesture) {
        for (const gesture of this.props.gesture.current[0].gestures) {
          RNGestureHandlerModule.attachGestureHandler(
            gesture.handlerTag,
            newViewTag
          );
        }
      }
    }
  }

  private onGestureHandlerEvent = (event: GestureEvent<U>) => {
    let handled = false;
    if (
      this.props.gesture.current &&
      Array.isArray(this.props.gesture.current[0].gestures)
    ) {
      for (const gesture of this.props.gesture.current[0].gestures) {
        if (gesture.handlerTag === event.nativeEvent.handlerTag) {
          gesture.config.onUpdate?.(event);
          handled = true;
          break;
        }
      }
    }

    if (!handled) {
      this.props.onGestureHandlerEvent?.(event);
    }
  };

  // TODO(TS) - make sure this is right type for event
  private onGestureHandlerStateChange = (event: HandlerStateChangeEvent<U>) => {
    let handled = false;
    if (
      this.props.gesture.current &&
      Array.isArray(this.props.gesture.current[0].gestures)
    ) {
      for (const gesture of this.props.gesture.current[0].gestures) {
        if (gesture.handlerTag === event.nativeEvent.handlerTag) {
          if (event.nativeEvent.oldState == 0 && event.nativeEvent.state == 2) {
            gesture.config.onBegan?.(event);
          } else if (
            event.nativeEvent.oldState == 2 &&
            event.nativeEvent.state == 4
          ) {
            gesture.config.onStart?.(event);
          } else if (
            event.nativeEvent.oldState == 4 &&
            event.nativeEvent.state == 5
          ) {
            gesture.config.onEnd?.(event, true);
          } else if (event.nativeEvent.state == 1) {
            gesture.config.onEnd?.(event, false);
          } else if (event.nativeEvent.state == 3) {
            gesture.config.onEnd?.(event, false);
          }
          handled = true;
          break;
        }
      }
    }

    if (!handled) {
      this.props.onGestureHandlerStateChange?.(event);
    }
  };

  render() {
    let gestureEventHandler = this.onGestureHandlerEvent;
    let gestureStateEventHandler = this.onGestureHandlerStateChange;

    const events = {};

    if (this.props.gesture.current && this.props.gesture.current[2]) {
      events['onGestureHandlerEvent'] = this.props.gesture.current[2];
    } else {
      events['onGestureHandlerEvent'] = gestureEventHandler;
      events['onGestureHandlerStateChange'] = gestureStateEventHandler;
    }

    this.propsRef.current = events;

    const child: any = React.Children.only(this.props.children);
    let grandChildren = child.props.children;
    if (
      Touchable.TOUCH_TARGET_DEBUG &&
      child.type &&
      (child.type === 'RNGestureHandlerButton' ||
        child.type.name === 'View' ||
        child.type.displayName === 'View')
    ) {
      grandChildren = React.Children.toArray(grandChildren);
      grandChildren.push(
        Touchable.renderDebugView({
          color: 'mediumspringgreen',
          hitSlop: child.props.hitSlop,
        })
      );
    }

    return React.cloneElement(
      child,
      {
        ref: this.refHandler,
        collapsable: false,
        ...events,
      },
      grandChildren
    );
  }
}
