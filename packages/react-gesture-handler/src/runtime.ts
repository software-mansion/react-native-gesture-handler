// Must run before the port is used anywhere: core reads __DEV__.
import './ensureDevGlobal';

import type {
  BaseGestureConfig,
  CoreRuntime,
  GestureHandlerPlatformPort,
  GestureRelations,
  SingleGestureName,
} from '@swmansion/gesture-handler-core';
import { validatePort } from '@swmansion/gesture-handler-core';

import HostGestureDetector from './HostGestureDetector';
import { useNativeGestureRole } from './useNativeGestureRole';
import { WebModule } from './WebModule';
import { Wrap } from './Wrap';

// The plain-DOM platform runtime, built once in this leaf module. Every
// public export binds a core impl to this runtime in its OWN module (see
// src/gestures/*, GestureDetector.ts, Touchable.tsx), so a tree-shaken
// bundle retains only what it imports — this module is the floor every
// consumer pays, keep it minimal (note: the press kit deliberately lives in
// Touchable.tsx, not here).
//
// No react-native, no reanimated: the reanimated capability is undefined, so
// every reanimated branch in core is unreachable and worklet directives are
// inert strings executed as plain functions.
const port: GestureHandlerPlatformPort = {
  proxy: {
    createGestureHandler: <T extends Record<string, unknown>>(
      handlerName: SingleGestureName,
      handlerTag: number,
      config?: T
    ) => {
      WebModule.createGestureHandler(handlerName, handlerTag, config || {});
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
  capabilities: {
    requiresRootView: false,
    fansOutReanimatedHandlers: true,
    virtualChildrenCarryViewRefs: true,
  },
  reanimated: undefined,
};

validatePort(port);

export const runtime: CoreRuntime = {
  port,
  lastUpdateEventMap: undefined,
};
