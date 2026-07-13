export {};

declare global {
  // eslint-disable-next-line no-var
  var _setGestureStateSync:
    | ((handlerTag: number, state: number) => void)
    | undefined;

  // eslint-disable-next-line no-var
  var _setGestureStateAsync:
    | ((handlerTag: number, state: number) => void)
    | undefined;
}

declare global {
  // React Native provides setImmediate; browsers and other hosts may not.
  // Core only probes it via `typeof` (see ghQueueMicrotask.ts).
  // eslint-disable-next-line no-var
  var setImmediate: ((callback: () => void) => void) | undefined;
}
