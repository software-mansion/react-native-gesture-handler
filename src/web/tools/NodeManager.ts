import { ValueOf } from '../../typeUtils';
import { Gestures } from '../../RNGestureHandlerModule.web';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class NodeManager {
  private static gestures: Record<
    number,
    InstanceType<ValueOf<typeof Gestures>>
  > = {};

  static getHandler(tag: number) {
    if (tag in this.gestures) {
      return this.gestures[tag];
    }

    throw new Error(`No handler for tag ${tag}`);
  }

  static createGestureHandler(
    handlerTag: number,
    handler: InstanceType<ValueOf<typeof Gestures>>
  ) {
    if (handlerTag in this.gestures) {
      throw new Error(`Handler with tag ${handlerTag} already exists`);
    }

    this.gestures[handlerTag] = handler;
    this.gestures[handlerTag].setTag(handlerTag);
  }

  static dropGestureHandler(handlerTag: number) {
    if (!(handlerTag in this.gestures)) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.gestures[handlerTag];
  }

  static getNodes() {
    return { ...this.gestures };
  }
}
