import { PointerType } from '../../PointerType';
import type { AdaptedEvent } from '../interfaces';
import { EventTypes } from '../interfaces';
import EventManager from './EventManager';

export default class KeyboardEventManager extends EventManager<HTMLElement> {
  private static activationKeys = ['Enter', ' '];
  private static cancelationKeys = ['Tab'];
  private pressedKeys = new Set<string>();
  private static registeredStaticListeners = false;
  private static instances: Set<KeyboardEventManager> = new Set();

  private static keyUpStaticCallback = (event: KeyboardEvent): void => {
    // We need a global listener, as in some cases, keyUp event gets stop-propagated.
    // Then, if we used only component-level listeners the gesture would never end,
    // causing other gestues to fail.

    if (this.activationKeys.indexOf(event.key) === -1) {
      return;
    }

    this.instances.forEach((item) => {
      item.onKeyUp(event);
    });
  };

  private keyDownCallback = (event: KeyboardEvent): void => {
    if (
      KeyboardEventManager.cancelationKeys.indexOf(event.key) !== -1 &&
      this.pressedKeys.size > 0
    ) {
      this.dispatchEvent(event, EventTypes.CANCEL);
      return;
    }

    if (KeyboardEventManager.activationKeys.indexOf(event.key) === -1) {
      return;
    }

    // Browsers repeat `keydown` while a key is held, and another activation key
    // may go down during the press. The synthetic pointer stays down until every
    // held activation key is released, so only the first one opens the gesture.
    if (this.pressedKeys.size > 0) {
      this.pressedKeys.add(event.key);
      return;
    }

    this.dispatchEvent(event, EventTypes.DOWN);
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    if (!this.pressedKeys.delete(event.key) || this.pressedKeys.size > 0) {
      return;
    }

    this.dispatchEvent(event, EventTypes.UP);
  };

  private dispatchEvent(event: KeyboardEvent, eventType: EventTypes) {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }

    const adaptedEvent = this.mapEvent(event, eventType);

    switch (eventType) {
      case EventTypes.UP:
        this.pressedKeys.clear();
        this.onPointerUp(adaptedEvent);
        break;
      case EventTypes.DOWN:
        this.pressedKeys.add(event.key);
        this.onPointerDown(adaptedEvent);
        break;
      case EventTypes.CANCEL:
        this.pressedKeys.clear();
        this.onPointerCancel(adaptedEvent);
        break;
    }
  }

  public registerListeners(): void {
    this.view.addEventListener('keydown', this.keyDownCallback);

    KeyboardEventManager.instances.add(this);

    if (!KeyboardEventManager.registeredStaticListeners) {
      KeyboardEventManager.registeredStaticListeners = true;
      document.addEventListener(
        'keyup',
        KeyboardEventManager.keyUpStaticCallback,
        { capture: true }
      );
    }
  }

  public unregisterListeners(): void {
    this.view.removeEventListener('keydown', this.keyDownCallback);

    KeyboardEventManager.instances.delete(this);

    if (KeyboardEventManager.instances.size === 0) {
      document.removeEventListener(
        'keyup',
        KeyboardEventManager.keyUpStaticCallback,
        { capture: true }
      );
      KeyboardEventManager.registeredStaticListeners = false;
    }
  }

  public override resetManager(): void {
    super.resetManager();
    this.pressedKeys.clear();
  }

  protected mapEvent(
    event: KeyboardEvent,
    eventType: EventTypes
  ): AdaptedEvent {
    const viewRect = (event.target as HTMLElement).getBoundingClientRect();

    const viewportPosition = {
      x: viewRect?.x + viewRect?.width / 2,
      y: viewRect?.y + viewRect?.height / 2,
    };

    const relativePosition = {
      x: viewRect?.width / 2,
      y: viewRect?.height / 2,
    };

    return {
      x: viewportPosition.x,
      y: viewportPosition.y,
      offsetX: relativePosition.x,
      offsetY: relativePosition.y,
      pointerId: 0,
      eventType: eventType,
      pointerType: PointerType.KEY,
      time: event.timeStamp,
    };
  }
}
