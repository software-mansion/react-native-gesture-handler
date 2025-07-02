import { GestureType } from '../gesture';
import { AttachedGestureState } from './types';

// Checks whether the gesture should be reattached to the view, this will happen when:
// - The number of gestures in the preparedGesture is different than the number of gestures in the gesture
// - The handlerName is different in any of the gestures
// - At least one of the gestures changed the thread it runs on
export function needsToReattach(
  preparedGesture: AttachedGestureState,
  newGestures: GestureType[]
) {
  if (newGestures.length !== preparedGesture.attachedGestures.length) {
    return true;
  }
  for (let i = 0; i < newGestures.length; i++) {
    if (
      newGestures[i].handlerName !==
      preparedGesture.attachedGestures[i].handlerName
    ) {
      return true;
    }
  }

  return false;
}
