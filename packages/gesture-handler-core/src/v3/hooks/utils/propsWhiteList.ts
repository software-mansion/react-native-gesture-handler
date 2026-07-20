import type {
  BaseGestureConfig,
  CommonGestureConfig,
  ExternalRelations,
  GestureCallbacks,
  HandlersPropsWhiteList,
  InternalConfigProps,
} from '../../types';
import { SingleGestureName } from '../../types';
import type { NativeWrapperProperties } from '../../types/NativeWrapperType';
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
  'cancelsJSResponder',
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
  'dispatchesAnimatedEvents',
  'needsPointerData',
]);

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
  'fillInDefaultValues',
  'changeEventCalculator',
  'disableReanimated',
  'shouldUseReanimatedDetector',
  'useAnimated',
  'runOnJS',

  // Pan offset props before remapping:
  'activeOffsetY',
  'failOffsetX',
  'failOffsetY',
  'activeOffsetX',
]);

// Don't pass testID to the native side in production. Applied lazily on
// first read instead of at module scope: core must not touch __DEV__ during
// module evaluation — bundlers that skip side-effect-free barrels (webpack
// under `sideEffects`) can evaluate this module before the binding's
// environment setup (e.g. the DOM binding's ensureDevGlobal) has provided
// the global.
let productionTestIDFilterApplied = false;
export function applyProductionTestIDFilter() {
  if (productionTestIDFilterApplied) {
    return;
  }
  productionTestIDFilterApplied = true;
  if (!__DEV__) {
    allowedNativeProps.delete('testID');
    PropsToFilter.add('testID');
  }
}

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
