import { Gesture } from './gesture';
import { GestureBuilder, BuiltGesture } from './gestureBuilder';
import { Directions } from '../../Directions';
import {
  baseGestureHandlerWithMonitorProps,
  GestureEventPayload,
  HandlerStateChangeEventPayload,
} from '../gestureHandlerCommon';
import { getNextHandlerTag } from '../handlersRegistry';
import { tapGestureHandlerProps } from '../TapGestureHandler';
import {
  panGestureHandlerProps,
  panGestureHandlerCustomNativeProps,
  managePanProps,
  PanGestureHandlerEventPayload,
} from '../PanGestureHandler';
import { longPressGestureHandlerProps } from '../LongPressGestureHandler';
import { flingGestureHandlerProps } from '../FlingGestureHandler';
import {
  ForceTouchGestureHandlerEventPayload,
  forceTouchGestureHandlerProps,
} from '../ForceTouchGestureHandler';
import { PinchGestureHandlerEventPayload } from '../PinchGestureHandler';
import { RotationGestureHandlerEventPayload } from '../RotationGestureHandler';

type HitSlopType =
  | number
  | Partial<
      Record<
        'left' | 'right' | 'top' | 'bottom' | 'vertical' | 'horizontal',
        number
      >
    >
  | Record<'width' | 'left', number>
  | Record<'width' | 'right', number>
  | Record<'height' | 'top', number>
  | Record<'height' | 'bottom', number>;

type CommonGestureConfig = {
  ref: React.RefObject<SimpleGesture>;
  enabled: boolean;
  minPointers: number;
  shouldCancelWhenOutside: boolean;
  hitSlop: HitSlopType;
  requireToFail: (number | SimpleGesture | React.RefObject<SimpleGesture>)[];
  simultaneousWith: (number | SimpleGesture | React.RefObject<SimpleGesture>)[];
};

type PanGestureHandlerEvent = GestureEventPayload &
  PanGestureHandlerEventPayload;

type PinchGestureHandlerEvent = GestureEventPayload &
  PinchGestureHandlerEventPayload;

type RotationGestureHandlerEvent = GestureEventPayload &
  RotationGestureHandlerEventPayload;

type ForceTouchGestureHandlerEvent = GestureEventPayload &
  ForceTouchGestureHandlerEventPayload;

type HandlerCallbacks = {
  handlerTag: number;
  onBegan?: (event: HandlerStateChangeEventPayload) => void;
  onStart?: (event: HandlerStateChangeEventPayload) => void;
  onEnd?: (event: HandlerStateChangeEventPayload, success: boolean) => void;
  onUpdate?:
    | ((event: PanGestureHandlerEvent) => void)
    | ((event: PinchGestureHandlerEvent) => void)
    | ((event: RotationGestureHandlerEvent) => void)
    | ((event: ForceTouchGestureHandlerEvent) => void);
};

export abstract class SimpleGesture extends Gesture {
  public handlerTag = -1;
  public handlerName = '';
  public config: Partial<CommonGestureConfig> = {};
  public handlers: HandlerCallbacks = {
    handlerTag: -1,
  };

  //TODO fix type
  static allowedProps: any = baseGestureHandlerWithMonitorProps;

  private addDependency(
    key: 'simultaneousWith' | 'requireToFail',
    gesture: SimpleGesture | React.RefObject<SimpleGesture>
  ) {
    this.config[key] = this.config[key]
      ? [].concat(this.config[key], gesture)
      : [gesture];
  }

  private toArray(x: unknown) {
    return [].concat(x);
  }

  setRef(ref: React.RefObject<SimpleGesture>) {
    this.config.ref = ref;
    return this;
  }

  setOnBegan(callback: (event: HandlerStateChangeEventPayload) => void) {
    this.handlers.onBegan = callback;
    return this;
  }

  setOnStart(callback: (event: HandlerStateChangeEventPayload) => void) {
    this.handlers.onStart = callback;
    return this;
  }

  setOnEnd(
    callback: (event: HandlerStateChangeEventPayload, success: boolean) => void
  ) {
    this.handlers.onEnd = callback;
    return this;
  }

  setEnabled(enabled: boolean) {
    this.config.enabled = enabled;
    return this;
  }

  setMinPointers(minPointers: number) {
    this.config.minPointers = minPointers;
    return this;
  }

  setShouldCancelWhenOutside(value: boolean) {
    this.config.shouldCancelWhenOutside = value;
    return this;
  }

  setHitSlop(hitSlop: HitSlopType) {
    this.config.hitSlop = hitSlop;
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

type TapGestureConfig = CommonGestureConfig & {
  numberOfTaps: number;
  maxDist: number;
  maxDurationMs: number;
  maxDelayMs: number;
  maxDeltaX: number;
  maxDeltaY: number;
};

export class Tap extends SimpleGesture {
  public config: Partial<TapGestureConfig> = {};

  static allowedProps = [
    ...baseGestureHandlerWithMonitorProps,
    ...tapGestureHandlerProps,
  ];

  constructor() {
    super();

    this.handlerName = 'TapGestureHandler';
  }

  setTapCount(count: number) {
    this.config.numberOfTaps = count;
    return this;
  }

  setMaxDistance(maxDist: number) {
    this.config.maxDist = maxDist;
    return this;
  }

  setMaxDuration(duration: number) {
    this.config.maxDurationMs = duration;
    return this;
  }

  setMaxDelay(delay: number) {
    this.config.maxDelayMs = delay;
    return this;
  }

  setMaxDeltaX(delta: number) {
    this.config.maxDeltaX = delta;
    return this;
  }

  setMaxDeltaY(delta: number) {
    this.config.maxDeltaY = delta;
    return this;
  }

  getAllowedProps() {
    return Tap.allowedProps;
  }
}

type PanGestureConfig = CommonGestureConfig & {
  activeOffsetY: number | number[];
  activeOffsetX: number | number[];
  failOffsetY: number | number[];
  failOffsetX: number | number[];
  minDist: number;
  avgTouches: boolean;
  enableTrackpadTwoFingerGesture: boolean;
};

export class Pan extends SimpleGesture {
  public config: Partial<PanGestureConfig> = {};
  static allowedProps = [
    ...baseGestureHandlerWithMonitorProps,
    ...panGestureHandlerProps,
    ...panGestureHandlerCustomNativeProps,
  ];

  constructor() {
    super();

    this.handlerName = 'PanGestureHandler';
  }

  setOnUpdate(callback: (event: PanGestureHandlerEvent) => void) {
    this.handlers.onUpdate = callback;
    return this;
  }

  setActiveOffsetY(offset: number | number[]) {
    this.config.activeOffsetY = offset;
    return this;
  }

  setActiveOffsetX(offset: number | number[]) {
    this.config.activeOffsetX = offset;
    return this;
  }

  setFailOffsetY(offset: number | number[]) {
    this.config.failOffsetY = offset;
    return this;
  }

  setFailOffsetX(offset: number | number[]) {
    this.config.failOffsetX = offset;
    return this;
  }

  setMinDistance(distance: number) {
    this.config.minDist = distance;
    return this;
  }

  setAverageTouches(value: boolean) {
    this.config.avgTouches = value;
    return this;
  }

  setEnableTrackpadTwoFingerGesture(value: boolean) {
    this.config.enableTrackpadTwoFingerGesture = value;
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

  setOnUpdate(callback: (event: PinchGestureHandlerEvent) => void) {
    this.handlers.onUpdate = callback;
    return this;
  }
}

export class Rotation extends SimpleGesture {
  constructor() {
    super();

    this.handlerName = 'RotationGestureHandler';
  }

  setOnUpdate(callback: (event: RotationGestureHandlerEventPayload) => void) {
    this.handlers.onUpdate = callback;
    return this;
  }
}

type LongPressGestureConfig = CommonGestureConfig & {
  minDurationMs: number;
  maxDist: number;
};

export class LongPress extends SimpleGesture {
  public config: Partial<LongPressGestureConfig> = {};
  static allowedProps = [
    ...baseGestureHandlerWithMonitorProps,
    ...longPressGestureHandlerProps,
  ];

  constructor() {
    super();

    this.handlerName = 'LongPressGestureHandler';
  }

  setMinDuration(duration: number) {
    this.config.minDurationMs = duration;
    return this;
  }

  setMaxDistance(distance: number) {
    this.config.maxDist = distance;
    return this;
  }

  getAllowedProps() {
    return LongPress.allowedProps;
  }
}

type FlingGestureConfig = CommonGestureConfig & {
  numberOfPointers: number;
  direction: Directions;
};

export class Fling extends SimpleGesture {
  public config: Partial<FlingGestureConfig> = {};
  static allowedProps = [
    ...baseGestureHandlerWithMonitorProps,
    ...flingGestureHandlerProps,
  ];

  constructor() {
    super();

    this.handlerName = 'FlingGestureHandler';
  }

  setNumberOfPointers(pointers: number) {
    this.config.numberOfPointers = pointers;
    return this;
  }

  setDirection(direction: Directions) {
    this.config.direction = direction;
    return this;
  }

  getAllowedProps() {
    return Fling.allowedProps;
  }
}

type ForceTouchGestureConfig = CommonGestureConfig & {
  minForce: number;
  maxForce: number;
  feedbackOnActivation: boolean;
};

export class ForceTouch extends SimpleGesture {
  public config: Partial<ForceTouchGestureConfig> = {};
  static allowedProps = [
    ...baseGestureHandlerWithMonitorProps,
    ...forceTouchGestureHandlerProps,
  ];

  constructor() {
    super();

    this.handlerName = 'ForceTouchGestureHandler';
  }

  setOnUpdate(callback: (event: ForceTouchGestureHandlerEventPayload) => void) {
    this.handlers.onUpdate = callback;
    return this;
  }

  setMinForce(force: number) {
    this.config.minForce = force;
    return this;
  }

  setMaxForce(force: number) {
    this.config.maxForce = force;
    return this;
  }

  setFeedbackOnActivation(value: boolean) {
    this.config.feedbackOnActivation = value;
    return this;
  }

  getAllowedProps() {
    return ForceTouch.allowedProps;
  }
}
