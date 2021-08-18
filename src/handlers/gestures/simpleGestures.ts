import { Gesture } from './gesture';
import { InteractionBuilder } from './interactionBuilder';
import { Directions } from '../../Directions';
import {
  GestureEventPayload,
  HandlerStateChangeEventPayload,
  HitSlop,
  CommonGestureConfig,
} from '../gestureHandlerCommon';
import { getNextHandlerTag } from '../handlersRegistry';
import {
  PanGestureConfig,
  PanGestureHandlerEventPayload,
} from '../PanGestureHandler';
import {
  ForceTouchGestureConfig,
  ForceTouchGestureHandlerEventPayload,
} from '../ForceTouchGestureHandler';
import { PinchGestureHandlerEventPayload } from '../PinchGestureHandler';
import { RotationGestureHandlerEventPayload } from '../RotationGestureHandler';
import {
  TapGestureHandlerEventPayload,
  TapGestureConfig,
} from '../TapGestureHandler';
import {
  LongPressGestureConfig,
  LongPressGestureHandlerEventPayload,
} from '../LongPressGestureHandler';
import {
  FlingGestureConfig,
  FlingGestureHandlerEventPayload,
} from '../FlingGestureHandler';

interface BaseGestureConfig extends CommonGestureConfig {
  ref?: React.RefObject<SimpleGesture<unknown>>;
  requireToFail?: (
    | number
    | SimpleGesture<unknown>
    | React.RefObject<SimpleGesture<unknown>>
  )[];
  simultaneousWith?: (
    | number
    | SimpleGesture<unknown>
    | React.RefObject<SimpleGesture<unknown>>
  )[];
}

type GestureHandlerEvent<
  GestureEventPayloadT = Record<string, unknown>
> = GestureEventPayload & GestureEventPayloadT;

type GestureHandlerStateChangeEvent<
  GestureStateChangeEventPayloadT = Record<string, unknown>
> = HandlerStateChangeEventPayload & GestureStateChangeEventPayloadT;

type HandlerCallbacks<EventPayloadT> = {
  handlerTag: number;
  onBegan?: (event: GestureHandlerStateChangeEvent<EventPayloadT>) => void;
  onStart?: (event: GestureHandlerStateChangeEvent<EventPayloadT>) => void;
  onEnd?: (
    event: GestureHandlerStateChangeEvent<EventPayloadT>,
    success: boolean
  ) => void;
  onUpdate?: (event: GestureHandlerEvent<EventPayloadT>) => void;
};

export abstract class SimpleGesture<EventPayloadT> extends Gesture {
  public handlerTag = -1;
  public handlerName = '';
  public config: BaseGestureConfig = {};
  public handlers: HandlerCallbacks<EventPayloadT> = {
    handlerTag: -1,
  };

  private addDependency(
    key: 'simultaneousWith' | 'requireToFail',
    gesture: SimpleGesture<unknown> | React.RefObject<SimpleGesture<unknown>>
  ) {
    this.config[key] = this.config[key]
      ? [].concat(this.config[key], gesture)
      : [gesture];
  }

  setRef(ref: React.RefObject<SimpleGesture<unknown>>) {
    this.config.ref = ref;
    return this;
  }

  setOnBegan(
    callback: (event: GestureHandlerStateChangeEvent<EventPayloadT>) => void
  ) {
    this.handlers.onBegan = callback;
    return this;
  }

  setOnStart(
    callback: (event: GestureHandlerStateChangeEvent<EventPayloadT>) => void
  ) {
    this.handlers.onStart = callback;
    return this;
  }

  setOnEnd(
    callback: (
      event: GestureHandlerStateChangeEvent<EventPayloadT>,
      success: boolean
    ) => void
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

  setHitSlop(hitSlop: HitSlop) {
    this.config.hitSlop = hitSlop;
    return this;
  }

  addSimultaneousGesture(
    gesture: SimpleGesture<unknown> | React.RefObject<SimpleGesture<unknown>>
  ) {
    this.addDependency('simultaneousWith', gesture);

    return this;
  }

  addRequiredToFailGesture(
    gesture: SimpleGesture<unknown> | React.RefObject<SimpleGesture<unknown>>
  ) {
    this.addDependency('requireToFail', gesture);

    return this;
  }

  simultaneousWith(other: SimpleGesture<unknown>): InteractionBuilder {
    return new InteractionBuilder(this).simultaneousWith(other);
  }

  exclusiveWith(other: SimpleGesture<unknown>): InteractionBuilder {
    return new InteractionBuilder(this).exclusiveWith(other);
  }

  requireToFail(other: SimpleGesture<unknown>): InteractionBuilder {
    return new InteractionBuilder(this).requireToFail(other);
  }

  initialize() {
    this.handlerTag = getNextHandlerTag();
    this.handlers = { ...this.handlers, handlerTag: this.handlerTag };

    if (this.config.ref) {
      this.config.ref.current = this;
    }
  }

  configure(): SimpleGesture<any>[] {
    return [this];
  }

  prepare() {
    if (this.config.requireToFail !== undefined) {
      this.config.requireToFail = this.toArray(this.config.requireToFail);
    }

    if (this.config.simultaneousWith !== undefined) {
      this.config.simultaneousWith = this.toArray(this.config.simultaneousWith);
    }
  }

  private toArray(x: unknown) {
    return [].concat(x);
  }
}

export class Tap extends SimpleGesture<TapGestureHandlerEventPayload> {
  public config: BaseGestureConfig & TapGestureConfig = {};

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
}

export class Pan extends SimpleGesture<PanGestureHandlerEventPayload> {
  public config: BaseGestureConfig & PanGestureConfig = {};

  constructor() {
    super();

    this.handlerName = 'PanGestureHandler';
  }

  setOnUpdate(
    callback: (
      event: GestureHandlerEvent<PanGestureHandlerEventPayload>
    ) => void
  ) {
    this.handlers.onUpdate = callback;
    return this;
  }

  setActiveOffsetY(offset: number | number[]) {
    if (Array.isArray(offset)) {
      this.config.activeOffsetYStart = offset[0];
      this.config.activeOffsetYEnd = offset[1];
    } else if (offset < 0) {
      this.config.activeOffsetYStart = offset;
    } else {
      this.config.activeOffsetYEnd = offset;
    }
    return this;
  }

  setActiveOffsetX(offset: number | number[]) {
    if (Array.isArray(offset)) {
      this.config.activeOffsetXStart = offset[0];
      this.config.activeOffsetXEnd = offset[1];
    } else if (offset < 0) {
      this.config.activeOffsetXStart = offset;
    } else {
      this.config.activeOffsetXEnd = offset;
    }
    return this;
  }

  setFailOffsetY(offset: number | number[]) {
    if (Array.isArray(offset)) {
      this.config.failOffsetYStart = offset[0];
      this.config.failOffsetYEnd = offset[1];
    } else if (offset < 0) {
      this.config.failOffsetYStart = offset;
    } else {
      this.config.failOffsetYEnd = offset;
    }
    return this;
  }

  setFailOffsetX(offset: number | number[]) {
    if (Array.isArray(offset)) {
      this.config.failOffsetXStart = offset[0];
      this.config.failOffsetXEnd = offset[1];
    } else if (offset < 0) {
      this.config.failOffsetXStart = offset;
    } else {
      this.config.failOffsetXEnd = offset;
    }
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
}

export class Pinch extends SimpleGesture<PinchGestureHandlerEventPayload> {
  constructor() {
    super();

    this.handlerName = 'PinchGestureHandler';
  }

  setOnUpdate(
    callback: (
      event: GestureHandlerEvent<PinchGestureHandlerEventPayload>
    ) => void
  ) {
    this.handlers.onUpdate = callback;
    return this;
  }
}

export class Rotation extends SimpleGesture<RotationGestureHandlerEventPayload> {
  constructor() {
    super();

    this.handlerName = 'RotationGestureHandler';
  }

  setOnUpdate(
    callback: (
      event: GestureHandlerEvent<RotationGestureHandlerEventPayload>
    ) => void
  ) {
    this.handlers.onUpdate = callback;
    return this;
  }
}

export class LongPress extends SimpleGesture<LongPressGestureHandlerEventPayload> {
  public config: BaseGestureConfig & LongPressGestureConfig = {};

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
}

export class Fling extends SimpleGesture<FlingGestureHandlerEventPayload> {
  public config: BaseGestureConfig & FlingGestureConfig = {};

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
}

export class ForceTouch extends SimpleGesture<ForceTouchGestureHandlerEventPayload> {
  public config: BaseGestureConfig & ForceTouchGestureConfig = {};

  constructor() {
    super();

    this.handlerName = 'ForceTouchGestureHandler';
  }

  setOnUpdate(
    callback: (
      event: GestureHandlerEvent<ForceTouchGestureHandlerEventPayload>
    ) => void
  ) {
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
}
