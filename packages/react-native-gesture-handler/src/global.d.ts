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
