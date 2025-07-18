import { ValueOf } from '../../typeUtils';
import { Gestures } from '../Gestures';
import type IGestureHandler from '../handlers/IGestureHandler';
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default abstract class NodeManager {
  private static gestures: Record<
    number,
    InstanceType<ValueOf<typeof Gestures>>
  > = {};

  public static getHandler(tag: number): IGestureHandler {
    if (tag in this.gestures) {
      return this.gestures[tag] as IGestureHandler;
    }

    throw new Error(`No handler for tag ${tag}`);
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
  }

  public static dropGestureHandler(handlerTag: number): void {
    if (!(handlerTag in this.gestures)) {
      return;
    }
    this.gestures[handlerTag].onDestroy();
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.gestures[handlerTag];
  }

  public static get nodes() {
    return { ...this.gestures };
  }
}
