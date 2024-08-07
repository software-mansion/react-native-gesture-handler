import { AdaptedEvent, EventTypes } from '../interfaces';
import EventManager from './EventManager';
import { PointerType } from '../../PointerType';

export default class KeyEventManager extends EventManager<HTMLElement> {
  private activationKeys = ['Enter', 'Space'];

  private keyDownCallback = (event: KeyboardEvent): void => {
    if (this.activationKeys.indexOf(event.code) === -1) {
      return;
    }

    const adaptedEvent: AdaptedEvent = this.mapEvent(event, EventTypes.DOWN);
    this.onPointerDown(adaptedEvent);
  };

  private keyUpCallback = (event: KeyboardEvent): void => {
    if (this.activationKeys.indexOf(event.code) === -1) {
      return;
    }

    const adaptedEvent: AdaptedEvent = this.mapEvent(event, EventTypes.UP);
    this.onPointerUp(adaptedEvent);
  };

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
    const relativeX = this.view.offsetLeft + this.view.offsetWidth / 2;
    const relativeY = this.view.offsetTop + this.view.offsetHeight / 2;
    const viewportX = (event.view?.screenX ?? 0) + this.view.offsetWidth / 2;
    const viewportY = (event.view?.screenY ?? 0) + this.view.offsetHeight / 2;

    return {
      x: viewportX,
      y: viewportY,
      offsetX: relativeX,
      offsetY: relativeY,
      pointerId: 0,
      eventType: eventType,
      pointerType: PointerType.KEY,
      time: event.timeStamp,
    };
  }
}
