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

  // Temporary holder used to pass the Worklets UI runtime to native code.
  // eslint-disable-next-line no-var
  var __RNGH_UI_WORKLET_RUNTIME_HOLDER: object | undefined;
}
