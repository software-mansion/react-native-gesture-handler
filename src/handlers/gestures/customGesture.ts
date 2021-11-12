import { ContinousBaseGesture } from './gesture';

export class CustomGesture extends ContinousBaseGesture<Record<string, never>> {
  constructor() {
    super();

    this.handlerName = 'CustomGestureHandler';
  }
}

export type CustomGestureType = InstanceType<typeof CustomGesture>;
