import { isJest } from '../jestUtils';
import { GestureType } from './gestures/gesture';

export const handlerIDToTag: Record<string, number> = {};
const handlers = new Map<number, GestureType>();
const testIDs = new Map<string, number>();

let handlerTag = 1;

export function getNextHandlerTag(): number {
  return handlerTag++;
}

export function registerHandler(
  handlerTag: number,
  handler: GestureType,
  testID?: string
) {
  handlers.set(handlerTag, handler);
  if (isJest() && testID) {
    testIDs.set(testID, handlerTag);
  }
}

export function unregisterHandler(handlerTag: number, testID?: string) {
  handlers.delete(handlerTag);
  if (isJest() && testID) {
    testIDs.delete(testID);
  }
}

export function findHandler(handlerTag: number) {
  return handlers.get(handlerTag);
}

export function findHandlerByTestID(testID: string) {
  const handlerTag = testIDs.get(testID);
  if (handlerTag !== undefined) {
    return findHandler(handlerTag) ?? null;
  }
  return null;
}
