import * as React from 'react';
import {
  findNodeHandle,
  NativeModules,
  Platform,
  Touchable,
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
import { nextHandlerTag } from './handlerCounter';
import { default as RNRenderer } from 'react-native/Libraries/Renderer/shims/ReactNative';
import { filterConfig } from './createHandler';

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
      gesture.handlerTag = nextHandlerTag();

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
          console.log(
            gesture.handlerName + ' ' + newViewTag + ' ' + gesture.handlerTag
          );
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
