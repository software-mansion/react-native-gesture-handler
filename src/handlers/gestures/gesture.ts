import {
  HitSlop,
  CommonGestureConfig,
  UnwrappedGestureHandlerStateChangeEvent,
  UnwrappedGestureHandlerEvent,
} from '../gestureHandlerCommon';
import { getNextHandlerTag } from '../handlersRegistry';

export type GestureRef =
  | number
  | BaseGesture<Record<string, unknown>>
  | React.RefObject<BaseGesture<Record<string, unknown>>>;
export interface BaseGestureConfig extends CommonGestureConfig {
  ref?: React.MutableRefObject<BaseGesture<Record<string, unknown>>>;
  requireToFail?: (
    | number
    | BaseGesture<Record<string, unknown>>
    | React.RefObject<BaseGesture<Record<string, unknown>>>
  )[];
  simultaneousWith?: (
    | number
    | BaseGesture<Record<string, unknown>>
    | React.RefObject<BaseGesture<Record<string, unknown>>>
  )[];
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
  abstract configure(): BaseGesture<Record<string, unknown>>[];

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

  setRef(ref: React.MutableRefObject<BaseGesture<Record<string, unknown>>>) {
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

  simultaneousWith(
    other: BaseGesture<Record<string, unknown>>
  ): InteractionBuilder {
    return new InteractionBuilder(
      this as BaseGesture<Record<string, unknown>>
    ).simultaneousWith(other);
  }

  exclusiveWith(
    other: BaseGesture<Record<string, unknown>>
  ): InteractionBuilder {
    return new InteractionBuilder(
      this as BaseGesture<Record<string, unknown>>
    ).exclusiveWith(other);
  }

  requireToFail(
    other: BaseGesture<Record<string, unknown>>
  ): InteractionBuilder {
    return new InteractionBuilder(
      this as BaseGesture<Record<string, unknown>>
    ).requireToFail(other);
  }

  initialize() {
    this.handlerTag = getNextHandlerTag();
    this.handlers = { ...this.handlers, handlerTag: this.handlerTag };

    if (this.config.ref) {
      this.config.ref.current = this as BaseGesture<Record<string, unknown>>;
    }
  }

  configure(): BaseGesture<Record<string, unknown>>[] {
    return [this as BaseGesture<Record<string, unknown>>];
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
    return [].concat(x as never);
  }
}

enum Relation {
  Simultaneous,
  Exclusive,
  RequireToFail,
}

type PendingGesture = {
  relation: Relation;
  gesture: BaseGesture<Record<string, unknown>>;
};

export class InteractionBuilder extends Gesture {
  private pendingGestures: PendingGesture[] = [];

  constructor(base: BaseGesture<Record<string, unknown>>) {
    super();
    this.addGesture({ relation: Relation.Exclusive, gesture: base });
  }

  simultaneousWith(
    gesture: BaseGesture<Record<string, unknown>>
  ): InteractionBuilder {
    return this.addGesture({
      relation: Relation.Simultaneous,
      gesture,
    });
  }

  exclusiveWith(
    gesture: BaseGesture<Record<string, unknown>>
  ): InteractionBuilder {
    return this.addGesture({
      relation: Relation.Exclusive,
      gesture,
    });
  }

  requireToFail(
    gesture: BaseGesture<Record<string, unknown>>
  ): InteractionBuilder {
    return this.addGesture({
      relation: Relation.RequireToFail,
      gesture,
    });
  }

  private addGesture(gesture: PendingGesture): InteractionBuilder {
    this.pendingGestures.push(gesture);
    return this;
  }

  configure(): BaseGesture<Record<string, unknown>>[] {
    return this.pendingGestures.map((pending) => pending.gesture);
  }

  prepare() {
    const simultaneousTags: number[] = [];
    const waitForTags: number[] = [];

    for (let i = this.pendingGestures.length - 1; i >= 0; i--) {
      const pendingGesture = this.pendingGestures[i];
      pendingGesture.gesture.prepare();

      const newConfig = { ...pendingGesture.gesture.config };

      newConfig.simultaneousWith = this.extendRelation(
        newConfig.simultaneousWith,
        simultaneousTags
      );
      newConfig.requireToFail = this.extendRelation(
        newConfig.requireToFail,
        waitForTags
      );

      pendingGesture.gesture.config = newConfig;

      switch (pendingGesture.relation) {
        case Relation.Simultaneous:
          simultaneousTags.push(pendingGesture.gesture.handlerTag);
          break;
        case Relation.Exclusive:
          break;
        case Relation.RequireToFail:
          waitForTags.push(pendingGesture.gesture.handlerTag);
          break;
      }
    }
  }

  private extendRelation(
    currentRelation: GestureRef[] | undefined,
    extendWith: number[]
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
