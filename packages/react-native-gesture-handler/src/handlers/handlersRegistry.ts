import { isTestEnv } from '../utils';
import type { AnySingleGesture } from '../v3/hooks/gestures/singleGestureUnion';
import type { SingleGesture } from '../v3/types';
import type {
  GestureEvent,
  HandlerStateChangeEvent,
} from './gestureHandlerCommon';
import type { GestureType } from './gestures/gesture';

export const handlerIDToTag: Record<string, number> = {};

// Stored as the discriminated union of concrete v3 gestures so lookups by
// test ID can narrow on the `type` field.
const hookGestures = new Map<number, AnySingleGesture>();
const gestures = new Map<number, GestureType>();
const oldHandlers = new Map<number, GestureHandlerCallbacks>();
const testIDs = new Map<string, number>();

export function registerGesture<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  handlerTag: number,
  gesture: SingleGesture<TConfig, THandlerData, TExtendedHandlerData>
) {
  if (isTestEnv() && gesture.config.testID) {
    // The generic parameters cannot be correlated with the union members
    // here, but every gesture created by the v3 hooks is a union member.
    hookGestures.set(handlerTag, gesture as unknown as AnySingleGesture);
    testIDs.set(gesture.config.testID, handlerTag);
  }
}

export function unregisterGesture(handlerTag: number) {
  const gesture = hookGestures.get(handlerTag);

  if (gesture && isTestEnv() && gesture.config.testID) {
    testIDs.delete(gesture.config.testID);
    hookGestures.delete(handlerTag);
  }
}

export function registerHandler(
  handlerTag: number,
  handler: GestureType,
  testID?: string
) {
  gestures.set(handlerTag, handler);
  if (isTestEnv() && testID) {
    testIDs.set(testID, handlerTag);
  }
}

export function registerOldGestureHandler(
  handlerTag: number,
  handler: GestureHandlerCallbacks
) {
  oldHandlers.set(handlerTag, handler);
}

export function unregisterOldGestureHandler(handlerTag: number) {
  oldHandlers.delete(handlerTag);
}

export function unregisterHandler(handlerTag: number, testID?: string) {
  gestures.delete(handlerTag);
  if (isTestEnv() && testID) {
    testIDs.delete(testID);
  }
}

export function findHandler(handlerTag: number) {
  return gestures.get(handlerTag);
}

export function findGesture(handlerTag: number) {
  return hookGestures.get(handlerTag);
}

export function findOldGestureHandler(handlerTag: number) {
  return oldHandlers.get(handlerTag);
}

export function findHandlerByTestID(testID: string) {
  const handlerTag = testIDs.get(testID);
  if (handlerTag !== undefined) {
    return findHandler(handlerTag) ?? findGesture(handlerTag) ?? null;
  }
  return null;
}

export interface GestureHandlerCallbacks {
  onGestureEvent: (event: GestureEvent<any>) => void;
  onGestureStateChange: (event: HandlerStateChangeEvent<any>) => void;
}
