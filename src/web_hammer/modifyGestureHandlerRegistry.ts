import { ValueOf } from '../typeUtils';
import { HammerGestures } from '../web/Gestures';
import { gestures, getHandler } from './NodeManager';

export function createGestureHandler(
  handlerTag: number,
  handler: InstanceType<ValueOf<typeof HammerGestures>>
) {
  if (handlerTag in gestures) {
    throw new Error(`Handler with tag ${handlerTag} already exists`);
  }
  gestures[handlerTag] = handler;
  // @ts-ignore no types for web handlers yet
  gestures[handlerTag].handlerTag = handlerTag;
}

export function dropGestureHandler(handlerTag: number) {
  // Since React 18, there are cases where componentWillUnmount gets called twice in a row
  // so skip this if the tag was already removed.
  if (!(handlerTag in gestures)) {
    return;
  }
  getHandler(handlerTag).destroy();
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete gestures[handlerTag];
}
