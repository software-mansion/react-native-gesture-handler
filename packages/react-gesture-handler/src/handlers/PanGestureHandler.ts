import type { PanGestureHandlerEventPayload } from './GestureHandlerEventPayload';
import { BaseGestureHandlerProps } from './gestureHandlerCommon';

export const panGestureHandlerProps = [
  'activeOffsetY',
  'activeOffsetX',
  'failOffsetY',
  'failOffsetX',
  'minDist',
  'minVelocity',
  'minVelocityX',
  'minVelocityY',
  'minPointers',
  'maxPointers',
  'avgTouches',
  'enableTrackpadTwoFingerGesture',
  'activateAfterLongPress',
] as const;

export const panGestureHandlerCustomNativeProps = [
  'activeOffsetYStart',
  'activeOffsetYEnd',
  'activeOffsetXStart',
  'activeOffsetXEnd',
  'failOffsetYStart',
  'failOffsetYEnd',
  'failOffsetXStart',
  'failOffsetXEnd',
] as const;

interface CommonPanProperties {
  /**
   * Minimum distance the finger (or multiple finger) need to travel before the
   * handler activates. Expressed in points.
   */
  minDist?: number;

  /**
   * Android only.
   */
  avgTouches?: boolean;

  /**
   * Enables two-finger gestures on supported devices, for example iPads with
   * trackpads. If not enabled the gesture will require click + drag, with
   * enableTrackpadTwoFingerGesture swiping with two fingers will also trigger
   * the gesture.
   */
  enableTrackpadTwoFingerGesture?: boolean;

  /**
   * A number of fingers that is required to be placed before handler can
   * activate. Should be a higher or equal to 0 integer.
   */
  minPointers?: number;

  /**
   * When the given number of fingers is placed on the screen and handler hasn't
   * yet activated it will fail recognizing the gesture. Should be a higher or
   * equal to 0 integer.
   */
  maxPointers?: number;

  minVelocity?: number;
  minVelocityX?: number;
  minVelocityY?: number;
  activateAfterLongPress?: number;
}

export interface PanGestureConfig extends CommonPanProperties {
  activeOffsetYStart?: number;
  activeOffsetYEnd?: number;
  activeOffsetXStart?: number;
  activeOffsetXEnd?: number;
  failOffsetYStart?: number;
  failOffsetYEnd?: number;
  failOffsetXStart?: number;
  failOffsetXEnd?: number;
}

/**
 * @deprecated PanGestureHandler will be removed in the future version of Gesture Handler. Use `Gesture.Pan()` instead.
 */
export interface PanGestureHandlerProps
  extends BaseGestureHandlerProps<PanGestureHandlerEventPayload>,
    CommonPanProperties {
  /**
   * Range along X axis (in points) where fingers travels without activation of
   * handler. Moving outside of this range implies activation of handler. Range
   * can be given as an array or a single number. If range is set as an array,
   * first value must be lower or equal to 0, a the second one higher or equal
   * to 0. If only one number `p` is given a range of `(-inf, p)` will be used
   * if `p` is higher or equal to 0 and `(-p, inf)` otherwise.
   */
  activeOffsetY?:
    | number
    | [activeOffsetYStart: number, activeOffsetYEnd: number];

  /**
   * Range along X axis (in points) where fingers travels without activation of
   * handler. Moving outside of this range implies activation of handler. Range
   * can be given as an array or a single number. If range is set as an array,
   * first value must be lower or equal to 0, a the second one higher or equal
   * to 0. If only one number `p` is given a range of `(-inf, p)` will be used
   * if `p` is higher or equal to 0 and `(-p, inf)` otherwise.
   */
  activeOffsetX?:
    | number
    | [activeOffsetXStart: number, activeOffsetXEnd: number];

  /**
   * When the finger moves outside this range (in points) along Y axis and
   * handler hasn't yet activated it will fail recognizing the gesture. Range
   * can be given as an array or a single number. If range is set as an array,
   * first value must be lower or equal to 0, a the second one higher or equal
   * to 0. If only one number `p` is given a range of `(-inf, p)` will be used
   * if `p` is higher or equal to 0 and `(-p, inf)` otherwise.
   */
  failOffsetY?: number | [failOffsetYStart: number, failOffsetYEnd: number];

  /**
   * When the finger moves outside this range (in points) along X axis and
   * handler hasn't yet activated it will fail recognizing the gesture. Range
   * can be given as an array or a single number. If range is set as an array,
   * first value must be lower or equal to 0, a the second one higher or equal
   * to 0. If only one number `p` is given a range of `(-inf, p)` will be used
   * if `p` is higher or equal to 0 and `(-p, inf)` otherwise.
   */
  failOffsetX?: number | [failOffsetXStart: number, failOffsetXEnd: number];
}

export const panHandlerName = 'PanGestureHandler';
