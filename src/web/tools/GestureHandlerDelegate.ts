import { Config } from '../interfaces';

export interface MeasureResult {
  pageX: number;
  pageY: number;
  width: number;
  height: number;
}

export interface GestureHandlerDelegate<TComponent, THandler> {
  getView(): TComponent;

  init(viewRef: number, handler: THandler): void;
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
