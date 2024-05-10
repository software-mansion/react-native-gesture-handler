import { GestureType } from '../gesture';
import { AttachedGestureState } from './types';

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
