import { isTestEnv } from '../utils';
import { GestureType } from './gestures/gesture';
import { GestureEvent, HandlerStateChangeEvent } from './gestureHandlerCommon';
import { SingleGesture } from '../v3/types';

export const handlerIDToTag: Record<string, number> = {};

// There were attempts to create types that merge possible HandlerData and Config,
// but ts was not able to infer them properly in many cases, so we use any here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hookGestures = new Map<number, SingleGesture<any, any>>();
const gestures = new Map<number, GestureType>();
const oldHandlers = new Map<number, GestureHandlerCallbacks>();
const testIDs = new Map<string, number>();

export function registerGesture<THandlerData, TConfig>(
  handlerTag: number,
  gesture: SingleGesture<THandlerData, TConfig>
) {
  hookGestures.set(handlerTag, gesture);

  if (isTestEnv() && gesture.config.testId) {
    testIDs.set(gesture.config.testId, handlerTag);
  }
}

export function unregisterGesture(handlerTag: number) {
  const gesture = hookGestures.get(handlerTag);

  if (gesture && isTestEnv() && gesture.config.testId) {
    testIDs.delete(gesture.config.testId);
  }

  hookGestures.delete(handlerTag);
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
