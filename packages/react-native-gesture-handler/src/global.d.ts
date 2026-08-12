/* eslint-disable no-var */
export {};

declare global {
  var _setGestureStateSync:
    | ((handlerTag: number, state: number) => void)
    | undefined;

  var _setGestureStateAsync:
    | ((handlerTag: number, state: number) => void)
    | undefined;

  // Temporary holder used to pass the Worklets UI runtime to native code.
  var __RNGH_UI_WORKLET_RUNTIME_HOLDER: object | undefined;
}
