import { Directions } from '../../Directions';
import { BaseGesture, BaseGestureConfig } from './gesture';
import {
  FlingGestureConfig,
  FlingGestureHandlerEventPayload,
} from '../FlingGestureHandler';

export class FlingGesture extends BaseGesture<FlingGestureHandlerEventPayload> {
  public config: BaseGestureConfig & FlingGestureConfig = {};

  constructor() {
    super();

    this.handlerName = 'FlingGestureHandler';
  }

  setNumberOfPointers(pointers: number) {
    this.config.numberOfPointers = pointers;
    return this;
  }

  setDirection(direction: Directions) {
    this.config.direction = direction;
    return this;
  }
}
