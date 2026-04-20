import type { GestureUpdateEvent } from '../gestureHandlerCommon';
import type { RotationGestureHandlerEventPayload } from '../GestureHandlerEventPayload';
import { ContinousBaseGesture } from './gesture';

type RotationGestureChangeEventPayload = {
  rotationChange: number;
};

function changeEventCalculator(
  current: GestureUpdateEvent<RotationGestureHandlerEventPayload>,
  previous?: GestureUpdateEvent<RotationGestureHandlerEventPayload>
) {
  'worklet';
  let changePayload: RotationGestureChangeEventPayload;
  if (previous === undefined) {
    changePayload = {
      rotationChange: current.rotation,
    };
  } else {
    changePayload = {
      rotationChange: current.rotation - previous.rotation,
    };
  }

  return { ...current, ...changePayload };
}

/**
 * @deprecated Rotation Gesture is deprecated and will be removed in the future. Please use `useRotationGesture` instead.
 */
export class RotationGesture extends ContinousBaseGesture<
  RotationGestureHandlerEventPayload,
  RotationGestureChangeEventPayload
> {
  constructor() {
    super();

    this.handlerName = 'RotationGestureHandler';
  }

  override onChange(
    callback: (
      event: GestureUpdateEvent<
        RotationGestureHandlerEventPayload & RotationGestureChangeEventPayload
      >
    ) => void
  ) {
    // @ts-ignore TS being overprotective, RotationGestureHandlerEventPayload is Record
    this.handlers.changeEventCalculator = changeEventCalculator;
    return super.onChange(callback);
  }
}

/**
 * @deprecated Rotation Gesture is deprecated and will be removed in the future. Please use `useRotationGesture` instead.
 */
export type RotationGestureType = InstanceType<typeof RotationGesture>;
