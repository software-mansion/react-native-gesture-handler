import { PointerType } from '../../PointerType';
import type { AdaptedEvent } from '../interfaces';
import { EventTypes } from '../interfaces';
import EventManager from './EventManager';

export default class KeyboardEventManager extends EventManager<HTMLElement> {
  private static activationKeys = new Set(['Enter', ' ']);
  private static cancelationKeys = new Set(['Tab']);
  private keyPointer: string | null = null;

  private static registeredStaticListeners = false;
  private static instances: Set<KeyboardEventManager> = new Set();

  private static keyUpStaticCallback = (event: KeyboardEvent): void => {
    // We need a global listener, as in some cases, keyUp event gets stop-propagated.
    // Then, if we used only component-level listeners the gesture would never end,
    // causing other gestues to fail.
    if (!this.activationKeys.has(event.key)) {
      return;
    }

    this.instances.forEach((item) => {
      item.onKeyUp(event);
    });
  };

  private keyDownCallback = (event: KeyboardEvent): void => {
    if (this.keyPointer !== null) {
      if (KeyboardEventManager.cancelationKeys.has(event.key)) {
        this.dispatchEvent(event, EventTypes.CANCEL);
        this.keyPointer = null;
      }

      return;
    }

    if (!KeyboardEventManager.activationKeys.has(event.key) || event.repeat) {
      return;
    }

    this.keyPointer = event.key;
    this.dispatchEvent(event, EventTypes.DOWN);
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    if (this.keyPointer !== event.key) {
      return;
    }

    this.dispatchEvent(event, EventTypes.UP);
    this.keyPointer = null;
  };

  private dispatchEvent(event: KeyboardEvent, eventType: EventTypes) {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }

    const adaptedEvent = this.mapEvent(event, eventType);

    switch (eventType) {
      case EventTypes.UP:
        this.onPointerUp(adaptedEvent);
        break;
      case EventTypes.DOWN:
        this.onPointerDown(adaptedEvent);
        break;
      case EventTypes.CANCEL:
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
    this.keyPointer = null;
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
