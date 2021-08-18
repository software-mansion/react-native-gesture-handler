import { UnwrappedGestureHandlerEvent } from '../gestureHandlerCommon';
import { BaseGesture } from './gesture';
import { RotationGestureHandlerEventPayload } from '../RotationGestureHandler';

export class RotationGesture extends BaseGesture<RotationGestureHandlerEventPayload> {
  constructor() {
    super();

    this.handlerName = 'RotationGestureHandler';
  }

  setOnUpdate(
    callback: (
      event: UnwrappedGestureHandlerEvent<RotationGestureHandlerEventPayload>
    ) => void
  ) {
    this.handlers.onUpdate = callback;
    return this;
  }
}
