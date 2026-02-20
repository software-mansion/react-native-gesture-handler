import {
  HandlerData,
  SingleGestureName,
  WithSharedValue,
} from '../../../types';
import { useGesture } from '../../useGesture';
import {
  getChangeEventCalculator,
  maybeUnpackValue,
  useClonedAndRemappedConfig,
} from '../../utils';
import {
  OffsetProps,
  PanExtendedHandlerData,
  PanGesture,
  PanGestureConfig,
  PanGestureInternalConfig,
  PanGestureInternalProperties,
  PanGestureProperties,
  PanHandlerData,
} from './PanTypes';

const PanPropsMapping = new Map<
  keyof PanGestureProperties,
  keyof PanGestureInternalProperties
>([
  ['minDistance', 'minDist'],
  ['averageTouches', 'avgTouches'],
]);

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

  const offsetStart = maybeUnpackValue<number>(offsets[0]);
  const offsetEnd = maybeUnpackValue<number>(offsets[1]);

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
    const offsetValue = maybeUnpackValue<number>(propValue);

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
  current: HandlerData<PanExtendedHandlerData>,
  previous: HandlerData<PanExtendedHandlerData> | null
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
    PanGestureProperties,
    PanHandlerData,
    PanGestureInternalProperties,
    PanExtendedHandlerData
  >(config, PanPropsMapping, transformPanProps);

  return useGesture<
    PanGestureInternalProperties,
    PanHandlerData,
    PanExtendedHandlerData
  >(SingleGestureName.Pan, panConfig);
}
