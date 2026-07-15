import type {
  BaseGestureConfig,
  GestureRelations,
  SingleGestureName,
} from '@swmansion/gesture-handler-core';
import { createGestureHandlerAPI } from '@swmansion/gesture-handler-core';

import { ButtonComponent as GestureHandlerButton } from './GestureHandlerButton';
import { GestureStateManager } from './gestureStateManager';
import HostGestureDetector from './HostGestureDetector';
import { useNativeGestureRole } from './useNativeGestureRole';
import { WebModule } from './WebModule';
import { Wrap } from './Wrap';

// This module is the plain-DOM platform binding of the gesture-handler core.
// No react-native, no reanimated: the reanimated capability is undefined, so
// every reanimated branch in core is unreachable and worklet directives are
// inert strings executed as plain functions.
const api = createGestureHandlerAPI({
  proxy: {
    createGestureHandler: <T extends Record<string, unknown>>(
      handlerName: SingleGestureName,
      handlerTag: number,
      config?: T
    ) => {
      WebModule.createGestureHandler(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handlerName as any,
        handlerTag,
        config || {}
      );
    },
    setGestureHandlerConfig: <
      TConfig,
      THandlerData,
      TExtendedHandlerData extends THandlerData,
    >(
      handlerTag: number,
      newConfig: BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      WebModule.setGestureHandlerConfig(handlerTag, newConfig as any);
    },
    updateGestureHandlerConfig: <
      TConfig,
      THandlerData,
      TExtendedHandlerData extends THandlerData,
    >(
      handlerTag: number,
      newConfig: BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      WebModule.updateGestureHandlerConfig(handlerTag, newConfig as any);
    },
    dropGestureHandler: (handlerTag: number) => {
      WebModule.dropGestureHandler(handlerTag);
    },
    configureRelations: (handlerTag: number, relations: GestureRelations) => {
      WebModule.configureRelations(handlerTag, relations);
    },
    flush: () => {
      // The DOM engine applies operations synchronously; nothing to flush.
    },
  },
  detector: {
    HostGestureDetector,
    // Animated (RN) events do not exist on the DOM binding; the plain host
    // detector serves both slots (dispatchesAnimatedEvents is unreachable
    // without react-native's Animated).
    AnimatedHostGestureDetector: HostGestureDetector,
    ReanimatedHostGestureDetector: undefined,
    detectorStyle: { display: 'contents' },
    Wrap,
    getViewTag: (node: unknown) => node,
    useNativeGestureRole,
  },
  press: {
    Button: GestureHandlerButton,
    // hitSlop/testID configure the gesture, not the DOM element — drop them
    // before they reach the div as unknown attributes.
    mapButtonProps: (rest: Record<string, unknown>) => {
      const hostProps = { ...rest };
      delete hostProps.hitSlop;
      delete hostProps.testID;
      return hostProps;
    },
  },
  capabilities: {
    requiresRootView: false,
    fansOutReanimatedHandlers: true,
    virtualChildrenCarryViewRefs: true,
  },
  reanimated: undefined,
});

export const {
  useTapGesture,
  useFlingGesture,
  useLongPressGesture,
  usePinchGesture,
  useRotationGesture,
  useHoverGesture,
  useManualGesture,
  useNativeGesture,
  usePanGesture,
  useGesture,
  useComposedGesture,
  useSimultaneousGestures,
  useCompetingGestures,
  useExclusiveGestures,
  NativeDetector,
  VirtualDetector,
  InterceptingGestureDetector,
  useEnsureGestureHandlerRootView,
  Touchable,
  createNativeWrapper,
} = api;

export { GestureStateManager };
