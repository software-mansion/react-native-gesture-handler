// @ts-nocheck
import React from 'react';
import {
  findNodeHandle as findNodeHandleRN,
  NativeModules,
  Platform,
} from 'react-native';
// @ts-ignore - it isn't typed by TS & don't have definitelyTyped types
import deepEqual from 'fbjs/lib/areEqual';
import RNGestureHandlerModule from '../RNGestureHandlerModule';
import State from '../State';

import {
  BaseGestureHandlerProperties,
  GestureEventEvent,
  HandlerStateChangeEvent,
} from './gestureHandlers';

function findNodeHandle(node: any): null | number {
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
// returned by UIManager.getConstants(), we need to add it there as well to make
// it compatible with RN 61+
if (UIManager.getConstants) {
  UIManager.getConstants().genericDirectEventTypes = {
    ...UIManager.getConstants().genericDirectEventTypes,
    ...customGHEventsConfig,
  };
}

// Wrap JS responder calls and notify gesture handler manager
const {
  setJSResponder: oldSetJSResponder = () => {},
  clearJSResponder: oldClearJSResponder = () => {},
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
    (param !== Object(param) || !('__isNative' in (param as object))) &&
    name !== 'onHandlerStateChange' &&
    name !== 'onGestureEvent'
  );
}

function filterConfig(
  props: { [x: string]: any },
  validProps: Record<string, any>,
  defaults: Record<string, any> = {}
) {
  const res = { ...defaults };
  Object.keys(validProps).forEach(key => {
    const value = props[key];
    if (isConfigParam(value, key)) {
      let value = props[key];
      if (key === 'simultaneousHandlers' || key === 'waitFor') {
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
        handlerIDToTag[handlerID] || handlerID.current?._handlerTag || -1
    )
    .filter((handlerTag: number) => handlerTag > 0);
}

function hasUnresolvedRefs(
  props: Readonly<
    React.PropsWithChildren<
      BaseGestureHandlerProperties<Record<string, unknown>>
    >
  >
) {
  // TODO(TS) - add type for extract arg
  const extract = (refs: any | any[]) => {
    if (!Array.isArray(refs)) {
      return refs && refs.current === null;
    }
    return refs.some(r => r && r.current === null);
  };
  return extract(props['simultaneousHandlers']) || extract(props['waitFor']);
}

const stateToPropMappings = {
  [State.BEGAN]: 'onBegan',
  [State.FAILED]: 'onFailed',
  [State.CANCELLED]: 'onCancelled',
  [State.ACTIVE]: 'onActivated',
  [State.END]: 'onEnded',
};

type Props = {
  handlerName: string;
  propTypes: any;
  config: any;
  transformProps: any;
  customNativeProps: any;
};

type HandlerProps = {
  onGestureHandlerEvent: (event: any) => void;
  onGestureEvent: (event: any) => void;
  onHandlerStateChange: (event: any) => void;
  onGestureHandlerStateChange: (event: any) => void;
  id: any;
};

type NativeEvent = {
  nativeEvent: { handlerTag: number; state?: number };
};

export default function createHandler<
  T extends BaseGestureHandlerProperties<Record<string, unknown>>
>({
  handlerName,
  propTypes = {},
  config = {},
  transformProps,
  customNativeProps = {},
}: Props): React.ComponentType<T> {
  class Handler extends React.Component<T> {
    static displayName = handlerName;
    static propTypes = propTypes;

    private _handlerTag: number;
    private _config: {};
    private _propsRef: React.RefObject<unknown>;
    private _viewNode: any;
    private _viewTag?: number;
    private _updateEnqueued: ReturnType<typeof setImmediate> | null = null;

    constructor(props: T) {
      super(props);
      this._handlerTag = handlerTag++;
      this._config = {};
      this._propsRef = React.createRef();

      if (props.id) {
        if (handlerIDToTag[props.id] !== undefined) {
          throw new Error(`Handler with ID "${props.id}" already registered`);
        }
        handlerIDToTag[props.id] = this._handlerTag;
      }
    }

    componentDidMount() {
      if (hasUnresolvedRefs(this.props)) {
        // If there are unresolved refs (e.g. ".current" has not yet been set)
        // passed as `simultaneousHandlers` or `waitFor`, we enqueue a call to
        // _update method that will try to update native handler props using
        // setImmediate. This makes it so _update function gets called after all
        // react components are mounted and we expect the missing ref object to
        // be resolved by then.
        this._updateEnqueued = setImmediate(() => {
          this._updateEnqueued = null;
          this._update();
        });
      }

      this._createGestureHandler(
        filterConfig(
          transformProps ? transformProps(this.props) : this.props,
          {
            ...(this.constructor.propTypes || propTypes),
            ...customNativeProps,
          },
          config
        )
      );

      this._attachGestureHandler(findNodeHandle(this._viewNode) as number); // TODO(TS) - check if this can be null
    }

    componentDidUpdate() {
      const viewTag = findNodeHandle(this._viewNode);
      if (this._viewTag !== viewTag) {
        this._attachGestureHandler(viewTag as number); // TODO(TS) - check interaction between _viewTag & findNodeHandle
      }
      this._update();
    }

    componentWillUnmount() {
      RNGestureHandlerModule.dropGestureHandler(this._handlerTag);
      if (this._updateEnqueued) {
        clearImmediate(this._updateEnqueued);
      }
      // We can't use this.props.id directly due to TS generic type narrowing bug, see https://github.com/microsoft/TypeScript/issues/13995 for more context
      const handlerID: string | undefined = this.props.id;
      if (handlerID) {
        delete handlerIDToTag[handlerID];
      }
    }

    _deleteHandler(handlerID: string | undefined) {}

    _onGestureHandlerEvent = (event: GestureEventEvent) => {
      if (event.nativeEvent.handlerTag === this._handlerTag) {
        this.props.onGestureEvent?.(event);
      } else {
        this.props.onGestureHandlerEvent?.(event);
      }
    };

    _onGestureHandlerStateChange = (event: HandlerStateChangeEvent) => {
      if (event.nativeEvent.handlerTag === this._handlerTag) {
        this.props.onHandlerStateChange?.(event);

        const stateEventName = stateToPropMappings[event.nativeEvent.state];
        if (typeof this.props[stateEventName] === 'function') {
          this.props[stateEventName](event);
        }
      } else {
        this.props.onGestureHandlerStateChange?.(event);
      }
    };

    _refHandler = (node: any) => {
      this._viewNode = node;

      const child = React.Children.only(this.props.children);
      const { ref } = child;
      if (ref !== null) {
        if (typeof ref === 'function') {
          ref(node);
        } else {
          ref.current = node;
        }
      }
    };

    _createGestureHandler = (newConfig: {}) => {
      this._config = newConfig;

      RNGestureHandlerModule.createGestureHandler(
        handlerName,
        this._handlerTag,
        newConfig
      );
    };

    _attachGestureHandler = (newViewTag: number) => {
      this._viewTag = newViewTag;

      if (Platform.OS === 'web') {
        RNGestureHandlerModule.attachGestureHandler(
          this._handlerTag,
          newViewTag,
          this._propsRef
        );
      } else {
        RNGestureHandlerModule.attachGestureHandler(
          this._handlerTag,
          newViewTag
        );
      }
    };

    _updateGestureHandler = (newConfig: {}) => {
      this._config = newConfig;

      RNGestureHandlerModule.updateGestureHandler(this._handlerTag, newConfig);
    };

    _update() {
      const newConfig = filterConfig(
        transformProps ? transformProps(this.props) : this.props,
        { ...(this.constructor.propTypes || propTypes), ...customNativeProps },
        config
      );
      if (!deepEqual(this._config, newConfig)) {
        this._updateGestureHandler(newConfig);
      }
    }

    setNativeProps(updates: any) {
      const mergedProps = { ...this.props, ...updates };
      const newConfig = filterConfig(
        transformProps ? transformProps(mergedProps) : mergedProps,
        { ...(this.constructor.propTypes || propTypes), ...customNativeProps },
        config
      );
      this._updateGestureHandler(newConfig);
    }

    render() {
      let gestureEventHandler = this._onGestureHandlerEvent;
      const { onGestureEvent, onGestureHandlerEvent } = this.props;
      if (onGestureEvent && typeof onGestureEvent !== 'function') {
        // If it's not a method it should be an native Animated.event
        // object. We set it directly as the handler for the view
        // In this case nested handlers are not going to be supported
        if (onGestureHandlerEvent) {
          throw new Error(
            'Nesting touch handlers with native animated driver is not supported yet'
          );
        }
        gestureEventHandler = this.props.onGestureEvent;
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

      let gestureStateEventHandler = this._onGestureHandlerStateChange;
      const { onHandlerStateChange, onGestureHandlerStateChange } = this.props;
      if (onHandlerStateChange && typeof onHandlerStateChange !== 'function') {
        // If it's not a method it should be an native Animated.event
        // object. We set it directly as the handler for the view
        // In this case nested handlers are not going to be supported
        if (onGestureHandlerStateChange) {
          throw new Error(
            'Nesting touch handlers with native animated driver is not supported yet'
          );
        }
        gestureStateEventHandler = this.props.onHandlerStateChange;
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

      this._propsRef.current = events;

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
          ref: this._refHandler,
          collapsable: false,
          ...events,
        },
        grandChildren
      );
    }
  }
  return Handler;
}
