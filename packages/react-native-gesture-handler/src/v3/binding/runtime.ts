import type {
  CoreRuntime,
  GestureHandlerPlatformPort,
} from '@swmansion/gesture-handler-core';
import { validatePort } from '@swmansion/gesture-handler-core';
import { createLastUpdateEventMap } from '@swmansion/gesture-handler-core/src/v3/hooks/callbacks/lastUpdateEventMap';
import { Animated, findNodeHandle, Platform, StyleSheet } from 'react-native';

import {
  Reanimated,
  Worklets,
} from '../../handlers/gestures/reanimatedWrapper';
import { scheduleFlushOperations } from '../../handlers/utils';
import HostGestureDetector from '../detectors/HostGestureDetector';
import { ReanimatedNativeDetector } from '../detectors/ReanimatedNativeDetector';
import { useNativeGestureRole } from '../detectors/useNativeGestureRole';
import { Wrap } from '../detectors/VirtualDetector/Wrap';
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
  worklets: Worklets,
};

validatePort(port);

// Created lazily instead of at module scope so importing this module doesn't
// call into Worklets during module evaluation; one map per runtime.
let lastUpdateEventMap: ReturnType<typeof createLastUpdateEventMap>;

export const runtime: CoreRuntime = {
  port,
  getLastUpdateEventMap: () => {
    lastUpdateEventMap ??= createLastUpdateEventMap(port);
    return lastUpdateEventMap;
  },
};
