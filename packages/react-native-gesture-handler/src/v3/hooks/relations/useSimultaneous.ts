import {
  ComposedGesture,
  ComposedGestureType,
  NativeGesture,
} from '../../types';
import { useComposedGesture } from './useComposedGesture';
import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';

export function useSimultaneous(
  ...gestures: (NativeGesture | ComposedGesture)[]
) {
  const composedGesture = useComposedGesture(...gestures);

  const reanimatedComposedStateChangeEvent =
    Reanimated?.useComposedEventHandler(
      gestures.map(
        (gesture) => gesture.gestureEvents.onGestureHandlerStateChange || null
      )
    );

  const reanimatedComposedUpdateEvent = Reanimated?.useComposedEventHandler(
    gestures.map(
      (gesture) => gesture.gestureEvents.onGestureHandlerEvent || null
    )
  );

  const reanimatedComposedTouchEvent = Reanimated?.useComposedEventHandler(
    gestures.map(
      (gesture) => gesture.gestureEvents.onGestureHandlerTouchEvent || null
    )
  );

  // If `shouldUseReanimated` is true, then Reanimated has to be installed,
  // therefore those non-null assertions are safe.
  if (composedGesture.config.shouldUseReanimated) {
    composedGesture.gestureEvents.onGestureHandlerStateChange =
      reanimatedComposedStateChangeEvent!;
    composedGesture.gestureEvents.onGestureHandlerEvent =
      reanimatedComposedUpdateEvent!;
    composedGesture.gestureEvents.onGestureHandlerTouchEvent =
      reanimatedComposedTouchEvent!;
  }

  composedGesture.type = ComposedGestureType.Simultaneous;

  return composedGesture;
}
