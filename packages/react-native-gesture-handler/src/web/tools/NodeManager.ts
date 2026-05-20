import type { ValueOf } from '../../typeUtils';
import type { Gestures } from '../Gestures';
import type IGestureHandler from '../handlers/IGestureHandler';

type HandlerReadyBlock = (handler: IGestureHandler) => void;

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default abstract class NodeManager {
  private static gestures: Record<
    number,
    InstanceType<ValueOf<typeof Gestures>>
  > = {};

  private static observers: Map<number, Map<object, HandlerReadyBlock>> =
    new Map();

  public static getHandler(tag: number): IGestureHandler {
    if (tag in this.gestures) {
      return this.gestures[tag] as IGestureHandler;
    }

    throw new Error(`No handler for tag ${tag}`);
  }

  public static hasHandler(tag: number): boolean {
    return tag in this.gestures;
  }

  public static createGestureHandler(
    handlerTag: number,
    handler: InstanceType<ValueOf<typeof Gestures>>
  ): void {
    if (handlerTag in this.gestures) {
      throw new Error(
        `Handler with tag ${handlerTag} already exists. Please ensure that no Gesture instance is used across multiple GestureDetectors.`
      );
    }

    this.gestures[handlerTag] = handler;
    this.gestures[handlerTag].handlerTag = handlerTag;

    const pending = this.observers.get(handlerTag);
    if (pending) {
      // Snapshot before iterating — blocks may call back into observeHandler / cancelObservation
      // and mutate the underlying map.
      for (const block of Array.from(pending.values())) {
        block(handler as IGestureHandler);
      }
    }
  }

  public static dropGestureHandler(handlerTag: number): void {
    if (!(handlerTag in this.gestures)) {
      return;
    }

    this.gestures[handlerTag].onDestroy();

    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.gestures[handlerTag];
  }

  public static detachGestureHandler(handlerTag: number): void {
    if (!(handlerTag in this.gestures)) {
      return;
    }

    this.gestures[handlerTag].detach();
  }

  // Invokes `block` every time a handler with `tag` is created and, if the handler already exists,
  // immediately before returning. The observation persists until explicitly cancelled: the registry
  // holds both `owner` and `block` strongly, so callers MUST call `cancelObservation` or
  // `cancelAllObservationsForOwner` when the owner is going away (typically in effect cleanup) to
  // avoid leaking. Observing the same tag twice with the same `owner` replaces the previous block.
  public static observeHandler(
    tag: number,
    owner: object,
    block: HandlerReadyBlock
  ): void {
    let table = this.observers.get(tag);
    if (!table) {
      table = new Map();
      this.observers.set(tag, table);
    }
    table.set(owner, block);

    if (tag in this.gestures) {
      block(this.gestures[tag] as IGestureHandler);
    }
  }

  public static cancelObservation(tag: number, owner: object): void {
    const table = this.observers.get(tag);
    if (!table) {
      return;
    }
    table.delete(owner);
    if (table.size === 0) {
      this.observers.delete(tag);
    }
  }

  public static cancelAllObservationsForOwner(owner: object): void {
    for (const [tag, table] of this.observers) {
      table.delete(owner);
      if (table.size === 0) {
        this.observers.delete(tag);
      }
    }
  }

  public static get nodes() {
    return { ...this.gestures };
  }
}
