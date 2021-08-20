import { UnwrappedGestureHandlerEvent } from '../gestureHandlerCommon';
import { BaseGesture, BaseGestureConfig } from './gesture';
import {
  PanGestureConfig,
  PanGestureHandlerEventPayload,
} from '../PanGestureHandler';

export class PanGesture extends BaseGesture<PanGestureHandlerEventPayload> {
  public config: BaseGestureConfig & PanGestureConfig = {};

  constructor() {
    super();

    this.handlerName = 'PanGestureHandler';
  }

  setOnUpdate(
    callback: (
      event: UnwrappedGestureHandlerEvent<PanGestureHandlerEventPayload>
    ) => void
  ) {
    this.handlers.onUpdate = callback;
    //@ts-ignore if callback is a worklet, the property will be available, if not then the check will return false
    this.handlers.isOnUpdateWorklet = callback.__workletHash != null;
    return this;
  }

  setActiveOffsetY(offset: number | number[]) {
    if (Array.isArray(offset)) {
      this.config.activeOffsetYStart = offset[0];
      this.config.activeOffsetYEnd = offset[1];
    } else if (offset < 0) {
      this.config.activeOffsetYStart = offset;
    } else {
      this.config.activeOffsetYEnd = offset;
    }
    return this;
  }

  setActiveOffsetX(offset: number | number[]) {
    if (Array.isArray(offset)) {
      this.config.activeOffsetXStart = offset[0];
      this.config.activeOffsetXEnd = offset[1];
    } else if (offset < 0) {
      this.config.activeOffsetXStart = offset;
    } else {
      this.config.activeOffsetXEnd = offset;
    }
    return this;
  }

  setFailOffsetY(offset: number | number[]) {
    if (Array.isArray(offset)) {
      this.config.failOffsetYStart = offset[0];
      this.config.failOffsetYEnd = offset[1];
    } else if (offset < 0) {
      this.config.failOffsetYStart = offset;
    } else {
      this.config.failOffsetYEnd = offset;
    }
    return this;
  }

  setFailOffsetX(offset: number | number[]) {
    if (Array.isArray(offset)) {
      this.config.failOffsetXStart = offset[0];
      this.config.failOffsetXEnd = offset[1];
    } else if (offset < 0) {
      this.config.failOffsetXStart = offset;
    } else {
      this.config.failOffsetXEnd = offset;
    }
    return this;
  }

  setMinDistance(distance: number) {
    this.config.minDist = distance;
    return this;
  }

  setAverageTouches(value: boolean) {
    this.config.avgTouches = value;
    return this;
  }

  setEnableTrackpadTwoFingerGesture(value: boolean) {
    this.config.enableTrackpadTwoFingerGesture = value;
    return this;
  }
}
