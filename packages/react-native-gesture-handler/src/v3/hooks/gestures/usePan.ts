import { StylusData } from '../../../handlers/gestureHandlerCommon';
import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  GestureEvents,
  SingleGesture,
  SingleGestureName,
} from '../../types';
import { useGesture } from '../useGesture';
import { cloneConfig, remapProps } from '../utils';

type CommonPanGestureProperties = {
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

export type PanGestureProperties = CommonPanGestureProperties & {
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

type PanGestureInternalProperties = CommonPanGestureProperties & {
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
  BaseGestureConfig<PanHandlerData, PanGestureProperties>
>;

type PanGestureInternalConfig = BaseGestureConfig<
  PanHandlerData,
  PanGestureInternalProperties
>;

const PanPropsMapping = new Map<
  keyof PanGestureProperties,
  keyof PanGestureInternalProperties
>([['minDistance', 'minDist']]);

function validatePanConfig(config: PanGestureConfig) {
  if (
    Array.isArray(config.activeOffsetX) &&
    (config.activeOffsetX[0] > 0 || config.activeOffsetX[1] < 0)
  ) {
    throw new Error(
      `First element of activeOffsetX should be negative, and the second one should be positive`
    );
  }

  if (
    Array.isArray(config.activeOffsetY) &&
    (config.activeOffsetY[0] > 0 || config.activeOffsetY[1] < 0)
  ) {
    throw new Error(
      `First element of activeOffsetY should be negative, and the second one should be positive`
    );
  }

  if (
    Array.isArray(config.failOffsetX) &&
    (config.failOffsetX[0] > 0 || config.failOffsetX[1] < 0)
  ) {
    throw new Error(
      `First element of failOffsetX should be negative, and the second one should be positive`
    );
  }

  if (
    Array.isArray(config.failOffsetY) &&
    (config.failOffsetY[0] > 0 || config.failOffsetY[1] < 0)
  ) {
    throw new Error(
      `First element of failOffsetY should be negative, and the second one should be positive`
    );
  }

  if (config.minDistance && (config.failOffsetX || config.failOffsetY)) {
    throw new Error(
      `It is not supported to use minDistance with failOffsetX or failOffsetY, use activeOffsetX and activeOffsetY instead`
    );
  }

  if (config.minDistance && (config.activeOffsetX || config.activeOffsetY)) {
    throw new Error(
      `It is not supported to use minDistance with activeOffsetX or activeOffsetY`
    );
  }
}

function transformPanProps(
  config: PanGestureConfig & PanGestureInternalConfig
) {
  if (config.activeOffsetX !== undefined) {
    if (Array.isArray(config.activeOffsetX)) {
      config.activeOffsetXStart = config.activeOffsetX[0];
      config.activeOffsetXEnd = config.activeOffsetX[1];
    } else if (config.activeOffsetX < 0) {
      config.activeOffsetXStart = config.activeOffsetX;
    } else {
      config.activeOffsetXEnd = config.activeOffsetX;
    }

    delete config.activeOffsetX;
  }

  if (config.activeOffsetY !== undefined) {
    if (Array.isArray(config.activeOffsetY)) {
      config.activeOffsetYStart = config.activeOffsetY[0];
      config.activeOffsetYEnd = config.activeOffsetY[1];
    } else if (config.activeOffsetY < 0) {
      config.activeOffsetYStart = config.activeOffsetY;
    } else {
      config.activeOffsetYEnd = config.activeOffsetY;
    }

    delete config.activeOffsetY;
  }

  if (config.failOffsetX !== undefined) {
    if (Array.isArray(config.failOffsetX)) {
      config.failOffsetXStart = config.failOffsetX[0];
      config.failOffsetXEnd = config.failOffsetX[1];
    } else if (config.failOffsetX < 0) {
      config.failOffsetXStart = config.failOffsetX;
    } else {
      config.failOffsetXEnd = config.failOffsetX;
    }

    delete config.failOffsetX;
  }

  if (config.failOffsetY !== undefined) {
    if (Array.isArray(config.failOffsetY)) {
      config.failOffsetYStart = config.failOffsetY[0];
      config.failOffsetYEnd = config.failOffsetY[1];
    } else if (config.failOffsetY < 0) {
      config.failOffsetYStart = config.failOffsetY;
    } else {
      config.failOffsetYEnd = config.failOffsetY;
    }

    delete config.failOffsetY;
  }
}

export function usePan(config: PanGestureConfig) {
  if (__DEV__) {
    validatePanConfig(config);
  }

  const panConfig = cloneConfig<PanHandlerData, PanGestureInternalProperties>(
    config
  );

  remapProps<PanGestureConfig, PanGestureInternalConfig>(
    panConfig,
    PanPropsMapping
  );

  transformPanProps(panConfig);

  return useGesture<PanHandlerData, PanGestureInternalProperties>(
    SingleGestureName.Pan,
    panConfig
  );
}

export type PanGestureEvent = GestureEvents<PanHandlerData>;
export type PanGesture = SingleGesture<PanHandlerData, PanGestureProperties>;
