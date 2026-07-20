import { tagMessage } from '../../utils';
import type { GestureHandlerPlatformPort } from './Port';

const REQUIRED_PROXY_MEMBERS = [
  'createGestureHandler',
  'setGestureHandlerConfig',
  'updateGestureHandlerConfig',
  'dropGestureHandler',
  'configureRelations',
  'flush',
] as const;

const REQUIRED_DETECTOR_MEMBERS = [
  'HostGestureDetector',
  'AnimatedHostGestureDetector',
  'detectorStyle',
  'Wrap',
  'getViewTag',
  'useNativeGestureRole',
] as const;

// Dev-only structural validation: interface drift is a compile error for TS
// binding authors, but JS consumers and partially-mocked test setups get a
// loud, early failure instead of a render-time crash. The worklet check
// covers the one contract property the type system cannot express.
// Lives in its own leaf module so binding runtime modules can validate
// without pulling any impl into their import graph.
export function validatePort(port: GestureHandlerPlatformPort) {
  if (!__DEV__) {
    return;
  }

  const missing: string[] = [];
  for (const key of REQUIRED_PROXY_MEMBERS) {
    if (typeof port.proxy?.[key] !== 'function') {
      missing.push(`proxy.${key}`);
    }
  }
  for (const key of REQUIRED_DETECTOR_MEMBERS) {
    if (port.detector?.[key] == null) {
      missing.push(`detector.${key}`);
    }
  }
  if (port.capabilities == null) {
    missing.push('capabilities');
  }

  if (missing.length > 0) {
    throw new Error(
      tagMessage(
        `validatePort: the platform port is missing ${missing.join(', ')}.`
      )
    );
  }

  if (
    port.reanimated !== undefined &&
    !port.capabilities.fansOutReanimatedHandlers
  ) {
    // Only meaningful when reanimated routes events internally (a separate UI
    // runtime exists). Single-threaded reanimated environments (react-native-web)
    // legitimately pass plain functions.
    // With the reanimated capability present, updateGestureHandlerConfig is
    // captured into the SharedValue listener worklet and invoked on the UI
    // runtime — it must be a workletized function or a host function.
    const updateConfig = port.proxy.updateGestureHandlerConfig;
    const isUIRuntimeCallable =
      '__workletHash' in updateConfig ||
      String(updateConfig).includes('[native code]');
    if (!isUIRuntimeCallable) {
      console.warn(
        tagMessage(
          'validatePort: port.proxy.updateGestureHandlerConfig does not look UI-runtime callable (no __workletHash, not a host function). SharedValue-driven config updates will throw on the UI runtime.'
        )
      );
    }
  }
}
