import type { GestureUpdateEvent } from '../gestureHandlerCommon';
import type { PinchGestureHandlerEventPayload } from '../GestureHandlerEventPayload';
import { ContinousBaseGesture } from './gesture';

/**
 * @deprecated Pinch Gesture is deprecated and will be removed in the future. Please use `usePinchGesture` instead.
 */
export type PinchGestureChangeEventPayload = {
  scaleChange: number;
};

function changeEventCalculator(
  current: GestureUpdateEvent<PinchGestureHandlerEventPayload>,
  previous?: GestureUpdateEvent<PinchGestureHandlerEventPayload>
) {
  'worklet';
  let changePayload: PinchGestureChangeEventPayload;
  if (previous === undefined) {
    changePayload = {
      scaleChange: current.scale,
    };
  } else {
    changePayload = {
      scaleChange: current.scale / previous.scale,
    };
  }

  return { ...current, ...changePayload };
}

/**
 * @deprecated Pinch Gesture is deprecated and will be removed in the future. Please use `usePinchGesture` instead.
 */
export class PinchGesture extends ContinousBaseGesture<
  PinchGestureHandlerEventPayload,
  PinchGestureChangeEventPayload
> {
  constructor() {
    super();

    this.handlerName = 'PinchGestureHandler';
  }

  override onChange(
    callback: (
      event: GestureUpdateEvent<
        PinchGestureHandlerEventPayload & PinchGestureChangeEventPayload
      >
    ) => void
  ) {
    // @ts-ignore TS being overprotective, PinchGestureHandlerEventPayload is Record
    this.handlers.changeEventCalculator = changeEventCalculator;
    return super.onChange(callback);
  }
}

/**
 * @deprecated Pinch Gesture is deprecated and will be removed in the future. Please use `usePinchGesture` instead.
 */
export type PinchGestureType = InstanceType<typeof PinchGesture>;
