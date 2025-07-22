import { AdaptedEvent, EventTypes } from '../interfaces';
import EventManager from './EventManager';
import { PointerType } from '../../PointerType';

export default class KeyboardEventManager extends EventManager<HTMLElement> {
  private static activationKeys = ['Enter', ' '];
  private static cancelationKeys = ['Tab'];
  private isPressed = false;
  private static registeredStaticListeners = false;
  private static instances: Set<KeyboardEventManager> = new Set();
  private static lastKeyUpTimeStamp: number;

  private static keyUpStaticCallback = (event: KeyboardEvent): void => {
    if (
      this.activationKeys.indexOf(event.key) === -1 ||
      event.timeStamp !== this.lastKeyUpTimeStamp
    ) {
      return;
    }

    this.lastKeyUpTimeStamp = event.timeStamp;

    this.instances.forEach((item) => {
      item.onKeyUp(event);
    });
  };

  private keyUpCallback = (event: KeyboardEvent): void => {
    KeyboardEventManager.lastKeyUpTimeStamp = event.timeStamp;
    this.onKeyUp(event);
  };

  private keyDownCallback = (event: KeyboardEvent): void => {
    if (
      KeyboardEventManager.cancelationKeys.indexOf(event.key) !== -1 &&
      this.isPressed
    ) {
      this.dispatchEvent(event, EventTypes.CANCEL);
      return;
    }

    if (KeyboardEventManager.activationKeys.indexOf(event.key) === -1) {
      return;
    }

    this.dispatchEvent(event, EventTypes.DOWN);
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    if (
      KeyboardEventManager.activationKeys.indexOf(event.key) === -1 ||
      !this.isPressed
    ) {
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
    this.view.addEventListener('keyup', this.keyUpCallback);

    KeyboardEventManager.instances.add(this);

    if (!KeyboardEventManager.registeredStaticListeners) {
      KeyboardEventManager.registeredStaticListeners = true;
      document.addEventListener(
        'keyup',
        KeyboardEventManager.keyUpStaticCallback
      );
    }
  }

  public unregisterListeners(): void {
    this.view.removeEventListener('keydown', this.keyDownCallback);
    this.view.removeEventListener('keyup', this.keyUpCallback);

    KeyboardEventManager.instances.delete(this);

    if (KeyboardEventManager.instances.size === 0) {
      document.removeEventListener(
        'keyup',
        KeyboardEventManager.keyUpStaticCallback
      );
      KeyboardEventManager.registeredStaticListeners = false;
    }
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
