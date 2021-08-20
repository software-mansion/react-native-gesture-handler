import { FlingGestureHandlerEventPayload } from '../FlingGestureHandler';
import { ForceTouchGestureHandlerEventPayload } from '../ForceTouchGestureHandler';
import {
  HitSlop,
  CommonGestureConfig,
  UnwrappedGestureHandlerStateChangeEvent,
  UnwrappedGestureHandlerEvent,
} from '../gestureHandlerCommon';
import { getNextHandlerTag } from '../handlersRegistry';
import { LongPressGestureHandlerEventPayload } from '../LongPressGestureHandler';
import { PanGestureHandlerEventPayload } from '../PanGestureHandler';
import { PinchGestureHandlerEventPayload } from '../PinchGestureHandler';
import { RotationGestureHandlerEventPayload } from '../RotationGestureHandler';
import { TapGestureHandlerEventPayload } from '../TapGestureHandler';

export type GestureType =
  | BaseGesture<Record<string, unknown>>
  | BaseGesture<TapGestureHandlerEventPayload>
  | BaseGesture<PanGestureHandlerEventPayload>
  | BaseGesture<LongPressGestureHandlerEventPayload>
  | BaseGesture<RotationGestureHandlerEventPayload>
  | BaseGesture<PinchGestureHandlerEventPayload>
  | BaseGesture<FlingGestureHandlerEventPayload>
  | BaseGesture<ForceTouchGestureHandlerEventPayload>;

export type GestureRef = number | GestureType | React.RefObject<GestureType>;
export interface BaseGestureConfig extends CommonGestureConfig {
  ref?: React.MutableRefObject<GestureType>;
  requireToFail?: GestureRef[];
  simultaneousWith?: GestureRef[];
}

export type HandlerCallbacks<EventPayloadT extends Record<string, unknown>> = {
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

export abstract class Gesture {
  /**
   * Return array of gestures, providing the same interface for creating and updating
   * handlers, no matter which object was used to create gesture instance.
   */
  abstract configure(): GestureType[];

  /**
   * Assign handlerTag to the gesture instance and set ref.current (if a ref is set)
   */
  abstract initialize(): void;

  /**
   * Make sure that values of properties defining relations are arrays. Do any necessary
   * preprocessing required to configure relations between handlers. Called just before
   * updating the handler on the native side.
   */
  abstract prepare(): void;
}

export abstract class BaseGesture<
  EventPayloadT extends Record<string, unknown>
> extends Gesture {
  public handlerTag = -1;
  public handlerName = '';
  public config: BaseGestureConfig = {};
  public handlers: HandlerCallbacks<EventPayloadT> = {
    handlerTag: -1,
  };

  private addDependency(
    key: 'simultaneousWith' | 'requireToFail',
    gesture: Exclude<GestureRef, number>
  ) {
    const value = this.config[key];
    this.config[key] = value
      ? Array<GestureRef>().concat(value, gesture)
      : [gesture];
  }

  setRef(ref: React.MutableRefObject<GestureType>) {
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

  addSimultaneousGesture(gesture: Exclude<GestureRef, number>) {
    this.addDependency('simultaneousWith', gesture);
    return this;
  }

  addRequiredToFailGesture(gesture: Exclude<GestureRef, number>) {
    this.addDependency('requireToFail', gesture);
    return this;
  }

  simultaneousWith(other: GestureType): InteractionBuilder {
    return new InteractionBuilder(this as GestureType).simultaneousWith(other);
  }

  exclusiveWith(other: GestureType): InteractionBuilder {
    return new InteractionBuilder(this as GestureType).exclusiveWith(other);
  }

  requireToFail(other: GestureType): InteractionBuilder {
    return new InteractionBuilder(this as GestureType).requireToFail(other);
  }

  initialize() {
    this.handlerTag = getNextHandlerTag();
    this.handlers = { ...this.handlers, handlerTag: this.handlerTag };

    if (this.config.ref) {
      this.config.ref.current = this as GestureType;
    }
  }

  configure(): GestureType[] {
    return [this as GestureType];
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  prepare() {}
}

enum Relation {
  Simultaneous,
  Exclusive,
  RequireToFail,
}

type PendingGesture = {
  relation: Relation;
  gesture: GestureType;
};

export class InteractionBuilder extends Gesture {
  private pendingGestures: PendingGesture[] = [];

  constructor(base: GestureType) {
    super();
    this.addGesture({ relation: Relation.Exclusive, gesture: base });
  }

  simultaneousWith(gesture: GestureType): InteractionBuilder {
    return this.addGesture({
      relation: Relation.Simultaneous,
      gesture,
    });
  }

  exclusiveWith(gesture: GestureType): InteractionBuilder {
    return this.addGesture({
      relation: Relation.Exclusive,
      gesture,
    });
  }

  requireToFail(gesture: GestureType): InteractionBuilder {
    return this.addGesture({
      relation: Relation.RequireToFail,
      gesture,
    });
  }

  private addGesture(gesture: PendingGesture): InteractionBuilder {
    this.pendingGestures.push(gesture);
    return this;
  }

  configure(): GestureType[] {
    return this.pendingGestures.map((pending) => pending.gesture);
  }

  prepare() {
    const simultaneousGestures: GestureType[] = [];
    const waitForGestures: GestureType[] = [];

    for (let i = this.pendingGestures.length - 1; i >= 0; i--) {
      const pendingGesture = this.pendingGestures[i];
      pendingGesture.gesture.prepare();

      const newConfig = { ...pendingGesture.gesture.config };

      newConfig.simultaneousWith = this.extendRelation(
        newConfig.simultaneousWith,
        simultaneousGestures
      );
      newConfig.requireToFail = this.extendRelation(
        newConfig.requireToFail,
        waitForGestures
      );

      pendingGesture.gesture.config = newConfig;

      switch (pendingGesture.relation) {
        case Relation.Simultaneous:
          simultaneousGestures.push(pendingGesture.gesture);
          break;
        case Relation.Exclusive:
          break;
        case Relation.RequireToFail:
          waitForGestures.push(pendingGesture.gesture);
          break;
      }
    }
  }

  private extendRelation(
    currentRelation: GestureRef[] | undefined,
    extendWith: GestureType[]
  ) {
    if (currentRelation === undefined) {
      return [...extendWith];
    } else {
      return [...currentRelation, ...extendWith];
    }
  }

  initialize() {
    for (const pendingGesture of this.pendingGestures) {
      pendingGesture.gesture.initialize();
    }
  }
}
