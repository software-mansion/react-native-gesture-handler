import { UnwrappedGestureHandlerEvent } from '../gestureHandlerCommon';
import { BaseGesture } from './gesture';
import { RotationGestureHandlerEventPayload } from '../RotationGestureHandler';

export class RotationGesture extends BaseGesture<RotationGestureHandlerEventPayload> {
  constructor() {
    super();

    this.handlerName = 'RotationGestureHandler';
  }

  onUpdate(
    callback: (
      event: UnwrappedGestureHandlerEvent<RotationGestureHandlerEventPayload>
    ) => void
  ) {
    this.handlers.onUpdate = callback;
    //@ts-ignore if callback is a worklet, the property will be available, if not then the check will return false
    this.handlers.isOnUpdateWorklet = callback.__workletHash != null;
    return this;
  }
}
