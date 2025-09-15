import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  GestureUpdateEvent,
  SingleGestureName,
} from '../../types';
import { useGesture } from '../useGesture';
import { cloneConfig } from '../utils';

type RotationGestureProps = {};

type RotationHandlerData = {
  rotation: number;
  anchorX: number;
  anchorY: number;
  velocity: number;
  rotationChange?: number;
};

type RotationGestureInternalConfig = BaseGestureConfig<
  RotationHandlerData,
  RotationGestureProps
>;

export type RotationGestureConfig =
  ExcludeInternalConfigProps<RotationGestureInternalConfig>;

function changeEventCalculator(
  current: GestureUpdateEvent<RotationHandlerData>,
  previous?: GestureUpdateEvent<RotationHandlerData>
): GestureUpdateEvent<RotationHandlerData> {
  'worklet';

  const currentEventData = current.handlerData;
  const previousEventData = previous ? previous.handlerData : null;

  const changePayload = {
    rotationChange: previousEventData
      ? currentEventData.rotation - previousEventData.rotation
      : currentEventData.rotation,
  };

  const resultEvent = { ...current };
  resultEvent.handlerData = { ...currentEventData, ...changePayload };

  return resultEvent;
}

export function useRotation(config: RotationGestureConfig) {
  const rotationConfig = cloneConfig<RotationHandlerData, RotationGestureProps>(
    config
  );

  rotationConfig.changeEventCalculator = changeEventCalculator;

  return useGesture(SingleGestureName.Rotation, rotationConfig);
}
