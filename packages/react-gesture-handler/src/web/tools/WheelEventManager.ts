import EventManager from './EventManager';
import { AdaptedEvent, EventTypes } from '../interfaces';
import { PointerType } from '../../PointerType';

export default class WheelEventManager extends EventManager<HTMLElement> {
  private wheelDelta = { x: 0, y: 0 };

  private resetDelta = (_event: PointerEvent) => {
    this.wheelDelta = { x: 0, y: 0 };
  };

  private wheelCallback = (event: WheelEvent) => {
    this.wheelDelta.x += event.deltaX;
    this.wheelDelta.y += event.deltaY;

    const adaptedEvent = this.mapEvent(event);
    this.onWheel(adaptedEvent);
  };

  public registerListeners(): void {
    this.view.addEventListener('pointermove', this.resetDelta);
    this.view.addEventListener('wheel', this.wheelCallback);
  }

  public unregisterListeners(): void {
    this.view.removeEventListener('pointermove', this.resetDelta);
    this.view.removeEventListener('wheel', this.wheelCallback);
  }

  protected mapEvent(event: WheelEvent): AdaptedEvent {
    return {
      x: event.clientX + this.wheelDelta.x,
      y: event.clientY + this.wheelDelta.y,
      offsetX: event.offsetX - event.deltaX,
      offsetY: event.offsetY - event.deltaY,
      pointerId: -1,
      eventType: EventTypes.MOVE,
      pointerType: PointerType.OTHER,
      time: event.timeStamp,
      // @ts-ignore It does exist, but it's deprecated
      wheelDeltaY: event.wheelDeltaY,
    };
  }

  public resetManager(): void {
    super.resetManager();
  }
}
