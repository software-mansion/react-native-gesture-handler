import { ValueOf } from '../../typeUtils';
import { Gestures } from '../../RNGestureHandlerModule.web';

const gestures: Record<number, InstanceType<ValueOf<typeof Gestures>>> = {};
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class NodeManager {
  static getHandler(tag: number) {
    if (tag in gestures) return gestures[tag];

    throw new Error(`No handler for tag ${tag}`);
  }

  static createGestureHandler(
    handlerTag: number,
    handler: InstanceType<ValueOf<typeof Gestures>>
  ) {
    if (handlerTag in gestures)
      throw new Error(`Handler with tag ${handlerTag} already exists`);

    gestures[handlerTag] = handler;
    gestures[handlerTag].setTag(handlerTag);
  }

  static dropGestureHandler(handlerTag: number) {
    if (!(handlerTag in gestures)) return;

    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete gestures[handlerTag];
  }

  static getNodes() {
    return { ...gestures };
  }
}
