import { GestureType } from './gestures/gesture';

export const handlerIDToTag: Record<string, number> = {};
const handlers = new Map<number, GestureType>();

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

// store all gestures and handlers for Jest
const jestHandlers = new Map<number, any>();

export function registerJestHandler(handlerTag: number, handler: any) {
  jestHandlers.set(handlerTag, handler);
}

export function unregisterJestHandler(handlerTag: number) {
  jestHandlers.delete(handlerTag);
}

export function findJestHandler(handlerTag: number) {
  return jestHandlers.get(handlerTag);
}
