import { UnwrappedGestureHandlerEvent } from '../gestureHandlerCommon';
import { BaseGesture, CALLBACK_TYPE } from './gesture';
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
    this.handlers.isWorklet[CALLBACK_TYPE.UPDATE] =
      //@ts-ignore if callback is a worklet, the property will be available, if not then the check will return false
      callback.__workletHash != null;
    return this;
  }
}
