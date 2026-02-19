import {
  BaseGestureConfig,
  CommonGestureConfig,
  ExternalRelations,
  GestureCallbacks,
  HandlersPropsWhiteList,
  InternalConfigProps,
  SingleGestureName,
} from '../../types';
import { NativeWrapperProperties } from '../../types/NativeWrapperType';
import { FlingNativeProperties } from '../gestures/fling/FlingTypes';
import { HoverNativeProperties } from '../gestures/hover/HoverTypes';
import { LongPressNativeProperties } from '../gestures/longPress/LongPressTypes';
import { NativeHandlerNativeProperties } from '../gestures/native/NativeTypes';
import { PanNativeProperties } from '../gestures/pan/PanTypes';
import { TapNativeProperties } from '../gestures/tap/TapTypes';

const CommonConfig = new Set<keyof CommonGestureConfig>([
  'enabled',
  'shouldCancelWhenOutside',
  'hitSlop',
  'activeCursor',
  'mouseButton',
  'testID',
  'cancelsTouchesInView',
  'manualActivation',
]);

const ExternalRelationsConfig = new Set<keyof ExternalRelations>([
  'simultaneousWith',
  'requireToFail',
  'block',
]);

export const allowedNativeProps = new Set<
  keyof CommonGestureConfig | keyof InternalConfigProps<unknown>
>([
  ...CommonConfig,

  // InternalConfigProps
  'userSelect',
  'enableContextMenu',
  'touchAction',
  'dispatchesReanimatedEvents',
  'dispatchesAnimatedEvents',
  'needsPointerData',
]);

// Don't pass testID to the native side in production
if (!__DEV__) {
  allowedNativeProps.delete('testID');
}

export const HandlerCallbacks = new Set<
  keyof Required<GestureCallbacks<unknown, unknown>>
>([
  'onBegin',
  'onActivate',
  'onUpdate',
  'onDeactivate',
  'onFinalize',
  'onTouchesDown',
  'onTouchesMove',
  'onTouchesUp',
  'onTouchesCancel',
]);

export const PropsToFilter = new Set<
  BaseGestureConfig<unknown, unknown, unknown>
>([
  ...HandlerCallbacks,
  ...ExternalRelationsConfig,

  // Config props
  'changeEventCalculator',
  'disableReanimated',
  'shouldUseReanimatedDetector',
  'useAnimated',
  'runOnJS',
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

export const NativeWrapperProps = new Set<
  keyof NativeWrapperProperties<unknown>
>([
  ...CommonConfig,
  ...HandlerCallbacks,
  ...NativeHandlerNativeProperties,
  ...ExternalRelationsConfig,
  'disableReanimated',
]);
