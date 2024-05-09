import { GestureType } from '../gesture';
import { GestureConfigReference } from './types';

export function needsToReattach(
  preparedGesture: GestureConfigReference,
  gesture: GestureType[]
) {
  if (gesture.length !== preparedGesture.config.length) {
    return true;
  }
  for (let i = 0; i < gesture.length; i++) {
    if (
      gesture[i].handlerName !== preparedGesture.config[i].handlerName ||
      gesture[i].shouldUseReanimated !==
        preparedGesture.config[i].shouldUseReanimated
    ) {
      return true;
    }
  }

  return false;
}
