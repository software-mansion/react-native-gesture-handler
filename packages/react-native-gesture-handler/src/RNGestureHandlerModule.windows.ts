import type React from 'react';

import type { ActionType } from './ActionType';
import type { Gestures as WebGestures } from './web/Gestures';
import type { Config } from './web/interfaces';

export const Gestures = {
  NativeViewGestureHandler: undefined,
  PanGestureHandler: undefined,
  TapGestureHandler: undefined,
  LongPressGestureHandler: undefined,
  PinchGestureHandler: undefined,
  RotationGestureHandler: undefined,
  FlingGestureHandler: undefined,
  ManualGestureHandler: undefined,
} satisfies Partial<Record<keyof typeof WebGestures, undefined>>;

export default {
  createGestureHandler<T>(
    _handlerName: keyof typeof Gestures,
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
