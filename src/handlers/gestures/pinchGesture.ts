import { ContinousBaseGesture } from './gesture';
import { PinchGestureHandlerEventPayload } from '../PinchGestureHandler';

export class PinchGesture extends ContinousBaseGesture<PinchGestureHandlerEventPayload> {
  constructor() {
    super();

    this.handlerName = 'PinchGestureHandler';
  }
}

export type PinchGestureType = InstanceType<typeof PinchGesture>;
