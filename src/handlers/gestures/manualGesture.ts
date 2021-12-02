import { ContinousBaseGesture } from './gesture';

export class ManualGesture extends ContinousBaseGesture<Record<string, never>> {
  constructor() {
    super();

    this.handlerName = 'ManualGestureHandler';
  }
}

export type ManualGestureType = InstanceType<typeof ManualGesture>;
