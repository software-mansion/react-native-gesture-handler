import { UnwrappedGestureHandlerEvent } from '../gestureHandlerCommon';
import { BaseGesture } from './baseGesture';
import { PinchGestureHandlerEventPayload } from '../PinchGestureHandler';

export class PinchGesture extends BaseGesture<PinchGestureHandlerEventPayload> {
  constructor() {
    super();

    this.handlerName = 'PinchGestureHandler';
  }

  setOnUpdate(
    callback: (
      event: UnwrappedGestureHandlerEvent<PinchGestureHandlerEventPayload>
    ) => void
  ) {
    this.handlers.onUpdate = callback;
    return this;
  }
}
