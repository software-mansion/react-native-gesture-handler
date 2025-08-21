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
import { MouseButton } from '../../handlers/gestureHandlerCommon';
import KeyboardEventManager from './KeyboardEventManager';
import WheelEventManager from './WheelEventManager';
import { tagMessage } from '../../utils';

interface DefaultViewStyles {
  userSelect: string;
  touchAction: string;
}

export class GestureHandlerWebDelegate
  implements GestureHandlerDelegate<HTMLElement, IGestureHandler>
{
  private isInitialized = false;
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

    this.setUserSelect(handler.enabled);
    this.setTouchAction(handler.enabled);
    this.setContextMenu(handler.enabled);

    this.eventManagers.push(new PointerEventManager(this.view));
    this.eventManagers.push(new KeyboardEventManager(this.view));
    this.eventManagers.push(new WheelEventManager(this.view));

    this.eventManagers.forEach((manager) =>
      this.gestureHandler.attachEventManager(manager)
    );
  }

  detach(): void {
    this.defaultViewStyles = {
      userSelect: '',
      touchAction: '',
    };

    this.eventManagers.forEach((manager) => {
      manager.unregisterListeners();
    });
    this.removeContextMenuListeners(this.gestureHandler.enableContextMenu);
    this._view = null;
    this.eventManagers = [];
  }

  isPointerInBounds({ x, y }: { x: number; y: number }): boolean {
    if (!this.view) {
      return false;
    }
    return isPointerInBounds(this.view, { x, y });
  }

  measureView(): MeasureResult {
    if (!this.view) {
      throw new Error(tagMessage('Cannot measure a null view'));
    }

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
    const activeCursor = this.gestureHandler.activeCursor;

    if (
      activeCursor &&
      activeCursor !== 'auto' &&
      this.gestureHandler.state === State.ACTIVE &&
      this.view
    ) {
      this.view.style.cursor = 'auto';
    }
  }

  private shouldDisableContextMenu(enableContextMenu?: boolean) {
    return (
      (enableContextMenu === undefined &&
        this.gestureHandler.isButtonInConfig(MouseButton.RIGHT)) ||
      enableContextMenu === false
    );
  }

  private addContextMenuListeners(enableContextMenu?: boolean): void {
    this.ensureView(this.view);

    if (this.shouldDisableContextMenu(enableContextMenu)) {
      this.view.addEventListener('contextmenu', this.disableContextMenu);
    } else if (enableContextMenu) {
      this.view.addEventListener('contextmenu', this.enableContextMenu);
    }
  }

  private removeContextMenuListeners(enableContextMenu?: boolean): void {
    this.ensureView(this.view);

    if (this.shouldDisableContextMenu(enableContextMenu)) {
      this.view.removeEventListener('contextmenu', this.disableContextMenu);
    } else if (enableContextMenu) {
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
    const userSelect = this.gestureHandler.userSelect;

    this.ensureView(this.view);

    this.view.style['userSelect'] = isHandlerEnabled
      ? (userSelect ?? 'none')
      : this.defaultViewStyles.userSelect;

    this.view.style['webkitUserSelect'] = isHandlerEnabled
      ? (userSelect ?? 'none')
      : this.defaultViewStyles.userSelect;
  }

  private setTouchAction(isHandlerEnabled: boolean) {
    const touchAction = this.gestureHandler.touchAction;

    this.ensureView(this.view);

    this.view.style['touchAction'] = isHandlerEnabled
      ? (touchAction ?? 'none')
      : this.defaultViewStyles.touchAction;

    // @ts-ignore This one disables default events on Safari
    this.view.style['WebkitTouchCallout'] = isHandlerEnabled
      ? (touchAction ?? 'none')
      : this.defaultViewStyles.touchAction;
  }

  private setContextMenu(isHandlerEnabled: boolean) {
    if (isHandlerEnabled) {
      this.addContextMenuListeners(this.gestureHandler.enableContextMenu);
    } else {
      this.removeContextMenuListeners(this.gestureHandler.enableContextMenu);
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
    this.ensureView(this.view);
    if (
      (!this.view.style.cursor || this.view.style.cursor === 'auto') &&
      this.gestureHandler.activeCursor
    ) {
      this.view.style.cursor = this.gestureHandler.activeCursor;
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

  public destroy(enableContextMenu?: boolean): void {
    this.removeContextMenuListeners(enableContextMenu);

    this.eventManagers.forEach((manager) => {
      manager.unregisterListeners();
    });
  }

  private ensureView(view: any): asserts view is HTMLElement {
    if (!view) {
      throw new Error(tagMessage('Expected delegate view to be HTMLElement'));
    }
  }

  public get view(): HTMLElement | null {
    return this._view;
  }

  public set view(value: HTMLElement) {
    this._view = value;
  }

  get initialized(): boolean {
    return this.isInitialized;
  }
}
