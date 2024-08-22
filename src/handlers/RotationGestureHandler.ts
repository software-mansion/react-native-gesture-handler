import { RotationGestureHandlerEventPayload } from './GestureHandlerEventPayload';
import createHandler from './createHandler';
import {
  BaseGestureHandlerProps,
  baseGestureHandlerProps,
} from './gestureHandlerCommon';

export const rotationGestureHandlerProps = [
  'secondPointerLiftFinishesGesture',
] as const;

export interface RotationGestureConfig {
  /**
   * @Platform Android
   *
   * When `false`, the Handler will not finish when second Pointer Lifts,
   * allowing Gesture to continue when a new second Pointer arrives
   * (on iOS it's the default Behaviour)
   */
  secondPointerLiftFinishesGesture?: boolean;
}

export interface RotationGestureHandlerProps
  extends BaseGestureHandlerProps<RotationGestureHandlerEventPayload>,
    RotationGestureConfig {}

export const rotationHandlerName = 'RotationGestureHandler';

export type RotationGestureHandler = typeof RotationGestureHandler;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
export const RotationGestureHandler = createHandler<
  RotationGestureHandlerProps,
  RotationGestureHandlerEventPayload
>({
  name: rotationHandlerName,
  allowedProps: baseGestureHandlerProps,
  config: {},
});
