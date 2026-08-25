// Deep type import, matching the engine's existing pattern — importing the
// core barrel would pull core's whole program (incl. __DEV__-reading
// modules) into the engine's typecheck.
import type { SingleGestureName } from '@swmansion/gesture-handler-core/src/v3/types/GestureTypes';

import type { Gestures } from './Gestures';

export type GestureHandlerClass = (typeof Gestures)[keyof typeof Gestures];

// Demand-populated handler-class registry: each gesture-hook module registers
// the recognizer class it needs, so a tree-shaken bundle only carries the
// recognizers it imports. The static `Gestures` map remains as the
// register-everything path for consumers without tree-shaking
// (react-native-web under Metro, the generic by-name `useGesture`).
const registry = new Map<SingleGestureName, GestureHandlerClass>();

// Idempotent — safe under dev double-evaluation (StrictMode, HMR).
export function registerHandlerClass(
  name: SingleGestureName,
  handlerClass: GestureHandlerClass
): void {
  registry.set(name, handlerClass);
}

export function getHandlerClass(
  name: SingleGestureName
): GestureHandlerClass | undefined {
  return registry.get(name);
}
