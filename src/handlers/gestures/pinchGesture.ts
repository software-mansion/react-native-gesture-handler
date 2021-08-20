import { UnwrappedGestureHandlerEvent } from '../gestureHandlerCommon';
import { BaseGesture } from './gesture';
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
    //@ts-ignore if callback is a worklet, the property will be available, if not then the check will return false
    this.handlers.isOnUpdateWorklet = callback.__workletHash != null;
    return this;
  }
}
