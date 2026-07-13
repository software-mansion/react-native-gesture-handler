import { createNativeWrapperFactory } from './v3/createNativeWrapper';
import type {
  InterceptingGestureDetectorProps,
  NativeDetectorProps,
  VirtualDetectorProps,
} from './v3/detectors/common';
import { NativeDetector as NativeDetectorImpl } from './v3/detectors/NativeDetector';
import { useEnsureGestureHandlerRootView as useEnsureGestureHandlerRootViewImpl } from './v3/detectors/useEnsureGestureHandlerRootView';
import { useGestureRelationsUpdater as useGestureRelationsUpdaterImpl } from './v3/detectors/useGestureRelationsUpdater';
import { InterceptingGestureDetector as InterceptingGestureDetectorImpl } from './v3/detectors/VirtualDetector/InterceptingGestureDetector';
import { VirtualDetector as VirtualDetectorImpl } from './v3/detectors/VirtualDetector/VirtualDetector';
import { useCompetingGestures as useCompetingGesturesImpl } from './v3/hooks/composition/useCompetingGestures';
import { useComposedGesture as useComposedGestureImpl } from './v3/hooks/composition/useComposedGesture';
import { useExclusiveGestures as useExclusiveGesturesImpl } from './v3/hooks/composition/useExclusiveGestures';
import { useSimultaneousGestures as useSimultaneousGesturesImpl } from './v3/hooks/composition/useSimultaneousGestures';
import type { FlingGestureConfig } from './v3/hooks/gestures/fling/FlingTypes';
import { useFlingGesture as useFlingGestureImpl } from './v3/hooks/gestures/fling/useFlingGesture';
import type { HoverGestureConfig } from './v3/hooks/gestures/hover/HoverTypes';
import { useHoverGesture as useHoverGestureImpl } from './v3/hooks/gestures/hover/useHoverGesture';
import type { LongPressGestureConfig } from './v3/hooks/gestures/longPress/LongPressTypes';
import { useLongPressGesture as useLongPressGestureImpl } from './v3/hooks/gestures/longPress/useLongPressGesture';
import type { ManualGestureConfig } from './v3/hooks/gestures/manual/ManualTypes';
import { useManualGesture as useManualGestureImpl } from './v3/hooks/gestures/manual/useManualGesture';
import type { NativeGestureConfig } from './v3/hooks/gestures/native/NativeTypes';
import { useNativeGesture as useNativeGestureImpl } from './v3/hooks/gestures/native/useNativeGesture';
import type { PanGestureConfig } from './v3/hooks/gestures/pan/PanTypes';
import { usePanGesture as usePanGestureImpl } from './v3/hooks/gestures/pan/usePanGesture';
import type { PinchGestureConfig } from './v3/hooks/gestures/pinch/PinchTypes';
import { usePinchGesture as usePinchGestureImpl } from './v3/hooks/gestures/pinch/usePinchGesture';
import type { RotationGestureConfig } from './v3/hooks/gestures/rotation/RotationTypes';
import { useRotationGesture as useRotationGestureImpl } from './v3/hooks/gestures/rotation/useRotationGesture';
import type { TapGestureConfig } from './v3/hooks/gestures/tap/TapTypes';
import { useTapGesture as useTapGestureImpl } from './v3/hooks/gestures/tap/useTapGesture';
import { useGesture as useGestureImpl } from './v3/hooks/useGesture';
import { useGestureCallbacks as useGestureCallbacksImpl } from './v3/hooks/useGestureCallbacks';
import { useJSResponderHandler as useJSResponderHandlerImpl } from './v3/hooks/useJSResponderHandler';
import type {
  CoreRuntime,
  GestureHandlerPlatformPort,
} from './v3/platform/Port';
import type {
  AnyGesture,
  BaseGestureConfig,
  ComposedGestureName,
  Gesture,
  ReanimatedContext,
  SingleGestureName,
} from './v3/types';

// Composes the platform-agnostic v3 API with a platform port. Called exactly
// once, at module scope, by each platform package's binding module; consumers
// import the bound results from the platform package, never from core.
//
// Hook implementations stay module-scope functions taking the runtime as a
// plain first argument — there is deliberately no mutable module state holding
// the port anywhere in core (no init-order hazard, nothing for worklets to
// capture, nothing for tree-shaking to drop). Members are NAMED function
// expressions so eslint-plugin-react-hooks and React Compiler recognize them
// as hook/component definitions.
export function createGestureHandlerAPI(port: GestureHandlerPlatformPort) {
  const runtime: CoreRuntime = {
    port,
    // Mirrors the previous module-scope `Reanimated?.makeMutable(new Map())`:
    // one map per factory call, created before any hook can render.
    lastUpdateEventMap: port.reanimated?.makeMutable(
      new Map<number, ReanimatedContext<unknown>>()
    ),
  };

  const api = {
    // -- gesture hooks --------------------------------------------------
    useTapGesture: function useTapGesture(config?: TapGestureConfig) {
      return useTapGestureImpl(runtime, config);
    },
    useFlingGesture: function useFlingGesture(config?: FlingGestureConfig) {
      return useFlingGestureImpl(runtime, config);
    },
    useLongPressGesture: function useLongPressGesture(
      config?: LongPressGestureConfig
    ) {
      return useLongPressGestureImpl(runtime, config);
    },
    usePinchGesture: function usePinchGesture(config?: PinchGestureConfig) {
      return usePinchGestureImpl(runtime, config);
    },
    useRotationGesture: function useRotationGesture(
      config?: RotationGestureConfig
    ) {
      return useRotationGestureImpl(runtime, config);
    },
    useHoverGesture: function useHoverGesture(config?: HoverGestureConfig) {
      return useHoverGestureImpl(runtime, config);
    },
    useManualGesture: function useManualGesture(config?: ManualGestureConfig) {
      return useManualGestureImpl(runtime, config);
    },
    useNativeGesture: function useNativeGesture(config?: NativeGestureConfig) {
      return useNativeGestureImpl(runtime, config);
    },
    usePanGesture: function usePanGesture(config?: PanGestureConfig) {
      return usePanGestureImpl(runtime, config);
    },
    useGesture: function useGesture<
      TConfig,
      THandlerData,
      TExtendedHandlerData extends THandlerData = THandlerData,
    >(
      type: SingleGestureName,
      config: BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>
    ) {
      return useGestureImpl<TConfig, THandlerData, TExtendedHandlerData>(
        runtime,
        type,
        config
      );
    },

    // -- composition ----------------------------------------------------
    useComposedGesture: function useComposedGesture(
      type: ComposedGestureName,
      ...gestures: AnyGesture[]
    ) {
      return useComposedGestureImpl(runtime, type, ...gestures);
    },
    useSimultaneousGestures: function useSimultaneousGestures(
      ...gestures: AnyGesture[]
    ) {
      return useSimultaneousGesturesImpl(runtime, ...gestures);
    },
    useCompetingGestures: function useCompetingGestures(
      ...gestures: AnyGesture[]
    ) {
      return useCompetingGesturesImpl(runtime, ...gestures);
    },
    useExclusiveGestures: function useExclusiveGestures(
      ...gestures: AnyGesture[]
    ) {
      return useExclusiveGesturesImpl(runtime, ...gestures);
    },

    // -- detectors --------------------------------------------------------
    NativeDetector: function NativeDetector<
      TConfig,
      THandlerData,
      TExtendedHandlerData extends THandlerData,
    >(props: NativeDetectorProps<TConfig, THandlerData, TExtendedHandlerData>) {
      return NativeDetectorImpl(runtime, props);
    },
    VirtualDetector: function VirtualDetector<
      TConfig,
      THandlerData,
      TExtendedHandlerData extends THandlerData,
    >(
      props: VirtualDetectorProps<TConfig, THandlerData, TExtendedHandlerData>
    ) {
      return VirtualDetectorImpl(runtime, props);
    },
    InterceptingGestureDetector: function InterceptingGestureDetector<
      TConfig,
      THandlerData,
      TExtendedHandlerData extends THandlerData,
    >(
      props: InterceptingGestureDetectorProps<
        TConfig,
        THandlerData,
        TExtendedHandlerData
      >
    ) {
      return InterceptingGestureDetectorImpl(runtime, props);
    },

    // -- supporting hooks -------------------------------------------------
    useEnsureGestureHandlerRootView:
      function useEnsureGestureHandlerRootView() {
        return useEnsureGestureHandlerRootViewImpl(runtime);
      },
    useJSResponderHandler: function useJSResponderHandler<
      TConfig,
      THandlerData,
      TExtendedHandlerData extends THandlerData,
    >(gesture: Gesture<TConfig, THandlerData, TExtendedHandlerData>) {
      return useJSResponderHandlerImpl(runtime, gesture);
    },
    useGestureRelationsUpdater: function useGestureRelationsUpdater<
      TConfig,
      THandlerData,
    >(gesture?: Gesture<TConfig, THandlerData>) {
      return useGestureRelationsUpdaterImpl(runtime, gesture);
    },
    useGestureCallbacks: function useGestureCallbacks<
      TConfig,
      THandlerData,
      TExtendedHandlerData extends THandlerData,
    >(
      handlerTag: number,
      config: BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>
    ) {
      return useGestureCallbacksImpl(runtime, handlerTag, config);
    },
  };

  const createNativeWrapper = createNativeWrapperFactory({
    NativeDetector: api.NativeDetector,
    VirtualDetector: api.VirtualDetector,
    InterceptingGestureDetector: api.InterceptingGestureDetector,
    useNativeGesture: api.useNativeGesture,
  });

  return { ...api, createNativeWrapper };
}

export type GestureHandlerAPI = ReturnType<typeof createGestureHandlerAPI>;
