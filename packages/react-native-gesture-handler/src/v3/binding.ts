import { createGestureHandlerAPI } from '@swmansion/gesture-handler-core';
import { Animated, findNodeHandle, Platform, StyleSheet } from 'react-native';

import { Wrap } from '../handlers/gestures/GestureDetector/Wrap';
import { Reanimated } from '../handlers/gestures/reanimatedWrapper';
import { scheduleFlushOperations } from '../handlers/utils';
import HostGestureDetector from './detectors/HostGestureDetector';
import { ReanimatedNativeDetector } from './detectors/ReanimatedNativeDetector';
import { useNativeGestureRole } from './detectors/useNativeGestureRole';
import { NativeProxy } from './NativeProxy';

// This module is the react-native platform binding of the gesture-handler
// core: it assembles the platform port from statically-imported platform
// modules (Metro resolves the .web variants of HostGestureDetector, Wrap,
// NativeProxy, useNativeGestureRole etc. for react-native-web builds) and
// composes the public v3 API exactly once at module scope.
const IS_WEB = Platform.OS === 'web';

const AnimatedHostGestureDetector =
  Animated.createAnimatedComponent(HostGestureDetector);

const styles = StyleSheet.create({
  detector: {
    display: 'contents',
  },
});

const api = createGestureHandlerAPI({
  proxy: {
    ...NativeProxy,
    flush: scheduleFlushOperations,
  },
  detector: {
    HostGestureDetector,
    AnimatedHostGestureDetector,
    ReanimatedHostGestureDetector: ReanimatedNativeDetector,
    detectorStyle: styles.detector,
    Wrap,
    getViewTag: (node: unknown) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      IS_WEB ? node : findNodeHandle(node as any),
    useNativeGestureRole,
  },
  capabilities: {
    requiresRootView: !IS_WEB,
    fansOutReanimatedHandlers: IS_WEB,
    virtualChildrenCarryViewRefs: IS_WEB,
  },
  reanimated: Reanimated,
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
  useJSResponderHandler,
  useGestureRelationsUpdater,
  useGestureCallbacks,
  createNativeWrapper,
} = api;

export const VirtualGestureDetector = api.VirtualDetector;
