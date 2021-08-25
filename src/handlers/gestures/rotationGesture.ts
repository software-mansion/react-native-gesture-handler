import { UnwrappedGestureHandlerEvent } from '../gestureHandlerCommon';
import { BaseGesture, CALLBACK_TYPE } from './gesture';
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
    this.handlers.isWorklet[CALLBACK_TYPE.UPDATE] =
      //@ts-ignore if callback is a worklet, the property will be available, if not then the check will return false
      callback.__workletHash != null;
    return this;
  }
}
