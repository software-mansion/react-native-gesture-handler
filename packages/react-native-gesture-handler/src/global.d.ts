export {};

declare global {
  // eslint-disable-next-line no-var
  var _setGestureStateSync: (handlerTag: number, newState: number) => void;
}
