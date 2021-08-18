import {
  HitSlop,
  CommonGestureConfig,
  UnwrappedGestureHandlerStateChangeEvent,
  UnwrappedGestureHandlerEvent,
} from '../gestureHandlerCommon';
import { getNextHandlerTag } from '../handlersRegistry';

export interface BaseGestureConfig extends CommonGestureConfig {
  ref?: React.MutableRefObject<BaseGesture<any>>;
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

export abstract class Gesture {
  /**
   * Return array of gestures, providing the same interface for creating and updating
   * handlers, no matter which object was used to create gesture instance.
   */
  abstract configure(): BaseGesture<any>[];

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
      ? [].concat(this.config[key] as never, gesture as never)
      : [gesture];
  }

  setRef(ref: React.MutableRefObject<BaseGesture<unknown>>) {
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
    gesture: BaseGesture<any> | React.RefObject<BaseGesture<any>>
  ) {
    this.addDependency('simultaneousWith', gesture);

    return this;
  }

  addRequiredToFailGesture(
    gesture: BaseGesture<any> | React.RefObject<BaseGesture<any>>
  ) {
    this.addDependency('requireToFail', gesture);

    return this;
  }

  simultaneousWith(other: BaseGesture<any>): InteractionBuilder {
    return new InteractionBuilder(this).simultaneousWith(other);
  }

  exclusiveWith(other: BaseGesture<any>): InteractionBuilder {
    return new InteractionBuilder(this).exclusiveWith(other);
  }

  requireToFail(other: BaseGesture<any>): InteractionBuilder {
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
  gesture: BaseGesture<unknown>;
};

export class InteractionBuilder extends Gesture {
  private pendingGestures: PendingGesture[] = [];

  constructor(base: BaseGesture<any>) {
    super();
    this.addGesture({ relation: Relation.Exclusive, gesture: base });
  }

  simultaneousWith(gesture: BaseGesture<any>): InteractionBuilder {
    return this.addGesture({
      relation: Relation.Simultaneous,
      gesture: gesture,
    });
  }

  exclusiveWith(gesture: BaseGesture<any>): InteractionBuilder {
    return this.addGesture({
      relation: Relation.Exclusive,
      gesture: gesture,
    });
  }

  requireToFail(gesture: BaseGesture<any>): InteractionBuilder {
    return this.addGesture({
      relation: Relation.RequireToFail,
      gesture: gesture,
    });
  }

  private addGesture(gesture: PendingGesture): InteractionBuilder {
    this.pendingGestures.push(gesture);
    return this;
  }

  configure(): BaseGesture<unknown>[] {
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
    currentRelation:
      | (
          | number
          | BaseGesture<unknown>
          | React.RefObject<BaseGesture<unknown>>
        )[]
      | undefined,
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
