import type { SingleGestureName } from '@swmansion/gesture-handler-core';
import type { Config } from '@swmansion/gesture-handler-dom-engine/src/interfaces';
import type React from 'react';

import type { ActionType } from './ActionType';

// This module exists solely so react-native-windows apps compile and run
// (all methods are graceful no-ops; there is no Windows gesture support).
// The former engine-class re-export was vestigial (zero consumers); the
// symbol is kept as an empty frozen object so deep importers keep compiling,
// and the module no longer loads the DOM engine at runtime.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Gestures: Readonly<Record<string, any>> = Object.freeze({});

export default {
  createGestureHandler<T>(
    _handlerName: SingleGestureName,
    _handlerTag: number,
    _config: T
  ) {
    // NO-OP
  },
  attachGestureHandler(
    _handlerTag: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _newView: any,
    _actionType: ActionType,
    _propsRef: React.RefObject<unknown>
  ) {
    // NO-OP
  },
  setGestureHandlerConfig(_handlerTag: number, _newConfig: Config) {
    // NO-OP
  },
  updateGestureHandlerConfig(_handlerTag: number, _newConfig: Config) {
    // NO-OP
  },
  getGestureHandlerNode(_handlerTag: number) {
    // NO-OP
  },
  dropGestureHandler(_handlerTag: number) {
    // NO-OP
  },
  flushOperations() {
    // NO-OP
  },
};
