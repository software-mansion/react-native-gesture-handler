// Gesture Handlers
import PanGestureHandler from './handlers/PanGestureHandler';
import TapGestureHandler from './handlers/TapGestureHandler';
import LongPressGestureHandler from './handlers/LongPressGestureHandler';
import PinchGestureHandler from './handlers/PinchGestureHandler';
import RotationGestureHandler from './handlers/RotationGestureHandler';
import FlingGestureHandler from './handlers/FlingGestureHandler';
import NativeViewGestureHandler from './handlers/NativeViewGestureHandler';
import ManualGestureHandler from './handlers/ManualGestureHandler';
import HoverGestureHandler from './handlers/HoverGestureHandler';

//Hammer Handlers
import HammerNativeViewGestureHandler from '../web_hammer/NativeViewGestureHandler';
import HammerPanGestureHandler from '../web_hammer/PanGestureHandler';
import HammerTapGestureHandler from '../web_hammer/TapGestureHandler';
import HammerLongPressGestureHandler from '../web_hammer/LongPressGestureHandler';
import HammerPinchGestureHandler from '../web_hammer/PinchGestureHandler';
import HammerRotationGestureHandler from '../web_hammer/RotationGestureHandler';
import HammerFlingGestureHandler from '../web_hammer/FlingGestureHandler';

export const Gestures = {
  NativeViewGestureHandler,
  PanGestureHandler,
  TapGestureHandler,
  LongPressGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  FlingGestureHandler,
  ManualGestureHandler,
  HoverGestureHandler,
};

export const HammerGestures = {
  NativeViewGestureHandler: HammerNativeViewGestureHandler,
  PanGestureHandler: HammerPanGestureHandler,
  TapGestureHandler: HammerTapGestureHandler,
  LongPressGestureHandler: HammerLongPressGestureHandler,
  PinchGestureHandler: HammerPinchGestureHandler,
  RotationGestureHandler: HammerRotationGestureHandler,
  FlingGestureHandler: HammerFlingGestureHandler,
};
