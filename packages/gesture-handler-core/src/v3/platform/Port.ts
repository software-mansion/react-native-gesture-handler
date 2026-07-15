import type React from 'react';

import type {
  BaseGestureConfig,
  GestureRelations,
  ReanimatedContext,
  SingleGestureName,
} from '../types';
import type { ReanimatedIntegration } from './ReanimatedIntegration';

// The host detector component is provided by the platform binding (codegen
// component on native, DOM element wrapper on web). Its full prop surface is
// platform-specific; core passes a known set of props (see NativeDetector).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HostDetectorComponent = React.ComponentType<any>;

export interface GestureHandlerProxyPort {
  createGestureHandler: <T extends Record<string, unknown>>(
    handlerName: SingleGestureName,
    handlerTag: number,
    config?: T
  ) => void;
  setGestureHandlerConfig: <
    TConfig,
    THandlerData,
    TExtendedHandlerData extends THandlerData,
  >(
    handlerTag: number,
    newConfig: BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>
  ) => void;
  // Must be callable on the UI runtime (worklet or host function) when the
  // reanimated capability is present: it is captured into the SharedValue
  // listener worklet installed by bindSharedValues.
  updateGestureHandlerConfig: <
    TConfig,
    THandlerData,
    TExtendedHandlerData extends THandlerData,
  >(
    handlerTag: number,
    newConfig: BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>
  ) => void;
  dropGestureHandler: (handlerTag: number) => void;
  configureRelations: (handlerTag: number, relations: GestureRelations) => void;
  flush: () => void;
}

export interface DetectorKitPort {
  HostGestureDetector: HostDetectorComponent;
  AnimatedHostGestureDetector: HostDetectorComponent;
  ReanimatedHostGestureDetector: HostDetectorComponent | undefined;
  detectorStyle: unknown;
  Wrap: React.ComponentType<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref?: any;
    children?: React.ReactNode;
  }>;
  getViewTag: (node: unknown) => number | unknown;
  useNativeGestureRole: (
    viewRef: React.RefObject<unknown>,
    children: React.ReactNode
  ) => void;
}

export interface PressKitPort {
  // The platform's host button rendered by the core Touchable (codegen button
  // on native, DOM div button on web). Receives TouchableButtonProps plus the
  // passthrough props (optionally translated by mapButtonProps below).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Button: React.ComponentType<any>;
  // Optional platform translation of the passthrough props into host-button
  // props — the place for platform-only concerns the core component cannot
  // know about (Android ripple config, TV focusability, stripping props that
  // are not valid DOM attributes). Identity when omitted.
  mapButtonProps?:
    | ((rest: Record<string, unknown>) => Record<string, unknown>)
    | undefined;
}

export interface PlatformCapabilities {
  // Whether detectors must be rendered inside a GestureHandlerRootView
  // (__DEV__ check). True on RN native platforms, false on web.
  requiresRootView: boolean;
  // Whether all three onGestureHandlerReanimated* props receive the composed
  // handler (web semantics: the platform routes events in JS) or only
  // onGestureHandlerReanimatedEvent is set (native: Reanimated routes
  // internally based on registered event names).
  fansOutReanimatedHandlers: boolean;
  // Whether virtual children passed to the host detector carry view refs and
  // interaction props (web semantics) or only viewTag + handlerTags (native
  // codegen reads nothing else).
  virtualChildrenCarryViewRefs: boolean;
}

export interface GestureHandlerPlatformPort {
  proxy: GestureHandlerProxyPort;
  detector: DetectorKitPort;
  press: PressKitPort;
  capabilities: PlatformCapabilities;
  reanimated: ReanimatedIntegration | undefined;
}

// Internal per-factory state threaded as the first argument through every
// platform-dependent hook implementation. Never captured by worklets — worklet
// code must destructure the single member it needs into a local first.
export interface CoreRuntime {
  port: GestureHandlerPlatformPort;
  // Mirrors the previous module-scope `Reanimated?.makeMutable(new Map())`:
  // created once per factory call when the reanimated capability is present.
  lastUpdateEventMap:
    | { value: Map<number, ReanimatedContext<unknown>> }
    | undefined;
}
