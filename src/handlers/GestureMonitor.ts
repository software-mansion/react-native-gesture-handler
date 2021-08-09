import * as React from 'react';
import {
  findNodeHandle,
  NativeModules,
  Platform,
  Touchable,
  View,
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
import Reanimated from 'react-native-reanimated';
import { default as EventReceiver } from '../components/EventReceiver';
import { DeviceEventEmitter } from 'react-native';
import {
  basePropsNew,
  flingGestureHandlerProps,
  longPressGestureHandlerProps,
  panGestureHandlerProps,
  tapGestureHandlerProps,
  managePanProps,
  panGestureHandlerCustomNativeProps,
} from './allowedProps';

class Gesture {
  public gestures: Array<Gesture> = [];
}

enum Relation {
  Simultaneous,
  Exclusive,
  After,
  RequireToFail,
}

type PendingGesture = {
  relation: Relation;
  gesture: SimpleGesture;
};

export class GestureBuilder extends Gesture {
  private log: Array<PendingGesture> = [];

  constructor(base: SimpleGesture) {
    super();

    this.log.push({ relation: Relation.Exclusive, gesture: base });
  }

  simultaneousWith(gesture: SimpleGesture): GestureBuilder {
    this.log.push({ relation: Relation.Simultaneous, gesture: gesture });

    return this;
  }

  exclusiveWith(gesture: SimpleGesture): GestureBuilder {
    this.log.push({ relation: Relation.Exclusive, gesture: gesture });

    return this;
  }

  after(gesture: SimpleGesture): GestureBuilder {
    this.log.push({ relation: Relation.After, gesture: gesture });

    return this;
  }

  requireToFail(gesture: SimpleGesture): GestureBuilder {
    this.log.push({ relation: Relation.RequireToFail, gesture: gesture });

    return this;
  }

  build() {
    for (const pendingGesture of this.log) {
      this.gestures.push(pendingGesture.gesture);
    }
  }

  initialize() {
    for (const gesture of this.gestures) {
      gesture.initialize();
    }
  }

  prepare() {
    let simultaneous = [];
    let after = [];
    let waitFor = [];

    for (let i = this.log.length - 1; i >= 0; i--) {
      let pendingGesture = this.log[i];
      pendingGesture.gesture.prepare();

      if (pendingGesture.gesture.config.simultaneousWith) {
        pendingGesture.gesture.config.simultaneousWith = [
          ...pendingGesture.gesture.config.simultaneousWith,
          ...simultaneous,
        ];
      } else {
        pendingGesture.gesture.config.simultaneousWith = [...simultaneous];
      }

      if (pendingGesture.gesture.config.requireToFail) {
        pendingGesture.gesture.config.requireToFail = [
          ...pendingGesture.gesture.config.requireToFail,
          ...waitFor,
        ];
      } else {
        pendingGesture.gesture.config.requireToFail = [...waitFor];
      }

      if (pendingGesture.gesture.config.after) {
        pendingGesture.gesture.config.after = [
          ...pendingGesture.gesture.config.after,
          ...after,
        ];
      } else {
        pendingGesture.gesture.config.after = [...after];
      }

      switch (pendingGesture.relation) {
        case Relation.Simultaneous:
          simultaneous.push(pendingGesture.gesture.handlerTag);
          break;
        case Relation.Exclusive:
          break;
        case Relation.After:
          after.push(pendingGesture.gesture.handlerTag);
          break;
        case Relation.RequireToFail:
          waitFor.push(pendingGesture.gesture.handlerTag);
          break;
      }
    }
  }
}

class SimpleGesture extends Gesture {
  public handlerTag: number = -1;
  public handlerName: string = '';
  public config: any;

  static allowedProps = basePropsNew;

  constructor(config: any) {
    super();
    this.config = config;

    this.gestures = [this]; //TODO change cyclic structure, worklets do not like that
  }

  simultaneousWith(other: SimpleGesture): GestureBuilder {
    return new GestureBuilder(this).simultaneousWith(other);
  }

  exclusiveWith(other: SimpleGesture): GestureBuilder {
    return new GestureBuilder(this).exclusiveWith(other);
  }

  requireToFail(other: SimpleGesture): GestureBuilder {
    return new GestureBuilder(this).requireToFail(other);
  }

  after(other: SimpleGesture): GestureBuilder {
    return new GestureBuilder(this).after(other);
  }

  initialize() {
    this.handlerTag = nextHandlerTag();

    if (this.config.ref) {
      this.config.ref.current = this;
    }
  }

  prepare() {
    if (
      this.config.requireToFail &&
      !Array.isArray(this.config.requireToFail)
    ) {
      this.config.requireToFail = [this.config.requireToFail];
    }

    if (this.config.after && !Array.isArray(this.config.after)) {
      this.config.after = [this.config.after];
    }

    if (
      this.config.simultaneousWith &&
      !Array.isArray(this.config.simultaneousWith)
    ) {
      this.config.simultaneousWith = [this.config.simultaneousWith];
    }
  }

  getAllowedProps() {
    return SimpleGesture.allowedProps;
  }

  transformProps() {
    return this.config;
  }
}

export class Tap extends SimpleGesture {
  static allowedProps = [...basePropsNew, ...tapGestureHandlerProps];

  constructor(config: any) {
    super(config);

    this.handlerName = 'TapGestureHandler';
    this.handlerTag = -1;
  }

  getAllowedProps() {
    return Tap.allowedProps;
  }
}

export class Pan extends SimpleGesture {
  static allowedProps = [
    ...basePropsNew,
    ...panGestureHandlerProps,
    ...panGestureHandlerCustomNativeProps,
  ];

  constructor(config: any) {
    super(config);

    this.handlerName = 'PanGestureHandler';
    this.handlerTag = -1;
  }

  getAllowedProps() {
    return Pan.allowedProps;
  }

  transformProps() {
    return managePanProps(this.config);
  }
}

export class Pinch extends SimpleGesture {
  constructor(config: any) {
    super(config);

    this.handlerName = 'PinchGestureHandler';
    this.handlerTag = -1;
  }
}

export class Rotation extends SimpleGesture {
  constructor(config: any) {
    super(config);

    this.handlerName = 'RotationGestureHandler';
    this.handlerTag = -1;
  }
}

export class LongPress extends SimpleGesture {
  static allowedProps = [...basePropsNew, ...longPressGestureHandlerProps];

  constructor(config: any) {
    super(config);

    this.handlerName = 'LongPressGestureHandler';
    this.handlerTag = -1;
  }

  getAllowedProps() {
    return LongPress.allowedProps;
  }
}

export class Fling extends SimpleGesture {
  static allowedProps = [...basePropsNew, ...flingGestureHandlerProps];

  constructor(config: any) {
    super(config);

    this.handlerName = 'FlingGestureHandler';
    this.handlerTag = -1;
  }

  getAllowedProps() {
    return Fling.allowedProps;
  }
}

export class ComplexGesture extends Gesture {
  constructor(config) {
    super();

    this.gestures = [];

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
      gesture.initialize();
    }
  }

  prepare() {
    for (const gesture of this.gestures) {
      gesture.prepare();
    }
  }
}

const handlers = new Map();

export function findHandler(tag) {
  return handlers.get(tag);
}

export function useGesture(gesture) {
  const result = React.useRef([gesture]);

  function dropHandlers() {
    for (const g of result.current[0].gestures) {
      RNGestureHandlerModule.dropGestureHandler(g.handlerTag);

      handlers.delete(g.handlerTag);
    }
  }

  function attachHandlers() {
    gesture.initialize();

    for (const gst of gesture.gestures) {
      RNGestureHandlerModule.createGestureHandler(
        gst.handlerName,
        gst.handlerTag,
        filterConfig(gst.transformProps(), gst.getAllowedProps(), {})
      );

      handlers.set(gst.handlerTag, gst);

      setImmediate(() => {
        gesture.prepare();

        let requireToFail = [];
        if (gst.config.requireToFail) {
          requireToFail = gst.config.requireToFail.map((ref) => {
            if (typeof ref === 'number') {
              return ref;
            } else if (ref instanceof SimpleGesture) {
              return ref.handlerTag;
            } else {
              return ref.current.handlerTag;
            }
          });
        }

        let after = [];
        if (gst.config.after) {
          after = gst.config.after.map((ref) => {
            if (typeof ref === 'number') {
              return ref;
            } else if (ref instanceof SimpleGesture) {
              return ref.handlerTag;
            } else {
              return ref.current.handlerTag;
            }
          });
        }

        let simultaneousWith = [];
        if (gst.config.simultaneousWith) {
          simultaneousWith = gst.config.simultaneousWith.map((ref) => {
            if (typeof ref === 'number') {
              return ref;
            } else if (ref instanceof SimpleGesture) {
              return ref.handlerTag;
            } else {
              return ref.current.handlerTag;
            }
          });
        }

        if (result.current[0].config && result.current[0].config.simultaneous) {
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
          filterConfig(gst.transformProps(), gst.getAllowedProps(), {
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
        filterConfig(gst.transformProps(), gst.getAllowedProps(), {
          waitFor: gst.requireToFail,
          after: gst.after,
          simultaneousHandlers: gst.simultaneousWith,
        })
      );

      handlers.set(gst.handlerTag, gst);
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

  if (gesture instanceof GestureBuilder) {
    gesture.build();
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

export function Root(props) {
  return React.createElement(
    View,
    {
      onGestureHandlerEvent: (e) => {
        const handler = findHandler(e.nativeEvent.handlerTag);

        if (handler) {
          handler.config.onUpdate(e);
        }
      },
      onGestureHandlerStateChange: (event) => {
        const gesture = findHandler(event.nativeEvent.handlerTag);
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
      },
    },
    React.Children.only(props.children)
  );
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

  attachGestureHandlers(newViewTag) {
    newViewTag = RNRenderer.findHostInstance_DEPRECATED(this)._nativeTag;
    console.log(
      RNRenderer.findHostInstance_DEPRECATED(this)._nativeTag + ' ' + newViewTag
    );
    this.viewTag = newViewTag;
    if (this.props.gesture.current) {
      if (this.props.gesture.current[0] instanceof Gesture) {
        for (const gesture of this.props.gesture.current[0].gestures) {
          console.log(
            gesture.handlerName +
              ' ' +
              newViewTag +
              ' ' +
              gesture.handlerTag +
              ' ' +
              RNRenderer.findHostInstance_DEPRECATED(this)._nativeTag
          );
          if (this.props.gesture.current && this.props.gesture.current[2]) {
            RNGestureHandlerModule.attachGestureHandlerWithReceiver(
              gesture.handlerTag,
              newViewTag,
              newViewTag
            );
          } else {
            RNGestureHandlerModule.attachGestureHandlerWithReceiver(
              gesture.handlerTag,
              RNRenderer.findHostInstance_DEPRECATED(this)._nativeTag,
              -1
            );
          }
        }
      }
    }
  }

  private onGestureHandlerEvent = (event: GestureEvent<U>) => {
    let handled = false;
    //console.log(this.viewTag + ' ' + event.nativeEvent.handlerTag);
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
    //console.log(event.nativeEvent);
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
    // let grandChildren = child.props.children;
    // if (
    //   Touchable.TOUCH_TARGET_DEBUG &&
    //   child.type &&
    //   (child.type === 'RNGestureHandlerButton' ||
    //     child.type.name === 'View' ||
    //     child.type.displayName === 'View')
    // ) {
    //   grandChildren = React.Children.toArray(grandChildren);
    //   grandChildren.push(
    //     Touchable.renderDebugView({
    //       color: 'mediumspringgreen',
    //       hitSlop: child.props.hitSlop,
    //     })
    //   );
    // }

    if (this.props.gesture.current && this.props.gesture.current[2]) {
      return React.createElement(
        AnimatedWrap,
        { ref: this.refHandler, ...events },
        this.props.children
      );
    } else {
      return child;
      [
        child,
        React.createElement(EventReceiver, {
          ref: this.refHandler,
          ...events,
        }),
      ];
    }
    // return React.createElement(
    //   Wrapper,
    //   { ref: this.refHandler, ...events },
    //   child
    // );

    // return React.cloneElement(
    //   child,
    //   {
    //     ref: this.refHandler,
    //     collapsable: false,
    //     ...events,
    //   },
    //   grandChildren
    // );
  }
}

function onGestureHandlerEvent(event) {
  const handler = findHandler(event.handlerTag);

  if (handler) {
    handler.config.onUpdate(event);
  }
}

function onGestureHandlerStateChange(event) {
  const gesture = findHandler(event.handlerTag);

  if (gesture) {
    if (event.oldState == 0 && event.state == 2) {
      gesture.config.onBegan?.(event);
    } else if (event.oldState == 2 && event.state == 4) {
      gesture.config.onStart?.(event);
    } else if (event.oldState == 4 && event.state == 5) {
      gesture.config.onEnd?.(event, true);
    } else if (event.state == 1) {
      gesture.config.onEnd?.(event, false);
    } else if (event.state == 3) {
      gesture.config.onEnd?.(event, false);
    }
  }
}

DeviceEventEmitter.addListener('onGestureHandlerEvent', onGestureHandlerEvent);

DeviceEventEmitter.addListener(
  'onGestureHandlerStateChange',
  onGestureHandlerStateChange
);

class Wrap extends React.Component {
  render() {
    return this.props.children;
  }
}

const AnimatedWrap = Reanimated.createAnimatedComponent(Wrap);

class Wrapper extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let child: any = React.Children.only(this.props.children);

    let result = React.cloneElement(
      child,
      {},
      React.Children.toArray(child.props.children)
    );

    return result;
  }
}
