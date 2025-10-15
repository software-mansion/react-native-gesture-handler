import {
  BaseGestureConfig,
  CommonGestureConfig,
  GestureCallbacks,
  HandlersPropsWhiteList,
  InternalConfigProps,
  SingleGestureName,
} from '../../types';
import { FlingNativeProperties } from '../gestures/fling/FlingProperties';
import { HoverNativeProperties } from '../gestures/hover/HoverProperties';
import { LongPressNativeProperties } from '../gestures/longPress/LongPressProperties';
import { NativeHandlerNativeProperties } from '../gestures/native/NativeProperties';
import { PanNativeProperties } from '../gestures/pan/PanProperties';
import { TapNativeProperties } from '../gestures/tap/TapProperties';

export const allowedNativeProps = new Set<
  keyof CommonGestureConfig | keyof InternalConfigProps<unknown>
>([
  // CommonGestureConfig
  'disableReanimated',
  'enabled',
  'shouldCancelWhenOutside',
  'hitSlop',
  'userSelect',
  'activeCursor',
  'mouseButton',
  'enableContextMenu',
  'touchAction',

  // InternalConfigProps
  'dispatchesReanimatedEvents',
  'dispatchesAnimatedEvents',
  'needsPointerData',
  'changeEventCalculator',
]);

export const HandlerCallbacks = new Set<
  keyof Required<GestureCallbacks<unknown>>
>([
  'onBegin',
  'onStart',
  'onUpdate',
  'onEnd',
  'onFinalize',
  'onTouchesDown',
  'onTouchesMove',
  'onTouchesUp',
  'onTouchesCancelled',
]);

export const PropsToFilter = new Set<BaseGestureConfig<unknown, unknown>>([
  ...HandlerCallbacks,

  // Config props
  'changeEventCalculator',
  'disableReanimated',

  // Relations
  'simultaneousWithExternalGesture',
  'requireExternalGestureToFail',
  'blocksExternalGesture',
]);

export const PropsWhiteLists = new Map<
  SingleGestureName,
  HandlersPropsWhiteList
>([
  [SingleGestureName.Pan, PanNativeProperties],
  [SingleGestureName.Tap, TapNativeProperties],
  [SingleGestureName.Native, NativeHandlerNativeProperties],
  [SingleGestureName.Fling, FlingNativeProperties],
  [SingleGestureName.Hover, HoverNativeProperties],
  [SingleGestureName.LongPress, LongPressNativeProperties],
]);

export const EMPTY_WHITE_LIST = new Set<string>();
