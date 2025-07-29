import { Config } from '../interfaces';

export interface MeasureResult {
  pageX: number;
  pageY: number;
  width: number;
  height: number;
}

export interface GestureHandlerDelegate<TComponent, THandler> {
  view: TComponent;

  init(viewRef: number, handler: THandler): void;
  detach(): void;
  isPointerInBounds({ x, y }: { x: number; y: number }): boolean;
  measureView(): MeasureResult;
  reset(): void;

  onBegin(): void;
  onActivate(): void;
  onEnd(): void;
  onCancel(): void;
  onFail(): void;
  onEnabledChange(enabled: boolean): void;

  destroy(config: Config): void;
}
