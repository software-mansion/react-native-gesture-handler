import { findNodeHandle } from 'react-native';
import type GestureHandler from '../handlers/GestureHandler';
import {
  GestureHandlerDelegate,
  MeasureResult,
} from './GestureHandlerDelegate';
import PointerEventManager from './PointerEventManager';
import TouchEventManager from './TouchEventManager';
import { State } from '../../State';
import { isPointerInBounds } from '../utils';

export class GestureHandlerWebDelegate
  implements GestureHandlerDelegate<HTMLElement>
{
  private _view!: HTMLElement;
  private gestureHandler!: GestureHandler;

  get view(): HTMLElement {
    return this._view;
  }

  init(viewRef: number, handler: GestureHandler): void {
    if (!viewRef) {
      throw new Error(
        `Cannot find HTML Element for handler ${handler.getTag()}`
      );
    }

    this.gestureHandler = handler;
    this._view = findNodeHandle(viewRef) as unknown as HTMLElement;

    this.view.style['touchAction'] = 'none';
    //@ts-ignore This one disables default events on Safari
    this.view.style['WebkitTouchCallout'] = 'none';

    const config = handler.getConfig();

    if (!config.userSelect) {
      this.view.style['webkitUserSelect'] = 'none';
      this.view.style['userSelect'] = 'none';
    } else {
      this.view.style['webkitUserSelect'] = config.userSelect;
      this.view.style['userSelect'] = config.userSelect;
    }

    handler.addEventManager(new PointerEventManager(this.view));
    handler.addEventManager(new TouchEventManager(this.view));
  }

  isPointerInBounds({ x, y }: { x: number; y: number }): boolean {
    return isPointerInBounds(this.view, { x, y });
  }

  measureView(): MeasureResult {
    const rect = this.view.getBoundingClientRect();

    return {
      pageX: rect.left,
      pageY: rect.top,
      width: rect.width,
      height: rect.height,
    };
  }

  reset(): void {
    throw new Error('Method not implemented.');
  }

  onBegin(): void {
    // no-op for now
  }

  onActivate(): void {
    const config = this.gestureHandler.getConfig();

    if (
      (!this.view.style.cursor || this.view.style.cursor === 'auto') &&
      config.activeCursor
    ) {
      this.view.style.cursor = config.activeCursor;
    }
  }

  onEnd(): void {
    const config = this.gestureHandler.getConfig();

    if (
      config.activeCursor &&
      config.activeCursor !== 'auto' &&
      this.gestureHandler.getState() === State.ACTIVE
    ) {
      this.view.style.cursor = 'auto';
    }
  }

  onCancel(): void {
    const config = this.gestureHandler.getConfig();

    if (
      config.activeCursor &&
      config.activeCursor !== 'auto' &&
      this.gestureHandler.getState() === State.ACTIVE
    ) {
      this.view.style.cursor = 'auto';
    }
  }

  onFail(): void {
    const config = this.gestureHandler.getConfig();

    if (
      config.activeCursor &&
      config.activeCursor !== 'auto' &&
      this.gestureHandler.getState() === State.ACTIVE
    ) {
      this.view.style.cursor = 'auto';
    }
  }
}
