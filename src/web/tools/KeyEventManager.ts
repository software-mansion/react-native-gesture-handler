import { AdaptedEvent, EventTypes } from '../interfaces';
import EventManager from './EventManager';
import { PointerType } from '../../PointerType';

export default class KeyEventManager extends EventManager<HTMLElement> {
  private activationKeys = ['Enter', ' '];
  private cancelationKeys = ['Tab'];

  private keyDownCallback = (event: KeyboardEvent): void => {
    if (this.cancelationKeys.indexOf(event.key) !== -1) {
      this.dispatchEvent(event, EventTypes.CANCEL);
    }

    if (this.activationKeys.indexOf(event.key) === -1) {
      return;
    }

    this.dispatchEvent(event, EventTypes.DOWN);
  };

  private keyUpCallback = (event: KeyboardEvent): void => {
    if (this.activationKeys.indexOf(event.key) === -1) {
      return;
    }

    this.dispatchEvent(event, EventTypes.UP);
  };

  private dispatchEvent(event: KeyboardEvent, eventType: EventTypes) {
    this.view.getBoundingClientRect();
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
    this.view.addEventListener('keyup', this.keyUpCallback);
  }

  public unregisterListeners(): void {
    this.view.addEventListener('keydown', this.keyDownCallback);
    this.view.addEventListener('keyup', this.keyUpCallback);
  }

  protected mapEvent(
    event: KeyboardEvent,
    eventType: EventTypes
  ): AdaptedEvent {
    const viewRect = (event.target as HTMLElement)?.getBoundingClientRect?.();

    const pointerPosition = {
      x: viewRect.x + viewRect.width / 2,
      y: viewRect.y + viewRect.height / 2,
    };

    return {
      x: pointerPosition.x,
      y: pointerPosition.y,
      offsetX: pointerPosition.x,
      offsetY: pointerPosition.y,
      pointerId: 0,
      eventType: eventType,
      pointerType: PointerType.KEY,
      time: event.timeStamp,
    };
  }
}
