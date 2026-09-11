export type GestureStateManagerType = {
  activate(handlerTag: number): void;
  fail(handlerTag: number): void;
  deactivate(handlerTag: number): void;
};
