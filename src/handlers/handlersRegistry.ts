import { GestureType } from './gestures/gesture';
import { ComposedGestureConfiguration } from './gestures/gestureComposition';

export const handlerIDToTag: Record<string, number> = {};
const handlers = new Map<number, GestureType>();
const composedCallbacks: ComposedGestureConfiguration[] = [];

let handlerTag = 1;

export function getNextHandlerTag(): number {
  return handlerTag++;
}

export function registerHandler(handlerTag: number, handler: GestureType) {
  handlers.set(handlerTag, handler);
}

export function unregisterHandler(handlerTag: number) {
  handlers.delete(handlerTag);
}

export function findHandler(handlerTag: number) {
  return handlers.get(handlerTag);
}

export function setComposedGestureCallbacks(
  configurations: ComposedGestureConfiguration[]
) {
  for (const config of configurations) {
    const index = indexOfComposedGestureCallbacks(config);
    if (index === -1) {
      composedCallbacks.push(config);
    } else {
      composedCallbacks[index] = config;
    }
  }
}

export function dropComposedGestureCallbacks(
  configurations: ComposedGestureConfiguration[]
) {
  for (const config of configurations) {
    const index = indexOfComposedGestureCallbacks(config);
    if (index !== -1) {
      composedCallbacks.splice(index, 1);
    }
  }
}

export function getComposedCallbacksForHandler(tag: number) {
  const result = [];

  for (const config of composedCallbacks) {
    if (config.requiredHandlers.includes(tag)) {
      result.push(config);
    }
  }

  return result;
}

function indexOfComposedGestureCallbacks(config: ComposedGestureConfiguration) {
  for (let i = 0; i < composedCallbacks.length; i++) {
    const other = composedCallbacks[i];

    if (other.requiredHandlers.length === config.requiredHandlers.length) {
      let isTheSame = true;
      for (const tag of config.requiredHandlers) {
        if (!other.requiredHandlers.includes(tag)) {
          isTheSame = false;
          break;
        }
      }

      if (isTheSame) {
        return i;
      }
    }
  }

  return -1;
}
