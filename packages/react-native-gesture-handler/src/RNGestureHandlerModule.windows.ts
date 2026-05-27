import type React from 'react';

import type { ActionType } from './ActionType';
import FlingGestureHandler from './web/handlers/FlingGestureHandler';
import LongPressGestureHandler from './web/handlers/LongPressGestureHandler';
import ManualGestureHandler from './web/handlers/ManualGestureHandler';
import NativeViewGestureHandler from './web/handlers/NativeViewGestureHandler';
import PanGestureHandler from './web/handlers/PanGestureHandler';
import PinchGestureHandler from './web/handlers/PinchGestureHandler';
import RotationGestureHandler from './web/handlers/RotationGestureHandler';
import TapGestureHandler from './web/handlers/TapGestureHandler';
import type { Config } from './web/interfaces';

export const Gestures = {
  NativeViewGestureHandler,
  PanGestureHandler,
  TapGestureHandler,
  LongPressGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  FlingGestureHandler,
  ManualGestureHandler,
};

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
