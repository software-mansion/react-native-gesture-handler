import type {
  GestureHandlerDelegate,
  MeasureResult,
} from './GestureHandlerDelegate';
import { getEffectiveBoundingRect, isPointerInBounds } from '../utils';
import type EventManager from './EventManager';
import type IGestureHandler from '../handlers/IGestureHandler';
import KeyboardEventManager from './KeyboardEventManager';
import { MouseButton } from '../../handlers/gestureHandlerCommon';
import PointerEventManager from './PointerEventManager';
import { SingleGestureName } from '../../v3/types';
import { State } from '../../State';
import WheelEventManager from './WheelEventManager';
import findNodeHandle from '../../findNodeHandle';
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

  private areContextMenuListenersAdded = false;
  private wasContextMenuEnabled = false;

  init(viewRef: number, handler: IGestureHandler): void {
    if (!viewRef) {
      throw new Error(
        `Cannot find HTML Element for handler ${handler.handlerTag}`
      );
    }

    this.gestureHandler = handler;
    this.view = findNodeHandle(viewRef) as unknown as HTMLElement;

    this.defaultViewStyles = {
      userSelect: this.view.style.userSelect,
      touchAction: this.view.style.touchAction,
    };

    const shouldSendHoverEvents = handler.name === SingleGestureName.Hover;

    this.eventManagers.push(
      new PointerEventManager(this.view, shouldSendHoverEvents)
    );
    this.eventManagers.push(new KeyboardEventManager(this.view));
    this.eventManagers.push(new WheelEventManager(this.view));

    this.eventManagers.forEach((manager) =>
      this.gestureHandler.attachEventManager(manager)
    );

    this.updateDOM();

    this.isInitialized = true;
  }

  detach(): void {
    this.restoreDefaultViewStyles();

    this.defaultViewStyles = {
      userSelect: '',
      touchAction: '',
    };

    this.eventManagers.forEach((manager) => {
      manager.setEnabled(false);
    });

    this.removeContextMenuListeners();
    this._view = null;
    this.eventManagers = [];

    this.isInitialized = false;
  }

  restoreDefaultViewStyles(): void {
    this.ensureView(this.view);

    this.setViewStyle('userSelect', this.defaultViewStyles.userSelect);
    this.setViewStyle('webkitUserSelect', this.defaultViewStyles.userSelect);
    this.setViewStyle('touchAction', this.defaultViewStyles.touchAction);
    this.setViewStyle('WebkitTouchCallout', this.defaultViewStyles.touchAction);
  }

  updateDOM(): void {
    this.setUserSelect();
    this.setTouchAction();
    this.setContextMenu();
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

    const rect = getEffectiveBoundingRect(this.view);

    return {
      pageX: rect.left,
      pageY: rect.top,
      width: rect.width,
      height: rect.height,
    };
  }

  absoluteToLocal(
    absoluteX: number,
    absoluteY: number
  ): { x: number; y: number } {
    if (!this.view) {
      throw new Error(tagMessage('Cannot convert coords on a null view'));
    }

    const rect = getEffectiveBoundingRect(this.view);
    const transform = getComputedStyle(this.view).transform;
    const matrix =
      transform && transform !== 'none'
        ? new DOMMatrix(transform)
        : new DOMMatrix();

    // Zero out translation — it's already reflected in the bounding rect
    // center, so we only need to invert the rotation+scale part.
    matrix.e = 0;
    matrix.f = 0;
    const inverse = matrix.inverse();

    // Offset from the visual center of the bounding rect
    const rectCenterX = rect.left + rect.width / 2;
    const rectCenterY = rect.top + rect.height / 2;
    const dx = absoluteX - rectCenterX;
    const dy = absoluteY - rectCenterY;

    // Apply inverse rotation+scale to get local-space offset from center
    const localOffset = inverse.transformPoint(new DOMPoint(dx, dy));

    // Add back the local center (untransformed dimensions)
    const localCenterX = this.view.offsetWidth / 2;
    const localCenterY = this.view.offsetHeight / 2;

    return {
      x: localCenterX + localOffset.x,
      y: localCenterY + localOffset.y,
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

  private shouldDisableContextMenu() {
    return (
      (this.gestureHandler.enableContextMenu === undefined &&
        this.gestureHandler.isButtonInConfig(MouseButton.RIGHT)) ||
      this.gestureHandler.enableContextMenu === false
    );
  }

  private addContextMenuListeners(): void {
    this.ensureView(this.view);

    if (this.areContextMenuListenersAdded) {
      return;
    }

    if (this.shouldDisableContextMenu()) {
      this.wasContextMenuEnabled = false;
      this.view.addEventListener('contextmenu', this.disableContextMenu);
      this.areContextMenuListenersAdded = true;
    } else if (this.gestureHandler.enableContextMenu) {
      this.wasContextMenuEnabled = true;
      this.view.addEventListener('contextmenu', this.enableContextMenu);
      this.areContextMenuListenersAdded = true;
    }
  }

  private removeContextMenuListeners(): void {
    if (!this.initialized || !this.areContextMenuListenersAdded) {
      return;
    }

    this.ensureView(this.view);

    if (!this.areContextMenuListenersAdded) {
      return;
    }

    if (!this.wasContextMenuEnabled) {
      this.view.removeEventListener('contextmenu', this.disableContextMenu);
      this.areContextMenuListenersAdded = false;
    } else {
      this.view.removeEventListener('contextmenu', this.enableContextMenu);
      this.areContextMenuListenersAdded = false;
    }
  }

  private disableContextMenu(this: void, e: MouseEvent): void {
    e.preventDefault();
  }

  private enableContextMenu(this: void, e: MouseEvent): void {
    e.stopPropagation();
  }

  private setUserSelect() {
    const userSelect = this.gestureHandler.userSelect;

    this.ensureView(this.view);

    const value = this.gestureHandler.enabled
      ? (userSelect ?? 'none')
      : this.defaultViewStyles.userSelect;

    this.setViewStyle('userSelect', value);
    this.setViewStyle('webkitUserSelect', value);
  }

  private setTouchAction() {
    const touchAction = this.gestureHandler.touchAction;

    this.ensureView(this.view);

    const value = this.gestureHandler.enabled
      ? (touchAction ?? 'none')
      : this.defaultViewStyles.touchAction;

    this.setViewStyle('touchAction', value);
    this.setViewStyle('WebkitTouchCallout', value);
  }

  private setContextMenu() {
    if (!this.gestureHandler.enabled) {
      this.removeContextMenuListeners();
      return;
    }

    if (!this.wasContextMenuEnabled) {
      this.removeContextMenuListeners();
    }

    this.addContextMenuListeners();
  }

  onEnabledChange(): void {
    if (!this.isInitialized) {
      return;
    }

    this.updateDOM();

    this.eventManagers.forEach((manager) => {
      manager.setEnabled(this.gestureHandler.enabled);
    });
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

  public destroy(): void {
    this.removeContextMenuListeners();

    this.eventManagers.forEach((manager) => {
      manager.unregisterListeners();
    });

    this.isInitialized = false;
  }

  private setViewStyle(
    property: Extract<keyof CSSStyleDeclaration, string> | 'WebkitTouchCallout',
    value: string
  ): void {
    this.ensureView(this.view);

    const hasDisplayContents =
      this.view.style.display === 'contents' ||
      getComputedStyle(this.view).display === 'contents';

    if (hasDisplayContents) {
      for (const child of Array.from(this.view.children)) {
        if (child instanceof HTMLElement) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
          (child.style as any)[property] = value;
        }
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (this.view.style as any)[property] = value;
    }
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
