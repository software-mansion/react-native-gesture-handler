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
  GestureEventPayload,
  HandlerStateChangeEvent,
  HandlerStateChangeEventPayload,
} from './gestureHandlers';
import { ValueOf } from '../typeUtils';
import { nextHandlerTag } from './handlerCounter';
import { default as RNRenderer } from 'react-native/Libraries/Renderer/shims/ReactNative';
import { filterConfig } from './createHandler';
import Reanimated from 'react-native-reanimated';
import { default as EventReceiver } from '../components/EventReceiver';
import { DeviceEventEmitter } from 'react-native';
import { Directions } from '../Directions';
import {
  basePropsNew,
  flingGestureHandlerProps,
  longPressGestureHandlerProps,
  panGestureHandlerProps,
  tapGestureHandlerProps,
  managePanProps,
  panGestureHandlerCustomNativeProps,
} from './allowedProps';

const handlers = new Map();

export function findHandler(tag: number) {
  return handlers.get(tag);
}

export class Gesture {
  _requireToFail = [];
  _after = [];
  _simultaneousWith = [];

  build(): BuiltGesture {
    return new BuiltGesture();
  }

  initialize() {}

  prepare() {}

  static tap() {
    return new Tap();
  }

  static pan() {
    return new Pan();
  }

  static pinch() {
    return new Pinch();
  }

  static rotation() {
    return new Rotation();
  }

  static fling() {
    return new Fling();
  }

  static longPress() {
    return new LongPress();
  }
}
class BuiltGesture {
  public gestures: Array<SimpleGesture> = [];

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

  build(): BuiltGesture {
    let result = new BuiltGesture();

    result.gestures = [];

    for (const pg of this.log) {
      result.gestures.push(pg.gesture);
    }

    result.prepare = () => {
      let simultaneous = [];
      let after = [];
      let waitFor = [];

      for (let i = this.log.length - 1; i >= 0; i--) {
        let pendingGesture = this.log[i];
        pendingGesture.gesture.prepare();

        let newConfig = { ...pendingGesture.gesture.config };

        if (newConfig.simultaneousWith) {
          newConfig.simultaneousWith = [
            ...newConfig.simultaneousWith,
            ...simultaneous,
          ];
        } else {
          newConfig.simultaneousWith = [...simultaneous];
        }

        if (newConfig.requireToFail) {
          newConfig.requireToFail = [...newConfig.requireToFail, ...waitFor];
        } else {
          newConfig.requireToFail = [...waitFor];
        }

        if (newConfig.after) {
          newConfig.after = [...newConfig.after, ...after];
        } else {
          newConfig.after = [...after];
        }

        pendingGesture.gesture.config = newConfig;

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
    };

    return result;
  }
}

class SimpleGesture extends Gesture {
  public handlerTag: number = -1;
  public handlerName: string = '';
  public config: any = {};
  public handlers: any = {
    handlerTag: -1,
    onBegin: null,
    onUpdate: null,
    onEnd: null,
    onStart: null,
  };

  static allowedProps = basePropsNew;

  constructor() {
    super();
  }

  protected setConfig(key: string, value: any) {
    this.config[key] = value;
  }

  protected setHandler(key: string, value: any) {
    this.handlers[key] = value;
  }

  private addDependency(
    key: string,
    gesture: SimpleGesture | React.RefObject<SimpleGesture>
  ) {
    if (this.config[key]) {
      if (Array.isArray(this.config[key])) {
        this.config[key].push(gesture);
      } else {
        this.config[key] = [this.config[key], gesture];
      }
    } else {
      this.config[key] = [gesture];
    }
  }

  setRef(ref: React.RefObject<any>) {
    this.setConfig('ref', ref);
    return this;
  }

  setOnBegan(callback: (event: any) => void) {
    this.setHandler('onBegan', callback);
    return this;
  }

  setOnStart(callback: (event: any) => void) {
    this.setHandler('onStart', callback);
    return this;
  }

  setOnEnd(callback: (event: any, success: boolean) => void) {
    this.setHandler('onEnd', callback);
    return this;
  }

  setOnUpdate(callback: (event: any) => void) {
    this.setHandler('onUpdate', callback);
    return this;
  }

  setPriority(priority: number) {
    this.setConfig('priority', priority);
    return this;
  }

  setEnabled(enabled: boolean) {
    this.setConfig('enabled', enabled);
    return this;
  }

  setMinPointers(minPointers: number) {
    this.setConfig('minPointers', minPointers);
    return this;
  }

  setShouldCancelWhenOutside(value: boolean) {
    this.setConfig('shouldCancelWhenOutside', value);
    return this;
  }

  setHitSlop(hitSlop: any) {
    this.setConfig('hitSlop', hitSlop);
    return this;
  }

  addSimultaneousGesture(
    gesture: SimpleGesture | React.RefObject<SimpleGesture>
  ) {
    this.addDependency('simultaneousWith', gesture);

    return this;
  }

  addRequiredToFailGesture(
    gesture: SimpleGesture | React.RefObject<SimpleGesture>
  ) {
    this.addDependency('requireToFail', gesture);

    return this;
  }

  addRequiredActiveGesture(
    gesture: SimpleGesture | React.RefObject<SimpleGesture>
  ) {
    this.addDependency('after', gesture);

    return this;
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
    this.setHandler('handlerTag', this.handlerTag);

    if (this.config.ref) {
      this.config.ref.current = this;
    }
  }

  build(): BuiltGesture {
    let result = new BuiltGesture();

    result.gestures = [this];

    return result;
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

  constructor() {
    super();

    this.handlerName = 'TapGestureHandler';
    this.handlerTag = -1;
  }

  setTapCount(count: number) {
    this.setConfig('numberOfTaps', count);
    return this;
  }

  setMaxDistance(maxDist: number) {
    this.setConfig('maxDist', maxDist);
    return this;
  }

  setMaxDuration(duration: number) {
    this.setConfig('maxDurationMs', duration);
    return this;
  }

  setMaxDelay(delay: number) {
    this.setConfig('maxDelayMs', delay);
    return this;
  }

  setMaxDeltaX(delta: number) {
    this.setConfig('maxDeltaX', delta);
    return this;
  }

  setMaxDeltaY(delta: number) {
    this.setConfig('maxDeltaY', delta);
    return this;
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

  constructor() {
    super();

    this.handlerName = 'PanGestureHandler';
    this.handlerTag = -1;
  }

  setActiveOffsetY(offset: number | Array<number>) {
    this.setConfig('activeOffsetY', offset);
    return this;
  }

  setActiveOffsetX(offset: number | Array<number>) {
    this.setConfig('activeOffsetX', offset);
    return this;
  }

  setFailOffsetY(offset: number | Array<number>) {
    this.setConfig('failOffsetY', offset);
    return this;
  }

  setFailOffsetX(offset: number | Array<number>) {
    this.setConfig('failOffsetX', offset);
    return this;
  }

  setMinDistance(distance: number) {
    this.setConfig('minDist', distance);
    return this;
  }

  setAverageTouches(value: number) {
    this.setConfig('avgTouches', value);
    return this;
  }

  setEnableTrackpadTwoFingerGesture(value: boolean) {
    this.setConfig('enableTrackpadTwoFingerGesture', value);
    return this;
  }

  getAllowedProps() {
    return Pan.allowedProps;
  }

  transformProps() {
    return managePanProps(this.config);
  }
}

export class Pinch extends SimpleGesture {
  constructor() {
    super();

    this.handlerName = 'PinchGestureHandler';
    this.handlerTag = -1;
  }
}

export class Rotation extends SimpleGesture {
  constructor() {
    super();

    this.handlerName = 'RotationGestureHandler';
    this.handlerTag = -1;
  }
}

export class LongPress extends SimpleGesture {
  static allowedProps = [...basePropsNew, ...longPressGestureHandlerProps];

  constructor() {
    super();

    this.handlerName = 'LongPressGestureHandler';
    this.handlerTag = -1;
  }

  setMinDuration(duration: number) {
    this.setConfig('minDurationMs', duration);
    return this;
  }

  setMaxDistance(distance: number) {
    this.setConfig('maxDist', distance);
    return this;
  }

  getAllowedProps() {
    return LongPress.allowedProps;
  }
}

export class Fling extends SimpleGesture {
  static allowedProps = [...basePropsNew, ...flingGestureHandlerProps];

  constructor() {
    super();

    this.handlerName = 'FlingGestureHandler';
    this.handlerTag = -1;
  }

  setNumberOfPointers(pointers: number) {
    this.setConfig('numberOfPointers', pointers);
    return this;
  }

  setDirection(direction: Directions) {
    this.setConfig('direction', direction);
    return this;
  }

  getAllowedProps() {
    return Fling.allowedProps;
  }
}

type GestureConfigRef = {
  config: BuiltGesture;
  callback: null | (() => void);
  animatedEventHandler: any;
  animatedHandlers: any;
};

//create `handlers` property alongside config to store event handlers
//only this one would be passed to the worklets therefore solving problems
//with refs
export function useGesture(gestureConfig: GestureBuilder | SimpleGesture) {
  const gesture = gestureConfig.build();

  const result = React.useRef<GestureConfigRef>({
    config: gesture,
    callback: null,
    animatedEventHandler: null,
    animatedHandlers: null,
  });

  const handlersAttached = React.useRef(false);

  if (!handlersAttached.current) {
    gesture.initialize();
  }

  function dropHandlers() {
    for (const g of result.current.config.gestures) {
      RNGestureHandlerModule.dropGestureHandler(g.handlerTag);

      handlers.delete(g.handlerTag);
    }
  }

  function attachHandlers() {
    if (handlersAttached.current) {
      gesture.initialize();
    } else {
      handlersAttached.current = true;
    }

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
          requireToFail = gst.config.requireToFail.map(
            (ref: number | SimpleGesture | React.RefObject<any>) => {
              if (typeof ref === 'number') {
                return ref;
              } else if (ref instanceof SimpleGesture) {
                return ref.handlerTag;
              } else {
                return ref.current.handlerTag;
              }
            }
          );
        }

        let after = [];
        if (gst.config.after) {
          after = gst.config.after.map(
            (ref: number | SimpleGesture | React.RefObject<any>) => {
              if (typeof ref === 'number') {
                return ref;
              } else if (ref instanceof SimpleGesture) {
                return ref.handlerTag;
              } else {
                return ref.current.handlerTag;
              }
            }
          );
        }

        let simultaneousWith = [];
        if (gst.config.simultaneousWith) {
          simultaneousWith = gst.config.simultaneousWith.map(
            (ref: number | SimpleGesture | React.RefObject<any>) => {
              if (typeof ref === 'number') {
                return ref;
              } else if (ref instanceof SimpleGesture) {
                return ref.handlerTag;
              } else {
                return ref.current.handlerTag;
              }
            }
          );
        }

        gst._requireToFail = requireToFail;
        gst._after = after;
        gst._simultaneousWith = simultaneousWith;

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

    result.current.config = gesture;
    result.current.callback?.();

    if (result.current.animatedHandlers) {
      result.current.animatedHandlers.value = gesture.gestures.map(
        (g) => g.handlers
      );
    }
  }

  function updateHandlers() {
    for (let i = 0; i < gesture.gestures.length; i++) {
      const gst = result.current.config.gestures[i];

      gst.config = gesture.gestures[i].config;
      gst.handlers = gesture.gestures[i].handlers;
      gst.handlers.handlerTag = gst.handlerTag;

      RNGestureHandlerModule.updateGestureHandler(
        gst.handlerTag,
        filterConfig(gst.transformProps(), gst.getAllowedProps(), {
          waitFor: gst._requireToFail,
          after: gst._after,
          simultaneousHandlers: gst._simultaneousWith,
        })
      );

      handlers.set(gst.handlerTag, gst);
    }

    if (result.current.animatedHandlers) {
      result.current.animatedHandlers.value = result.current.config.gestures.map(
        (g) => g.handlers
      );
    }
  }

  function needsToReattach() {
    if (gesture.gestures.length != result.current.config.gestures.length) {
      return true;
    } else {
      for (let i = 0; i < gesture.gestures.length; i++) {
        if (
          gesture.gestures[i].handlerName !=
          result.current.config.gestures[i].handlerName
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

  if (result.current && result.current.callback) {
    if (needsToReattach()) {
      dropHandlers();
      attachHandlers();
    } else {
      updateHandlers();
    }
  }

  return result;
}

type GestureMonitorProps = {
  gesture: React.RefObject<GestureConfigRef>;
};

export class GestureMonitor extends React.Component<GestureMonitorProps> {
  private viewTag: number;
  private viewNode: any;

  constructor(props: GestureMonitorProps) {
    super(props);

    this.viewTag = -1;
  }

  componentDidMount() {
    setImmediate(() => {
      if (this.props.gesture.current) {
        this.props.gesture.current.callback = () => {
          //this.attachGestureHandlers(findNodeHandle(this.viewNode) as number);
          this.attachGestureHandlers(
            RNRenderer.findHostInstance_DEPRECATED(this)._nativeTag
          );
        };
      }
    });
  }

  componentDidUpdate() {
    //const viewTag = findNodeHandle(this.viewNode);
    const viewTag = RNRenderer.findHostInstance_DEPRECATED(this)._nativeTag;

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

  attachGestureHandlers(newViewTag: number) {
    //newViewTag = RNRenderer.findHostInstance_DEPRECATED(this)._nativeTag;
    //console.log(RNRenderer.findHostInstance_DEPRECATED(this)._nativeTag + ' ' + newViewTag);
    this.viewTag = newViewTag;
    if (this.props.gesture.current) {
      for (const gesture of this.props.gesture.current.config.gestures) {
        if (
          this.props.gesture.current &&
          this.props.gesture.current.animatedEventHandler
        ) {
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

  private onGestureHandlerEvent = (event: GestureEvent<U>) => {
    //console.log(this.viewTag + ' ' + event.nativeEvent.handlerTag);
    if (
      this.props.gesture.current &&
      Array.isArray(this.props.gesture.current.config.gestures)
    ) {
      for (const gesture of this.props.gesture.current.config.gestures) {
        if (gesture.handlerTag === event.nativeEvent.handlerTag) {
          gesture.handlers.onUpdate?.(event);
          break;
        }
      }
    }
  };

  // TODO(TS) - make sure this is right type for event
  private onGestureHandlerStateChange = (event: HandlerStateChangeEvent<U>) => {
    //console.log(event.nativeEvent);
    if (
      this.props.gesture.current &&
      Array.isArray(this.props.gesture.current.config.gestures)
    ) {
      for (const gesture of this.props.gesture.current.config.gestures) {
        if (gesture.handlerTag === event.nativeEvent.handlerTag) {
          if (event.nativeEvent.oldState == 0 && event.nativeEvent.state == 2) {
            gesture.handlers.onBegan?.(event);
          } else if (
            event.nativeEvent.oldState == 2 &&
            event.nativeEvent.state == 4
          ) {
            gesture.handlers.onStart?.(event);
          } else if (
            event.nativeEvent.oldState == 4 &&
            event.nativeEvent.state == 5
          ) {
            gesture.handlers.onEnd?.(event, true);
          } else if (event.nativeEvent.state == 1) {
            gesture.handlers.onEnd?.(event, false);
          } else if (event.nativeEvent.state == 3) {
            gesture.handlers.onEnd?.(event, false);
          }
          break;
        }
      }
    }
  };

  render() {
    let gestureEventHandler = this.onGestureHandlerEvent;
    let gestureStateEventHandler = this.onGestureHandlerStateChange;

    const events: {
      onGestureHandlerEvent: undefined | ((event: GestureEvent) => void);
      onGestureHandlerStateChange:
        | undefined
        | ((event: HandlerStateChangeEvent) => void);
    } = {
      onGestureHandlerEvent: undefined,
      onGestureHandlerStateChange: undefined,
    };

    if (
      this.props.gesture.current &&
      this.props.gesture.current.animatedEventHandler
    ) {
      events[
        'onGestureHandlerEvent'
      ] = this.props.gesture.current.animatedEventHandler;
    } else {
      events['onGestureHandlerEvent'] = gestureEventHandler;
      events['onGestureHandlerStateChange'] = gestureStateEventHandler;
    }

    const child: any = React.Children.only(this.props.children);
    if (
      this.props.gesture.current &&
      this.props.gesture.current.animatedEventHandler
    ) {
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
  }
}

function onGestureHandlerEvent(
  event: GestureEventPayload & Record<string, any>
) {
  const handler = findHandler(event.handlerTag);

  if (handler) {
    handler.handlers.onUpdate?.(event);
  }
}

function onGestureHandlerStateChange(
  event: HandlerStateChangeEventPayload & Record<string, any>
) {
  const gesture = findHandler(event.handlerTag);

  if (gesture) {
    if (event.oldState == 0 && event.state == 2) {
      gesture.handlers.onBegan?.(event);
    } else if (event.oldState == 2 && event.state == 4) {
      gesture.handlers.onStart?.(event);
    } else if (event.oldState == 4 && event.state == 5) {
      gesture.handlers.onEnd?.(event, true);
    } else if (event.state == 1) {
      gesture.handlers.onEnd?.(event, false);
    } else if (event.state == 3) {
      gesture.handlers.onEnd?.(event, false);
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
