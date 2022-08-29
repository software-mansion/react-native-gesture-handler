import {
  AdaptedEvent,
  EventTypes,
  MouseButtons,
  TouchEventType,
} from '../interfaces';
import EventManager from './EventManager';

export default class TouchEventManager extends EventManager {
  public setListeners(): void {
    this.view.addEventListener('touchstart', (event: TouchEvent) => {
      // if (
      //   this.view.hasAttribute('role') &&
      //   this.view.getAttribute('role') === 'button'
      // ) {
      //   //For now it solves issue with nested touchables, but disables rows
      //   event.stopPropagation();
      // }
      for (let i = 0; i < event.changedTouches.length; ++i) {
        const adaptedEvent: AdaptedEvent = this.mapEvent(
          event,
          EventTypes.DOWN,
          i,
          TouchEventType.DOWN
        );

        if (
          !this.isPointerInBounds({
            x: adaptedEvent.x,
            y: adaptedEvent.y,
          })
        ) {
          continue;
        }

        this.markAsInBounds(adaptedEvent.pointerId);

        if (++this.activePointersCounter > 1) {
          adaptedEvent.eventType = EventTypes.ADDITIONAL_POINTER_DOWN;
          this.onPointerAdd(adaptedEvent);
          continue;
        }

        this.onPointerDown(adaptedEvent);
      }
    });

    this.view.addEventListener('touchmove', (event: TouchEvent) => {
      for (let i = 0; i < event.changedTouches.length; ++i) {
        const adaptedEvent: AdaptedEvent = this.mapEvent(
          event,
          EventTypes.MOVE,
          i,
          TouchEventType.MOVE
        );

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
      }
    });

    this.view.addEventListener('touchend', (event: TouchEvent) => {
      if (this.activePointersCounter === 0) {
        return;
      }

      for (let i = 0; i < event.changedTouches.length; ++i) {
        const adaptedEvent: AdaptedEvent = this.mapEvent(
          event,
          EventTypes.UP,
          i,
          TouchEventType.UP
        );

        this.markAsOutOfBounds(adaptedEvent.pointerId);

        if (--this.activePointersCounter > 0) {
          adaptedEvent.eventType = EventTypes.ADDITIONAL_POINTER_UP;
          this.onPointerRemove(adaptedEvent);
          continue;
        }

        this.onPointerUp(adaptedEvent);
      }
    });

    this.view.addEventListener('touchcancel', (event: TouchEvent) => {
      for (let i = 0; i < event.changedTouches.length; ++i) {
        const adaptedEvent: AdaptedEvent = this.mapEvent(
          event,
          EventTypes.CANCEL,
          i,
          TouchEventType.CANCELLED
        );

        this.onPointerCancel(adaptedEvent);
        this.markAsOutOfBounds(adaptedEvent.pointerId);
        this.activePointersCounter = 0;
      }
    });
  }

  protected mapEvent(
    event: TouchEvent,
    eventType: EventTypes,
    index: number,
    touchEventType: TouchEventType
  ): AdaptedEvent {
    const rect = this.view.getBoundingClientRect();
    const clientX = event.changedTouches[index].clientX;
    const clientY = event.changedTouches[index].clientY;

    return {
      x: clientX,
      y: clientY,
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
      pointerId: event.changedTouches[index].identifier,
      eventType: eventType,
      pointerType: 'touch',
      buttons: MouseButtons.NONE,
      time: event.timeStamp,
      allTouches: event.touches,
      changedTouches: event.changedTouches,
      touchEventType: touchEventType,
    };
  }
}
