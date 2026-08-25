import type {
  GestureHandlerPlatformPort,
  LastUpdateEventMap,
} from '../../platform/Port';

export type { LastUpdateEventMap };

// Replaces the platform-split .ts/.web.ts pair: single-threaded reanimated
// environments (fansOutReanimatedHandlers — react-native-web, plain DOM) route
// events in JS, so a plain host-side map suffices; a separate UI runtime needs
// a shareable. Called lazily through CoreRuntime.getLastUpdateEventMap — the
// binding's runtime module owns the per-binding memoization.
export function createLastUpdateEventMap(port: GestureHandlerPlatformPort) {
  if (port.capabilities.fansOutReanimatedHandlers) {
    return { value: new Map() as LastUpdateEventMap };
  }

  const { worklets, reanimated } = port;
  if (
    worklets?.createShareable === undefined ||
    worklets.UIRuntimeId === undefined ||
    reanimated === undefined
  ) {
    return undefined;
  }

  return worklets.createShareable<LastUpdateEventMap>(
    worklets.UIRuntimeId,
    new Map()
  );
}
