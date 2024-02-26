import type GestureHandlerInterface from '../handlers/GestureHandlerInterface';
import { Config } from '../interfaces';

export interface MeasureResult {
  pageX: number;
  pageY: number;
  width: number;
  height: number;
}

export interface GestureHandlerDelegate<T> {
  getView(): T;

  init(viewRef: number, handler: GestureHandlerInterface): void;
  isPointerInBounds({ x, y }: { x: number; y: number }): boolean;
  measureView(): MeasureResult;
  reset(): void;

  onBegin(): void;
  onActivate(): void;
  onEnd(): void;
  onCancel(): void;
  onFail(): void;

  destroy(config: Config): void;
}
