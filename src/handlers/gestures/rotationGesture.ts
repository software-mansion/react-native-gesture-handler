import { ContinousBaseGesture } from './gesture';
import { RotationGestureHandlerEventPayload } from '../RotationGestureHandler';

export class RotationGesture extends ContinousBaseGesture<RotationGestureHandlerEventPayload> {
  constructor() {
    super();

    this.handlerName = 'RotationGestureHandler';
  }
}

export type RotationGestureType = InstanceType<typeof RotationGesture>;
