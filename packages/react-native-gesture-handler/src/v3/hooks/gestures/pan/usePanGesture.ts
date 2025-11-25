import { StylusData } from '../../../../handlers/gestureHandlerCommon';
import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGesture,
  HandlerData,
  SingleGestureName,
  WithSharedValue,
  GestureStateChangeEvent,
  GestureUpdateEvent,
} from '../../../types';
import { useGesture } from '../../useGesture';
import {
  getChangeEventCalculator,
  maybeUnpackValue,
  useClonedAndRemappedConfig,
} from '../../utils';
import {
  OffsetProps,
  PanGestureExternalProperties,
  PanGestureNativeProperties,
} from './PanProperties';

export type PanHandlerData = {
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

export type PanGestureProperties =
  WithSharedValue<PanGestureExternalProperties>;

export type PanGestureInternalProperties =
  WithSharedValue<PanGestureNativeProperties>;

export type PanGestureConfig = ExcludeInternalConfigProps<
  BaseGestureConfig<PanHandlerData, PanGestureProperties>
>;

type PanGestureInternalConfig = BaseGestureConfig<
  PanHandlerData,
  PanGestureInternalProperties
>;

export type PanGestureStateChangeEvent =
  GestureStateChangeEvent<PanHandlerData>;

export type PanGestureUpdateEvent = GestureUpdateEvent<PanHandlerData>;

export type PanGesture = SingleGesture<
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

function transformPanProps(
  config: PanGestureConfig & PanGestureInternalConfig
) {
  transformOffsetProp(config, 'activeOffsetY');
  transformOffsetProp(config, 'failOffsetX');
  transformOffsetProp(config, 'failOffsetY');
  transformOffsetProp(config, 'activeOffsetX');

  config.changeEventCalculator = getChangeEventCalculator(diffCalculator);

  return config;
}

export function usePanGesture(config: PanGestureConfig): PanGesture {
  if (__DEV__) {
    validatePanConfig(config);
  }

  const panConfig = useClonedAndRemappedConfig<
    PanHandlerData,
    PanGestureProperties,
    PanGestureInternalProperties
  >(config, PanPropsMapping, transformPanProps);

  return useGesture<PanHandlerData, PanGestureInternalProperties>(
    SingleGestureName.Pan,
    panConfig
  );
}
