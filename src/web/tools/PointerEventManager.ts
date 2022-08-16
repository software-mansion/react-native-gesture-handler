import { AdaptedEvent, EventTypes, MouseButtons } from '../interfaces';
import EventManager from './EventManager';

export default class PointerEventManager extends EventManager {
  public setListeners(): void {
    this.view.addEventListener('pointerdown', (event: PointerEvent): void => {
      if (!this.isPointerInBounds({ x: event.clientX, y: event.clientY })) {
        return;
      }

      const adaptedEvent: AdaptedEvent = this.mapEvent(event, EventTypes.DOWN);
      const target = event.target as HTMLElement;

      target.setPointerCapture(adaptedEvent.pointerId);
      this.markAsInBounds(adaptedEvent.pointerId);

      if (++this.activePointersCounter > 1) {
        adaptedEvent.eventType = EventTypes.ADDITIONAL_POINTER_DOWN;
        this.onPointerAdd(adaptedEvent);
        return;
      }

      this.onPointerDown(adaptedEvent);
    });

    this.view.addEventListener('pointerup', (event: PointerEvent): void => {
      if (this.activePointersCounter === 0) {
        return;
      }

      const adaptedEvent: AdaptedEvent = this.mapEvent(event, EventTypes.UP);
      const target = event.target as HTMLElement;

      target.releasePointerCapture(adaptedEvent.pointerId);
      this.markAsOutOfBounds(adaptedEvent.pointerId);

      if (--this.activePointersCounter > 0) {
        adaptedEvent.eventType = EventTypes.ADDITIONAL_POINTER_UP;
        this.onPointerRemove(adaptedEvent);
        return;
      }

      this.onPointerUp(adaptedEvent);
    });

    this.view.addEventListener('pointermove', (event: PointerEvent): void => {
      if (
        event.pointerType === 'mouse' &&
        event.buttons !== MouseButtons.LEFT
      ) {
        return;
      }

      const adaptedEvent: AdaptedEvent = this.mapEvent(event, EventTypes.MOVE);

      const inBounds: boolean = this.isPointerInBounds({
        x: adaptedEvent.x,
        y: adaptedEvent.y,
      });

      const pointerIndex: number = this.pointersInBounds.indexOf(
        adaptedEvent.pointerId
      );

      if (inBounds) {
        if (pointerIndex < 0) {
          adaptedEvent.eventType = EventTypes.ENTER;
          this.onPointerEnter(adaptedEvent);
          this.markAsInBounds(adaptedEvent.pointerId);
        } else {
          this.onPointerMove(adaptedEvent);
        }
      } else {
        if (pointerIndex >= 0) {
          adaptedEvent.eventType = EventTypes.OUT;
          this.onPointerOut(adaptedEvent);
          this.markAsOutOfBounds(adaptedEvent.pointerId);
        } else {
          this.onPointerOutOfBounds(adaptedEvent);
        }
      }
    });

    this.view.addEventListener('pointercancel', (event: PointerEvent): void => {
      const adaptedEvent: AdaptedEvent = this.mapEvent(
        event,
        EventTypes.CANCEL
      );

      this.onPointerCancel(adaptedEvent);
      this.markAsOutOfBounds(adaptedEvent.pointerId);
      this.activePointersCounter = 0;
    });
  }

  protected mapEvent(event: PointerEvent, eventType: EventTypes): AdaptedEvent {
    return {
      x: event.clientX,
      y: event.clientY,
      offsetX: event.offsetX,
      offsetY: event.offsetY,
      pointerId: event.pointerId,
      eventType: eventType,
      pointerType: event.pointerType,
      buttons: event.buttons,
      time: event.timeStamp,
    };
  }
}
