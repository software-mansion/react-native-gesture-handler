import { StylusData } from '../../../handlers/gestureHandlerCommon';
import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGestureName,
} from '../../types';
import { useGesture } from '../useGesture';
import { remapProps } from '../utils';

type CommonPanGestureProps = {
  /**
   * Minimum distance the finger (or multiple finger) need to travel before the
   * handler activates. Expressed in points.
   */
  minDistance?: number;

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
};

export type PanGestureProps = CommonPanGestureProps & {
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
};

type PanGestureInternalProps = CommonPanGestureProps & {
  minDist?: number;
  activeOffsetYStart?: number;
  activeOffsetYEnd?: number;
  activeOffsetXStart?: number;
  activeOffsetXEnd?: number;
  failOffsetYStart?: number;
  failOffsetYEnd?: number;
  failOffsetXStart?: number;
  failOffsetXEnd?: number;
};

type PanHandlerData = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
  translationX: number;
  translationY: number;
  velocityX: number;
  velocityY: number;
  stylusData: StylusData;
};

export type PanGestureConfig = ExcludeInternalConfigProps<
  BaseGestureConfig<PanHandlerData, PanGestureProps>
>;

type PanGestureInternalConfig = BaseGestureConfig<
  PanHandlerData,
  PanGestureInternalProps
>;

const PanPropsMapping = new Map<
  keyof PanGestureProps,
  keyof PanGestureInternalProps
>([['minDistance', 'minDist']]);

export function usePan(config: PanGestureConfig) {
  const panConfig = remapProps<PanGestureConfig, PanGestureInternalConfig>(
    config,
    PanPropsMapping
  );

  return useGesture<PanHandlerData, PanGestureInternalProps>(
    SingleGestureName.Pan,
    panConfig
  );
}
