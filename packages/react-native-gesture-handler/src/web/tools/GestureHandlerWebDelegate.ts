import findNodeHandle from '../../findNodeHandle';
import type IGestureHandler from '../handlers/IGestureHandler';
import {
  GestureHandlerDelegate,
  MeasureResult,
} from './GestureHandlerDelegate';
import PointerEventManager from './PointerEventManager';
import { State } from '../../State';
import { isPointerInBounds } from '../utils';
import EventManager from './EventManager';
import { Config } from '../interfaces';
import { MouseButton } from '../../handlers/gestureHandlerCommon';
import KeyboardEventManager from './KeyboardEventManager';
import WheelEventManager from './WheelEventManager';

interface DefaultViewStyles {
  userSelect: string;
  touchAction: string;
}

export class GestureHandlerWebDelegate
  implements GestureHandlerDelegate<HTMLElement, IGestureHandler>
{
  public isInitialized = false;
  private _view: HTMLElement | null = null;

  private gestureHandler!: IGestureHandler;
  private eventManagers: EventManager<unknown>[] = [];
  private defaultViewStyles: DefaultViewStyles = {
    userSelect: '',
    touchAction: '',
  };
  init(viewRef: number, handler: IGestureHandler): void {
    if (!viewRef) {
      throw new Error(
        `Cannot find HTML Element for handler ${handler.handlerTag}`
      );
    }

    this.isInitialized = true;

    this.gestureHandler = handler;
    this.view = findNodeHandle(viewRef) as unknown as HTMLElement;

    this.defaultViewStyles = {
      userSelect: this.view.style.userSelect,
      touchAction: this.view.style.touchAction,
    };

    const config = handler.config;

    this.setUserSelect(config.enabled);
    this.setTouchAction(config.enabled);
    this.setContextMenu(config.enabled);

    this.eventManagers.push(new PointerEventManager(this.view));
    this.eventManagers.push(new KeyboardEventManager(this.view));
    this.eventManagers.push(new WheelEventManager(this.view));

    this.eventManagers.forEach((manager) =>
      this.gestureHandler.attachEventManager(manager)
    );
  }

  detach(): void {
    this._view = null;
    this.defaultViewStyles = {
      userSelect: '',
      touchAction: '',
    };

    this.eventManagers.forEach((manager) => {
      manager.unregisterListeners();
    });
    this.removeContextMenuListeners(this.gestureHandler.config);
    this.eventManagers = [];
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
    const config = this.gestureHandler.config;

    if (
      config.activeCursor &&
      config.activeCursor !== 'auto' &&
      this.gestureHandler.state === State.ACTIVE
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

  private setUserSelect(isHandlerEnabled: boolean) {
    const { userSelect } = this.gestureHandler.config;

    this.view.style['userSelect'] = isHandlerEnabled
      ? (userSelect ?? 'none')
      : this.defaultViewStyles.userSelect;

    this.view.style['webkitUserSelect'] = isHandlerEnabled
      ? (userSelect ?? 'none')
      : this.defaultViewStyles.userSelect;
  }

  private setTouchAction(isHandlerEnabled: boolean) {
    const { touchAction } = this.gestureHandler.config;

    this.view.style['touchAction'] = isHandlerEnabled
      ? (touchAction ?? 'none')
      : this.defaultViewStyles.touchAction;

    // @ts-ignore This one disables default events on Safari
    this.view.style['WebkitTouchCallout'] = isHandlerEnabled
      ? (touchAction ?? 'none')
      : this.defaultViewStyles.touchAction;
  }

  private setContextMenu(isHandlerEnabled: boolean) {
    const config = this.gestureHandler.config;

    if (isHandlerEnabled) {
      this.addContextMenuListeners(config);
    } else {
      this.removeContextMenuListeners(config);
    }
  }

  onEnabledChange(enabled: boolean): void {
    if (!this.isInitialized) {
      return;
    }

    this.setUserSelect(enabled);
    this.setTouchAction(enabled);
    this.setContextMenu(enabled);

    if (enabled) {
      this.eventManagers.forEach((manager) => {
        manager.registerListeners();
      });
    } else {
      this.eventManagers.forEach((manager) => {
        manager.unregisterListeners();
      });
    }
  }

  onBegin(): void {
    // no-op for now
  }

  onActivate(): void {
    const config = this.gestureHandler.config;

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

  public get view() {
    return this._view!;
  }
  public set view(value: HTMLElement) {
    this._view = value;
  }
}
