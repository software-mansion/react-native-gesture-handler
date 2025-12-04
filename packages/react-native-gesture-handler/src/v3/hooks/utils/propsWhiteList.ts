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
import { FlingNativeProperties } from '../gestures/fling/FlingProperties';
import { HoverNativeProperties } from '../gestures/hover/HoverProperties';
import { LongPressNativeProperties } from '../gestures/longPress/LongPressProperties';
import { NativeHandlerNativeProperties } from '../gestures/native/NativeProperties';
import { PanNativeProperties } from '../gestures/pan/PanProperties';
import { TapNativeProperties } from '../gestures/tap/TapProperties';

const CommonConfig = new Set<keyof CommonGestureConfig>([
  'enabled',
  'shouldCancelWhenOutside',
  'hitSlop',
  'userSelect',
  'activeCursor',
  'mouseButton',
  'enableContextMenu',
  'touchAction',
  'testID',
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
  'dispatchesReanimatedEvents',
  'dispatchesAnimatedEvents',
  'needsPointerData',
]);

export const HandlerCallbacks = new Set<
  keyof Required<GestureCallbacks<unknown>>
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

export const PropsToFilter = new Set<BaseGestureConfig<unknown, unknown>>([
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

export const NativeWrapperProps = new Set<keyof NativeWrapperProperties>([
  ...CommonConfig,
  ...HandlerCallbacks,
  ...NativeHandlerNativeProperties,
  ...ExternalRelationsConfig,
  'disableReanimated',
]);
