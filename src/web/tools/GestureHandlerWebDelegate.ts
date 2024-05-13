import { findNodeHandle } from 'react-native';
import type IGestureHandler from '../handlers/IGestureHandler';
import {
  GestureHandlerDelegate,
  MeasureResult,
} from './GestureHandlerDelegate';
import PointerEventManager from './PointerEventManager';
import TouchEventManager from './TouchEventManager';
import { State } from '../../State';
import { isPointerInBounds } from '../utils';
import EventManager from './EventManager';
import { Config } from '../interfaces';
import { MouseButton } from '../../handlers/gestureHandlerCommon';

export class GestureHandlerWebDelegate
  implements GestureHandlerDelegate<HTMLElement, IGestureHandler>
{
  private view!: HTMLElement;
  private gestureHandler!: IGestureHandler;
  private eventManagers: EventManager<unknown>[] = [];

  getView(): HTMLElement {
    return this.view;
  }

  init(viewRef: number, handler: IGestureHandler): void {
    if (!viewRef) {
      throw new Error(
        `Cannot find HTML Element for handler ${handler.getTag()}`
      );
    }

    this.gestureHandler = handler;
    this.view = findNodeHandle(viewRef) as unknown as HTMLElement;

    const config = handler.getConfig();

    this.addContextMenuListeners(config);

    if (!config.userSelect) {
      this.view.style['webkitUserSelect'] = 'none';
      this.view.style['userSelect'] = 'none';
    } else {
      this.view.style['webkitUserSelect'] = config.userSelect;
      this.view.style['userSelect'] = config.userSelect;
    }

    this.view.style['touchAction'] = config.touchAction ?? 'none';
    //@ts-ignore This one disables default events on Safari
    this.view.style['WebkitTouchCallout'] = 'none';

    this.eventManagers.push(new PointerEventManager(this.view));
    this.eventManagers.push(new TouchEventManager(this.view));

    this.eventManagers.forEach((manager) =>
      this.gestureHandler.attachEventManager(manager)
    );
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
    this.eventManagers.forEach((manager: EventManager<unknown>) =>
      manager.resetManager()
    );
  }

  tryResetCursor() {
    const config = this.gestureHandler.getConfig();

    if (
      config.activeCursor &&
      config.activeCursor !== 'auto' &&
      this.gestureHandler.getState() === State.ACTIVE
    ) {
      this.view.style.cursor = 'auto';
    }
  }

  private shouldDisableContextMenu(config: Config) {
    return (
      (config.enableContextMenu === undefined &&
        this.gestureHandler.isButtonInConfig(MouseButton.RIGHT)) ||
      config.enableContextMenu === false
    );
  }

  private addContextMenuListeners(config: Config): void {
    if (this.shouldDisableContextMenu(config)) {
      this.view.addEventListener('contextmenu', this.disableContextMenu);
    } else if (config.enableContextMenu) {
      this.view.addEventListener('contextmenu', this.enableContextMenu);
    }
  }

  private removeContextMenuListeners(config: Config): void {
    if (this.shouldDisableContextMenu(config)) {
      this.view.removeEventListener('contextmenu', this.disableContextMenu);
    } else if (config.enableContextMenu) {
      this.view.removeEventListener('contextmenu', this.enableContextMenu);
    }
  }

  private disableContextMenu(this: void, e: MouseEvent): void {
    e.preventDefault();
  }

  private enableContextMenu(this: void, e: MouseEvent): void {
    e.stopPropagation();
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
    this.tryResetCursor();
  }

  onCancel(): void {
    this.tryResetCursor();
  }

  onFail(): void {
    this.tryResetCursor();
  }

  public destroy(config: Config): void {
    this.removeContextMenuListeners(config);

    this.eventManagers.forEach((manager) => {
      manager.unregisterListeners();
    });
  }
}
