import { Gesture } from './gesture';
import { InteractionBuilder } from './interactionBuilder';
import {
  HitSlop,
  CommonGestureConfig,
  UnwrappedGestureHandlerStateChangeEvent,
  UnwrappedGestureHandlerEvent,
} from '../gestureHandlerCommon';
import { getNextHandlerTag } from '../handlersRegistry';

export interface BaseGestureConfig extends CommonGestureConfig {
  ref?: React.RefObject<BaseGesture<unknown>>;
  requireToFail?: (
    | number
    | BaseGesture<unknown>
    | React.RefObject<BaseGesture<unknown>>
  )[];
  simultaneousWith?: (
    | number
    | BaseGesture<unknown>
    | React.RefObject<BaseGesture<unknown>>
  )[];
}

type HandlerCallbacks<EventPayloadT> = {
  handlerTag: number;
  onBegan?: (
    event: UnwrappedGestureHandlerStateChangeEvent<EventPayloadT>
  ) => void;
  onStart?: (
    event: UnwrappedGestureHandlerStateChangeEvent<EventPayloadT>
  ) => void;
  onEnd?: (
    event: UnwrappedGestureHandlerStateChangeEvent<EventPayloadT>,
    success: boolean
  ) => void;
  onUpdate?: (event: UnwrappedGestureHandlerEvent<EventPayloadT>) => void;
};

export abstract class BaseGesture<EventPayloadT> extends Gesture {
  public handlerTag = -1;
  public handlerName = '';
  public config: BaseGestureConfig = {};
  public handlers: HandlerCallbacks<EventPayloadT> = {
    handlerTag: -1,
  };

  private addDependency(
    key: 'simultaneousWith' | 'requireToFail',
    gesture: BaseGesture<unknown> | React.RefObject<BaseGesture<unknown>>
  ) {
    this.config[key] = this.config[key]
      ? [].concat(this.config[key], gesture)
      : [gesture];
  }

  setRef(ref: React.RefObject<BaseGesture<unknown>>) {
    this.config.ref = ref;
    return this;
  }

  setOnBegan(
    callback: (
      event: UnwrappedGestureHandlerStateChangeEvent<EventPayloadT>
    ) => void
  ) {
    this.handlers.onBegan = callback;
    return this;
  }

  setOnStart(
    callback: (
      event: UnwrappedGestureHandlerStateChangeEvent<EventPayloadT>
    ) => void
  ) {
    this.handlers.onStart = callback;
    return this;
  }

  setOnEnd(
    callback: (
      event: UnwrappedGestureHandlerStateChangeEvent<EventPayloadT>,
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
    gesture: BaseGesture<unknown> | React.RefObject<BaseGesture<unknown>>
  ) {
    this.addDependency('simultaneousWith', gesture);

    return this;
  }

  addRequiredToFailGesture(
    gesture: BaseGesture<unknown> | React.RefObject<BaseGesture<unknown>>
  ) {
    this.addDependency('requireToFail', gesture);

    return this;
  }

  simultaneousWith(other: BaseGesture<unknown>): InteractionBuilder {
    return new InteractionBuilder(this).simultaneousWith(other);
  }

  exclusiveWith(other: BaseGesture<unknown>): InteractionBuilder {
    return new InteractionBuilder(this).exclusiveWith(other);
  }

  requireToFail(other: BaseGesture<unknown>): InteractionBuilder {
    return new InteractionBuilder(this).requireToFail(other);
  }

  initialize() {
    this.handlerTag = getNextHandlerTag();
    this.handlers = { ...this.handlers, handlerTag: this.handlerTag };

    if (this.config.ref) {
      this.config.ref.current = this;
    }
  }

  configure(): BaseGesture<any>[] {
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
