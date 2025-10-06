import { GestureHandlerEvent } from 'react-native-reanimated/lib/typescript/hook';
import { StylusData } from '../../../handlers/gestureHandlerCommon';
import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGesture,
  HandlerData,
  SingleGestureName,
  WithSharedValue,
} from '../../types';
import { useGesture } from '../useGesture';
import {
  getChangeEventCalculator,
  maybeUnpackValue,
  remapProps,
  cloneConfig,
} from '../utils';

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

type OffsetProps = {
  /**
   * Range along X axis (in points) where fingers travels without activation of
   * handler. Moving outside of this range implies activation of handler. Range
   * can be given as an array or a single number. If range is set as an array,
   * first value must be lower or equal to 0, a the second one higher or equal
   * to 0. If only one number `p` is given a range of `(-inf, p)` will be used
   * if `p` is higher or equal to 0 and `(-p, inf)` otherwise.
   */
  activeOffsetY?: number | [number, number];

  /**
   * Range along X axis (in points) where fingers travels without activation of
   * handler. Moving outside of this range implies activation of handler. Range
   * can be given as an array or a single number. If range is set as an array,
   * first value must be lower or equal to 0, a the second one higher or equal
   * to 0. If only one number `p` is given a range of `(-inf, p)` will be used
   * if `p` is higher or equal to 0 and `(-p, inf)` otherwise.
   */
  activeOffsetX?: number | [number, number];

  /**
   * When the finger moves outside this range (in points) along Y axis and
   * handler hasn't yet activated it will fail recognizing the gesture. Range
   * can be given as an array or a single number. If range is set as an array,
   * first value must be lower or equal to 0, a the second one higher or equal
   * to 0. If only one number `p` is given a range of `(-inf, p)` will be used
   * if `p` is higher or equal to 0 and `(-p, inf)` otherwise.
   */
  failOffsetY?: number | [number, number];

  /**
   * When the finger moves outside this range (in points) along X axis and
   * handler hasn't yet activated it will fail recognizing the gesture. Range
   * can be given as an array or a single number. If range is set as an array,
   * first value must be lower or equal to 0, a the second one higher or equal
   * to 0. If only one number `p` is given a range of `(-inf, p)` will be used
   * if `p` is higher or equal to 0 and `(-p, inf)` otherwise.
   */
  failOffsetX?: number | [number, number];
};

export type PanGestureProperties = WithSharedValue<
  CommonPanGestureProperties & OffsetProps
>;

type PanGestureInternalProperties = WithSharedValue<
  CommonPanGestureProperties & {
    minDist?: number;
    activeOffsetYStart?: number;
    activeOffsetYEnd?: number;
    activeOffsetXStart?: number;
    activeOffsetXEnd?: number;
    failOffsetYStart?: number;
    failOffsetYEnd?: number;
    failOffsetXStart?: number;
    failOffsetXEnd?: number;
  }
>;

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
  changeX: number;
  changeY: number;
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

function validateOffsetsArray(
  offsets: WithSharedValue<number | [number, number] | undefined>,
  propName: string
) {
  if (offsets === undefined) {
    return;
  }

  if (!Array.isArray(offsets)) {
    return;
  }

  const offsetStart = maybeUnpackValue(offsets[0]);
  const offsetEnd = maybeUnpackValue(offsets[1]);

  if (offsetStart > 0 || offsetEnd < 0) {
    throw new Error(
      `First element of ${propName} should be negative, and the second one should be positive`
    );
  }
}

function validatePanConfig(config: PanGestureConfig) {
  validateOffsetsArray(config.activeOffsetX, 'activeOffsetX');
  validateOffsetsArray(config.activeOffsetY, 'activeOffsetY');
  validateOffsetsArray(config.failOffsetX, 'failOffsetX');
  validateOffsetsArray(config.failOffsetY, 'failOffsetY');

  if (
    config.minDistance !== undefined &&
    (config.failOffsetX !== undefined || config.failOffsetY !== undefined)
  ) {
    throw new Error(
      `It is not supported to use minDistance with failOffsetX or failOffsetY, use activeOffsetX and activeOffsetY instead`
    );
  }

  if (
    config.minDistance !== undefined &&
    (config.activeOffsetX !== undefined || config.activeOffsetY !== undefined)
  ) {
    throw new Error(
      `It is not supported to use minDistance with activeOffsetX or activeOffsetY`
    );
  }
}

function transformOffsetProp(
  config: PanGestureConfig & PanGestureInternalConfig,
  propName: keyof OffsetProps
) {
  const propValue = config[propName];

  if (propValue === undefined) {
    return;
  }

  if (Array.isArray(propValue)) {
    config[`${propName}Start`] = propValue[0];
    config[`${propName}End`] = propValue[1];
  } else {
    const offsetValue = maybeUnpackValue(propValue);

    if (offsetValue < 0) {
      config[`${propName}Start`] = propValue;
    } else {
      config[`${propName}End`] = propValue;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete config[propName];
}

function transformPanProps(
  config: PanGestureConfig & PanGestureInternalConfig
) {
  transformOffsetProp(config, 'activeOffsetY');
  transformOffsetProp(config, 'failOffsetX');
  transformOffsetProp(config, 'failOffsetY');
  transformOffsetProp(config, 'activeOffsetX');
}

function diffCalculator(
  current: HandlerData<PanHandlerData>,
  previous: HandlerData<PanHandlerData> | null
) {
  'worklet';
  return {
    changeX: previous
      ? current.translationX - previous.translationX
      : current.translationX,
    changeY: previous
      ? current.translationY - previous.translationY
      : current.translationY,
  };
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

  panConfig.changeEventCalculator = getChangeEventCalculator(diffCalculator);

  return useGesture<PanHandlerData, PanGestureInternalProperties>(
    SingleGestureName.Pan,
    panConfig
  );
}

export type PanGestureEvent = GestureHandlerEvent<PanHandlerData>;
export type PanGesture = SingleGesture<PanHandlerData, PanGestureProperties>;
