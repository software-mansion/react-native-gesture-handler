import { GestureType } from '../gesture';
import { AttachedGestureState } from './types';

// Checks whether the gesture should be reattached to the view, this will happen when:
// - The number of gestures in the preparedGesture is different than the number of gestures in the gesture
// - The handlerName is different in any of the gestures
// - At least one of the gestures changed the thread it runs on
export function needsToReattach(
  preparedGesture: AttachedGestureState,
  gesture: GestureType[]
) {
  if (gesture.length !== preparedGesture.gesturesToAttach.length) {
    return true;
  }
  for (let i = 0; i < gesture.length; i++) {
    if (
      gesture[i].handlerName !==
        preparedGesture.gesturesToAttach[i].handlerName ||
      gesture[i].shouldUseReanimated !==
        preparedGesture.gesturesToAttach[i].shouldUseReanimated
    ) {
      return true;
    }
  }

  return false;
}
