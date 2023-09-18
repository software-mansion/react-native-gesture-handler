import type GestureHandler from '../handlers/GestureHandler';

export interface MeasureResult {
  pageX: number;
  pageY: number;
  width: number;
  height: number;
}

export interface GestureHandlerDelegate<T> {
  getView(): T;

  init(viewRef: number, handler: GestureHandler): void;
  isPointerInBounds({ x, y }: { x: number; y: number }): boolean;
  measureView(): MeasureResult;
  reset(): void;

  onBegin(): void;
  onActivate(): void;
  onEnd(): void;
  onCancel(): void;
  onFail(): void;
}
