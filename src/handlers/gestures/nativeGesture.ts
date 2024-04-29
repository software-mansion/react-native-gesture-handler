import { BaseGestureConfig, BaseGesture } from './gesture';
import {
  NativeViewGestureConfig,
  NativeViewGestureHandlerPayload,
} from '../NativeViewGestureHandler';

export class NativeGesture extends BaseGesture<NativeViewGestureHandlerPayload> {
  public config: BaseGestureConfig & NativeViewGestureConfig = {};

  constructor() {
    super();

    this.handlerName = 'NativeViewGestureHandler';
  }

  /**
   * When true, underlying handler will activate unconditionally when in `BEGAN` or `UNDETERMINED` state.
   * @param value
   */
  shouldActivateOnStart(value: boolean) {
    this.config.shouldActivateOnStart = value;
    return this;
  }

  /**
   * When true, cancels all other gesture handlers when this `NativeViewGestureHandler` receives an `ACTIVE` state event.
   * @param value
   */
  disallowInterruption(value: boolean) {
    this.config.disallowInterruption = value;
    return this;
  }
}

export type NativeGestureType = InstanceType<typeof NativeGesture>;
