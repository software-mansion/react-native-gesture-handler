import type {
  CoreRuntime,
  GestureHandlerPlatformPort,
  ReanimatedContext,
} from '@swmansion/gesture-handler-core';
import { validatePort } from '@swmansion/gesture-handler-core';
import { Animated, findNodeHandle, Platform, StyleSheet } from 'react-native';

import { Wrap } from '../../handlers/gestures/GestureDetector/Wrap';
import { Reanimated } from '../../handlers/gestures/reanimatedWrapper';
import { scheduleFlushOperations } from '../../handlers/utils';
import HostGestureDetector from '../detectors/HostGestureDetector';
import { ReanimatedNativeDetector } from '../detectors/ReanimatedNativeDetector';
import { useNativeGestureRole } from '../detectors/useNativeGestureRole';
import { NativeProxy } from '../NativeProxy';

// The react-native platform runtime, built once in this leaf module from
// statically-imported platform modules (Metro resolves the .web variants of
// HostGestureDetector, Wrap, NativeProxy, useNativeGestureRole etc. for
// react-native-web builds). Every public export binds a core impl to this
// runtime in its own module under src/v3/binding/ — the same wiring pattern
// as the react-gesture-handler package.
const IS_WEB = Platform.OS === 'web';

const AnimatedHostGestureDetector =
  Animated.createAnimatedComponent(HostGestureDetector);

const styles = StyleSheet.create({
  detector: {
    display: 'contents',
  },
});

const port: GestureHandlerPlatformPort = {
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
};

validatePort(port);

export const runtime: CoreRuntime = {
  port,
  // One map per runtime, created before any hook can render (mirrors the
  // previous module-scope `Reanimated?.makeMutable(new Map())`).
  lastUpdateEventMap: Reanimated?.makeMutable(
    new Map<number, ReanimatedContext<unknown>>()
  ),
};
