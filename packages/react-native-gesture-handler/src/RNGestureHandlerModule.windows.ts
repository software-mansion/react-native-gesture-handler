import React from 'react';

import { ActionType } from './ActionType';

// GestureHandlers
import PanGestureHandler from './web/handlers/PanGestureHandler';
import TapGestureHandler from './web/handlers/TapGestureHandler';
import LongPressGestureHandler from './web/handlers/LongPressGestureHandler';
import PinchGestureHandler from './web/handlers/PinchGestureHandler';
import RotationGestureHandler from './web/handlers/RotationGestureHandler';
import FlingGestureHandler from './web/handlers/FlingGestureHandler';
import NativeViewGestureHandler from './web/handlers/NativeViewGestureHandler';
import ManualGestureHandler from './web/handlers/ManualGestureHandler';
import { Config } from './web/interfaces';

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
  handleSetJSResponder(_tag: number, _blockNativeResponder: boolean) {
    // NO-OP
  },
  handleClearJSResponder() {
    // NO-OP
  },
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
  updateGestureHandler(_handlerTag: number, _newConfig: Config) {
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
