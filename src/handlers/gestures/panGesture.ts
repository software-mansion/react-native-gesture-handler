import { BaseGestureConfig, ContinousBaseGesture } from './gesture';
import { GestureUpdateEvent } from '../gestureHandlerCommon';
import {
  PanGestureConfig,
  PanGestureHandlerEventPayload,
} from '../PanGestureHandler';

export type PanGestureChangeEventPayload = {
  changeX: number;
  changeY: number;
};

function changeEventCalculator(
  current: GestureUpdateEvent<PanGestureHandlerEventPayload>,
  previous?: GestureUpdateEvent<PanGestureHandlerEventPayload>
) {
  'worklet';
  let changePayload: PanGestureChangeEventPayload;
  if (previous === undefined) {
    changePayload = {
      changeX: current.translationX,
      changeY: current.translationY,
    };
  } else {
    changePayload = {
      changeX: current.translationX - previous.translationX,
      changeY: current.translationY - previous.translationY,
    };
  }

  return { ...current, ...changePayload };
}

export class PanGesture extends ContinousBaseGesture<
  PanGestureHandlerEventPayload,
  PanGestureChangeEventPayload
> {
  public config: BaseGestureConfig & PanGestureConfig = {};

  constructor() {
    super();

    this.handlerName = 'PanGestureHandler';
  }

  /**
   * Range along Y axis (in points) where fingers travels without activation of gesture.
   * @param offset
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pan-gesture#activeoffsetyvalue-number--number
   */
  activeOffsetY(
    offset: number | [activeOffsetYStart: number, activeOffsetYEnd: number]
  ) {
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

  /**
   * Range along X axis (in points) where fingers travels without activation of gesture.
   * @param offset
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pan-gesture#activeoffsetxvalue-number--number
   */
  activeOffsetX(
    offset: number | [activeOffsetXStart: number, activeOffsetXEnd: number]
  ) {
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

  /**
   * When the finger moves outside this range (in points) along Y axis and gesture hasn't yet activated it will fail recognizing the gesture.
   * @param offset
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pan-gesture#failoffsetyvalue-number--number
   */
  failOffsetY(
    offset: number | [failOffsetYStart: number, failOffsetYEnd: number]
  ) {
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

  /**
   * When the finger moves outside this range (in points) along X axis and gesture hasn't yet activated it will fail recognizing the gesture.
   * @param offset
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pan-gesture#failoffsetxvalue-number--number
   */
  failOffsetX(
    offset: number | [failOffsetXStart: number, failOffsetXEnd: number]
  ) {
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

  /**
   * A number of fingers that is required to be placed before gesture can activate. Should be a higher or equal to 0 integer.
   * @param minPointers
   */
  minPointers(minPointers: number) {
    this.config.minPointers = minPointers;
    return this;
  }

  /**
   * When the given number of fingers is placed on the screen and gesture hasn't yet activated it will fail recognizing the gesture.
   * Should be a higher or equal to 0 integer.
   * @param maxPointers
   */
  maxPointers(maxPointers: number) {
    this.config.maxPointers = maxPointers;
    return this;
  }

  /**
   * Minimum distance the finger (or multiple finger) need to travel before the gesture activates.
   * Expressed in points.
   * @param distance
   */
  minDistance(distance: number) {
    this.config.minDist = distance;
    return this;
  }

  /**
   * Minimum velocity the finger has to reach in order to activate handler.
   * @param velocity
   */
  minVelocity(velocity: number) {
    this.config.minVelocity = velocity;
    return this;
  }

  /**
   * Minimum velocity along X axis the finger has to reach in order to activate handler.
   * @param velocity
   */
  minVelocityX(velocity: number) {
    this.config.minVelocityX = velocity;
    return this;
  }

  /**
   * Minimum velocity along Y axis the finger has to reach in order to activate handler.
   * @param velocity
   */
  minVelocityY(velocity: number) {
    this.config.minVelocityY = velocity;
    return this;
  }

  /**
   * #### Android only
   * Android, by default, will calculate translation values based on the position of the leading pointer (the first one that was placed on the screen).
   * This modifier allows that behavior to be changed to the one that is default on iOS - the averaged position of all active pointers will be used to calculate the translation values.
   * @param value
   */
  averageTouches(value: boolean) {
    this.config.avgTouches = value;
    return this;
  }

  /**
   * #### iOS only
   * Enables two-finger gestures on supported devices, for example iPads with trackpads.
   * @param value
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pan-gesture/#enabletrackpadtwofingergesturevalue-boolean-ios-only
   */
  enableTrackpadTwoFingerGesture(value: boolean) {
    this.config.enableTrackpadTwoFingerGesture = value;
    return this;
  }

  /**
   * Duration in milliseconds of the LongPress gesture before Pan is allowed to activate.
   * @param duration
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pan-gesture/#activateafterlongpressduration-number
   */
  activateAfterLongPress(duration: number) {
    this.config.activateAfterLongPress = duration;
    return this;
  }

  onChange(
    callback: (
      event: GestureUpdateEvent<
        PanGestureHandlerEventPayload & PanGestureChangeEventPayload
      >
    ) => void
  ) {
    // @ts-ignore TS being overprotective, PanGestureHandlerEventPayload is Record
    this.handlers.changeEventCalculator = changeEventCalculator;
    return super.onChange(callback);
  }
}

export type PanGestureType = InstanceType<typeof PanGesture>;
