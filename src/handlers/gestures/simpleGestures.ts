import { Gesture } from './gesture';
import { GestureBuilder, BuiltGesture } from './gestureBuilder';
import { Directions } from '../../Directions';
import { baseGestureHandlerWithMonitorProps } from '../gestureHandlerCommon';
import { getNextHandlerTag } from '../handlersRegistry';
import { tapGestureHandlerProps } from '../TapGestureHandler';
import {
  panGestureHandlerProps,
  panGestureHandlerCustomNativeProps,
  managePanProps,
} from '../PanGestureHandler';
import { longPressGestureHandlerProps } from '../LongPressGestureHandler';
import { flingGestureHandlerProps } from '../FlingGestureHandler';
import { forceTouchGestureHandlerProps } from '../ForceTouchGestureHandler';

export abstract class SimpleGesture extends Gesture {
  public handlerTag = -1;
  public handlerName = '';
  public config: any = {};
  public handlers: any = {
    handlerTag: -1,
    onBegin: null,
    onUpdate: null,
    onEnd: null,
    onStart: null,
  };

  //TODO fix type
  static allowedProps: any = baseGestureHandlerWithMonitorProps;

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

  private toArray(x: any) {
    return [].concat(x);
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

  simultaneousWith(other: SimpleGesture): GestureBuilder {
    return new GestureBuilder(this).simultaneousWith(other);
  }

  exclusiveWith(other: SimpleGesture): GestureBuilder {
    return new GestureBuilder(this).exclusiveWith(other);
  }

  requireToFail(other: SimpleGesture): GestureBuilder {
    return new GestureBuilder(this).requireToFail(other);
  }

  initialize() {
    this.handlerTag = getNextHandlerTag();
    this.handlers = { ...this.handlers, handlerTag: this.handlerTag };

    if (this.config.ref) {
      this.config.ref.current = this;
    }
  }

  build(): BuiltGesture {
    const result = new BuiltGesture(this.prepare);

    result.gestures = [this];

    return result;
  }

  prepare = () => {
    if (this.config.requireToFail !== undefined) {
      this.config.requireToFail = this.toArray(this.config.requireToFail);
    }

    if (this.config.after !== undefined) {
      this.config.after = this.toArray(this.config.after);
    }

    if (this.config.simultaneousWith !== undefined) {
      this.config.simultaneousWith = this.toArray(this.config.simultaneousWith);
    }
  };

  getAllowedProps(): any {
    return SimpleGesture.allowedProps;
  }

  transformProps() {
    return this.config;
  }
}

export class Tap extends SimpleGesture {
  static allowedProps = [
    ...baseGestureHandlerWithMonitorProps,
    ...tapGestureHandlerProps,
  ];

  constructor() {
    super();

    this.handlerName = 'TapGestureHandler';
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
    ...baseGestureHandlerWithMonitorProps,
    ...panGestureHandlerProps,
    ...panGestureHandlerCustomNativeProps,
  ];

  constructor() {
    super();

    this.handlerName = 'PanGestureHandler';
  }

  setActiveOffsetY(offset: number | number[]) {
    this.setConfig('activeOffsetY', offset);
    return this;
  }

  setActiveOffsetX(offset: number | number[]) {
    this.setConfig('activeOffsetX', offset);
    return this;
  }

  setFailOffsetY(offset: number | number[]) {
    this.setConfig('failOffsetY', offset);
    return this;
  }

  setFailOffsetX(offset: number | number[]) {
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
  }
}

export class Rotation extends SimpleGesture {
  constructor() {
    super();

    this.handlerName = 'RotationGestureHandler';
  }
}

export class LongPress extends SimpleGesture {
  static allowedProps = [
    ...baseGestureHandlerWithMonitorProps,
    ...longPressGestureHandlerProps,
  ];

  constructor() {
    super();

    this.handlerName = 'LongPressGestureHandler';
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
  static allowedProps = [
    ...baseGestureHandlerWithMonitorProps,
    ...flingGestureHandlerProps,
  ];

  constructor() {
    super();

    this.handlerName = 'FlingGestureHandler';
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

export class ForceTouch extends SimpleGesture {
  static allowedProps = [
    ...baseGestureHandlerWithMonitorProps,
    ...forceTouchGestureHandlerProps,
  ];

  constructor() {
    super();

    this.handlerName = 'ForceTouchGestureHandler';
  }

  setMinForce(force: number) {
    this.setConfig('minForce', force);
    return this;
  }

  setMaxForce(force: number) {
    this.setConfig('maxForce', force);
    return this;
  }

  setFeedbackOnActivation(value: boolean) {
    this.setConfig('feedbackOnActivation', value);
    return this;
  }

  getAllowedProps() {
    return ForceTouch.allowedProps;
  }
}
