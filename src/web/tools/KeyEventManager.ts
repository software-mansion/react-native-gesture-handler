import { AdaptedEvent, EventTypes } from '../interfaces';
import EventManager from './EventManager';
import { PointerType } from '../../PointerType';

export default class KeyEventManager extends EventManager<HTMLElement> {
  private keyDownCallback = (event: unknown): void => {
    const adaptedEvent: AdaptedEvent = this.mapEvent(event, EventTypes.DOWN);
    this.onPointerDown(adaptedEvent);
  };
  private keyUpCallback = (event: unknown): void => {
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

  protected mapEvent(event: unknown, eventType: EventTypes): AdaptedEvent {
    console.log(event);
    return {
      x: 0,
      y: 0,
      offsetX: 0,
      offsetY: 0,
      pointerId: 0,
      eventType: eventType,
      pointerType: PointerType.KEY,
      time: 0,
    };
  }
}
