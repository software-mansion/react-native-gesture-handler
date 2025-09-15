import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  GestureUpdateEvent,
  SingleGestureName,
} from '../../types';
import { useGesture } from '../useGesture';
import { cloneConfig } from '../utils';

type PinchGestureProps = {};

type PinchHandlerData = {
  scale: number;
  focalX: number;
  focalY: number;
  velocity: number;
  scaleChange?: number;
};

type PinchGestureInternalConfig = BaseGestureConfig<
  PinchHandlerData,
  PinchGestureProps
>;

export type PinchGestureConfig =
  ExcludeInternalConfigProps<PinchGestureInternalConfig>;

function changeEventCalculator(
  current: GestureUpdateEvent<PinchHandlerData>,
  previous?: GestureUpdateEvent<PinchHandlerData>
): GestureUpdateEvent<PinchHandlerData> {
  'worklet';

  const currentEventData = current.handlerData;
  const previousEventData = previous ? previous.handlerData : null;

  const changePayload = {
    scaleChange: previousEventData
      ? currentEventData.scale / previousEventData.scale
      : currentEventData.scale,
  };

  const resultEvent = { ...current };
  resultEvent.handlerData = { ...currentEventData, ...changePayload };

  return resultEvent;
}

export function usePinch(config: PinchGestureConfig) {
  const pinchConfig = cloneConfig<PinchHandlerData, PinchGestureProps>(config);

  pinchConfig.changeEventCalculator = changeEventCalculator;

  return useGesture(SingleGestureName.Pinch, pinchConfig);
}
