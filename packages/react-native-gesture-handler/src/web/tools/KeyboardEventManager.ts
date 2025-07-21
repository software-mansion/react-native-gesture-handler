import { AdaptedEvent, EventTypes } from '../interfaces';
import EventManager from './EventManager';
import { PointerType } from '../../PointerType';

export default class KeyboardEventManager extends EventManager<HTMLElement> {
  private activationKeys = ['Enter', ' '];
  private cancelationKeys = ['Tab'];
  private isPressed = false;
  private static registeredStaticListeners = false;
  private static instances: Set<KeyboardEventManager> = new Set();

  private static keyUpCallback = (event: KeyboardEvent): void => {
    this.instances.forEach((item) => {
      item.keyUp(event);
    });
  };

  private keyDownCallback = (event: KeyboardEvent): void => {
    if (this.cancelationKeys.indexOf(event.key) !== -1 && this.isPressed) {
      this.dispatchEvent(event, EventTypes.CANCEL);
      return;
    }

    if (this.activationKeys.indexOf(event.key) === -1) {
      return;
    }

    this.dispatchEvent(event, EventTypes.DOWN);
  };

  private keyUp = (event: KeyboardEvent): void => {
    if (this.activationKeys.indexOf(event.key) === -1 || !this.isPressed) {
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
        this.isPressed = false;
        this.onPointerUp(adaptedEvent);
        break;
      case EventTypes.DOWN:
        this.isPressed = true;
        this.onPointerDown(adaptedEvent);
        break;
      case EventTypes.CANCEL:
        this.isPressed = false;
        this.onPointerCancel(adaptedEvent);
        break;
    }
  }

  public registerListeners(): void {
    this.view.addEventListener('keydown', this.keyDownCallback);
    if (!KeyboardEventManager.registeredStaticListeners) {
      document.addEventListener('keyup', KeyboardEventManager.keyUpCallback);
    }

    KeyboardEventManager.instances.add(this);
  }

  public unregisterListeners(): void {
    this.view.removeEventListener('keydown', this.keyDownCallback);
    KeyboardEventManager.instances.delete(this);
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
