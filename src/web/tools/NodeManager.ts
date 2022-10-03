import { ValueOf } from '../../typeUtils';
import { Gestures } from '../../RNGestureHandlerModule.web';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default abstract class NodeManager {
  private static gestures: Record<
    number,
    InstanceType<ValueOf<typeof Gestures>>
  > = {};

  public static getHandler(tag: number) {
    if (tag in this.gestures) {
      return this.gestures[tag];
    }

    throw new Error(`No handler for tag ${tag}`);
  }

  public static createGestureHandler(
    handlerTag: number,
    handler: InstanceType<ValueOf<typeof Gestures>>
  ): void {
    if (handlerTag in this.gestures) {
      throw new Error(`Handler with tag ${handlerTag} already exists`);
    }

    this.gestures[handlerTag] = handler;
    this.gestures[handlerTag].setTag(handlerTag);
  }

  public static dropGestureHandler(handlerTag: number): void {
    if (!(handlerTag in this.gestures)) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.gestures[handlerTag];
  }

  public static getNodes() {
    return { ...this.gestures };
  }
}
